/**
 * keywordMatcher.js — Professional offline CV ↔ Job Description scorer
 *
 * Works across all industries: software, marketing, finance, HR, sales,
 * operations, legal, healthcare, supply chain, and more.
 *
 * Algorithm:
 *  1. Tokenise both texts; preserve compound tokens (C++, C#, .NET, Node.js …)
 *  2. Normalise via alias map  (seo→search engine optimization, kpi→key performance indicator …)
 *  3. Suffix-strip stem        (managing→manag, development→develop …)
 *  4. Extract single keywords  (weight 1.0) + bigram phrases (weight 2.0)
 *  5. Boost repeated JD terms  (each extra occurrence adds +0.5, capped at 3.0)
 *  6. Score = Σ matched weights / Σ total weights × 100
 *  Results sorted by weight — most important terms surface first.
 */
(function () {
    'use strict';

    // ── Stop words ─────────────────────────────────────────────────────────────
    const STOP_WORDS = new Set([
        // Articles / prepositions / conjunctions
        'a','an','the','and','or','but','if','in','on','at','to','for','of','up',
        'by','as','is','it','be','do','go','no','so','we','are','not','you','all',
        'any','can','had','her','was','one','our','out','get','has','him','his',
        'how','its','may','now','own','see','two','who','did','let','put','say',
        'she','too','use','been','from','have','here','into','some','than','that',
        'them','then','they','this','will','with','come','each','give','just',
        'know','look','make','most','over','such','take','well','were','what',
        'when','your','about','after','again','could','every','first','found',
        'other','right','since','their','there','these','think','those','three',
        'under','where','which','while','before','between','during','having',
        'little','should','through','because','however','without','according',
        'therefore','although',
        // Generic job-posting boilerplate (too ubiquitous to discriminate)
        'able','also','back','both','call','case','even','feel','good','hand',
        'high','keep','kind','last','long','move','must','need','next','only',
        'open','part','play','show','side','same','seem','tell','turn','very',
        'want','work','year','years','often','place','point','still','along',
        'large','start','never','going','would','being','made','help','using',
        'used','many','more','much','role','team','join','grow','seek','hire',
        'apply','candidate','position','opportunity','company','strong','ability',
        'experience','skills','knowledge','required','preferred','plus',
        'responsibilities','qualifications','working','across','within','related',
        'ensure','support','provide','maintain','create','define','deliver',
        'drive','partner','identify','improve','including','understand',
        'collaborate','excellent','passionate','motivated','dedicated','oriented',
        'paced','dynamic','responsible','demonstrated','proven','effective',
        'result','results','self','analytical','organizational','interpersonal',
        'written','verbal','new','time','like',
        // Generic business boilerplate
        'achieve','achieving','success','successful','focus','focused','impact',
        'solution','solutions','strategy','strategic','vision','mission',
        'initiative','initiatives','objective','objectives','goal','goals',
        'value','values','culture','environment','process','processes',
        'performance','growth','innovation','innovative','leading','leader',
        'stakeholder','stakeholders','senior','junior','mid','level','day',
        'fast','data','driven','based','oriented','cross','functional',
        'world','class','best','practice','standard','approach','model',
        'needed','seeking','seeking','understanding','oversee','overseeing',
        'looking','require','requires','seeking','including','incumbent',
        'minimum','ideally','ideally','ideally','plus','preferred','bonus',
    ]);

    // ── Alias normalisation ─────────────────────────────────────────────────────
    // Maps abbreviations / alternate spellings to a canonical display form.
    // Covers tech, business, marketing, finance, HR, operations, legal, and more.
    const ALIASES = new Map([
        // ── Software / Languages ──────────────────────────────────────────────
        ['js',         'javascript'],
        ['ts',         'typescript'],
        ['py',         'python'],
        ['rb',         'ruby'],
        ['golang',     'go'],
        // Runtimes / frameworks
        ['nodejs',     'node.js'],
        ['reactjs',    'react'],
        ['vuejs',      'vue'],
        ['angularjs',  'angular'],
        ['expressjs',  'express'],
        ['nextjs',     'next.js'],
        // Cloud / infra
        ['gcp',        'google cloud'],
        ['k8s',        'kubernetes'],
        ['k8',         'kubernetes'],
        ['infra',      'infrastructure'],
        ['cicd',       'ci/cd'],
        // ML / AI
        ['ml',         'machine learning'],
        ['dl',         'deep learning'],
        ['nlp',        'natural language processing'],
        ['llm',        'large language model'],
        ['llms',       'large language model'],
        ['genai',      'generative ai'],
        ['rag',        'retrieval augmented generation'],
        // UX / UI
        ['ux',         'user experience'],
        ['ui',         'user interface'],
        // Engineering practices
        ['qa',         'quality assurance'],
        ['swe',        'software engineer'],
        ['fe',         'frontend'],
        ['be',         'backend'],
        ['fs',         'fullstack'],
        ['oop',        'object oriented programming'],
        ['fp',         'functional programming'],
        ['tdd',        'test driven development'],
        ['bdd',        'behaviour driven development'],
        ['ddd',        'domain driven design'],
        // Data
        ['db',         'database'],
        ['dbs',        'databases'],
        ['rdbms',      'relational database'],
        ['apis',       'api'],
        ['sdks',       'sdk'],

        // ── Business / Strategy ───────────────────────────────────────────────
        ['b2b',        'business to business'],
        ['b2c',        'business to consumer'],
        ['b2g',        'business to government'],
        ['d2c',        'direct to consumer'],
        ['gtm',        'go to market'],
        ['roi',        'return on investment'],
        ['kpi',        'key performance indicator'],
        ['kpis',       'key performance indicators'],
        ['okr',        'objectives and key results'],
        ['okrs',       'objectives and key results'],
        ['swot',       'swot analysis'],
        ['p&l',        'profit and loss'],
        ['pl',         'profit and loss'],
        ['cogs',       'cost of goods sold'],
        ['ebitda',     'ebitda'],
        ['cac',        'customer acquisition cost'],
        ['ltv',        'lifetime value'],
        ['clv',        'customer lifetime value'],
        ['arr',        'annual recurring revenue'],
        ['mrr',        'monthly recurring revenue'],
        ['arpu',       'average revenue per user'],
        ['nps',        'net promoter score'],
        ['csat',       'customer satisfaction'],
        ['sla',        'service level agreement'],
        ['slas',       'service level agreements'],

        // ── Marketing / Growth ────────────────────────────────────────────────
        ['seo',        'search engine optimization'],
        ['sem',        'search engine marketing'],
        ['ppc',        'pay per click'],
        ['ctr',        'click through rate'],
        ['cpc',        'cost per click'],
        ['cpa',        'cost per acquisition'],
        ['cpm',        'cost per mille'],
        ['smm',        'social media marketing'],
        ['crm',        'customer relationship management'],
        ['erp',        'enterprise resource planning'],
        ['cms',        'content management system'],
        ['cta',        'call to action'],
        ['a/b',        'a/b testing'],
        ['ab',         'a/b testing'],
        ['pr',         'public relations'],

        // ── SaaS / Product ────────────────────────────────────────────────────
        ['saas',       'software as a service'],
        ['paas',       'platform as a service'],
        ['iaas',       'infrastructure as a service'],
        ['mvp',        'minimum viable product'],
        ['prd',        'product requirements document'],
        ['pm',         'product management'],
        ['po',         'product owner'],

        // ── Project / Operations management ───────────────────────────────────
        ['pmp',        'project management professional'],
        ['pmi',        'project management institute'],
        ['prince2',    'prince2'],
        ['wbs',        'work breakdown structure'],
        ['raci',       'raci matrix'],
        ['sow',        'statement of work'],
        ['rfp',        'request for proposal'],
        ['rfq',        'request for quotation'],
        ['bpm',        'business process management'],
        ['bpms',       'business process management'],
        ['lean',       'lean methodology'],
        ['6sigma',     'six sigma'],
        ['kaizen',     'kaizen'],

        // ── Finance / Accounting ──────────────────────────────────────────────
        ['gaap',       'generally accepted accounting principles'],
        ['ifrs',       'international financial reporting standards'],
        ['ap',         'accounts payable'],
        ['ar',         'accounts receivable'],
        ['fp&a',       'financial planning and analysis'],
        ['fpa',        'financial planning and analysis'],
        ['dcf',        'discounted cash flow'],
        ['irr',        'internal rate of return'],
        ['npv',        'net present value'],
        ['m&a',        'mergers and acquisitions'],
        ['ipo',        'initial public offering'],
        ['pe',         'private equity'],
        ['vc',         'venture capital'],

        // ── HR / People ───────────────────────────────────────────────────────
        ['hr',         'human resources'],
        ['hris',       'hr information system'],
        ['hcm',        'human capital management'],
        ['dei',        'diversity equity inclusion'],
        ['edi',        'equality diversity inclusion'],
        ['ats',        'applicant tracking system'],
        ['ote',        'on target earnings'],
        ['l&d',        'learning and development'],
        ['ld',         'learning and development'],
        ['pip',        'performance improvement plan'],
        ['kra',        'key result area'],

        // ── Legal / Compliance ────────────────────────────────────────────────
        ['gdpr',       'data protection'],
        ['hipaa',      'healthcare compliance'],
        ['sox',        'sarbanes oxley'],
        ['pci',        'payment card industry'],
        ['kyc',        'know your customer'],
        ['aml',        'anti money laundering'],
        ['nda',        'non disclosure agreement'],
        ['ip',         'intellectual property'],
        ['esg',        'environmental social governance'],

        // ── Healthcare / Science ──────────────────────────────────────────────
        ['emr',        'electronic medical records'],
        ['ehr',        'electronic health records'],
        ['icu',        'intensive care unit'],
        ['gcp2',       'good clinical practice'],    // avoid conflict with google cloud
        ['gmp',        'good manufacturing practice'],
        ['fda',        'fda compliance'],
        // r&d / m&a / p&l / fp&a are preprocessed to 'randd'/'manda'/'pandl'/'fpanda'
        // before alias lookup — see preprocess() below
        ['randd',      'research and development'],
        ['manda',      'mergers and acquisitions'],
        ['pandl',      'profit and loss'],
        ['fpanda',     'financial planning and analysis'],
        ['landd',      'learning and development'],
        ['abtesting',  'a/b testing'],
        ['rd',         'research and development'],
        ['phd',        'phd'],
        ['mba',        'mba'],

        // ── Sales ─────────────────────────────────────────────────────────────
        ['smb',        'small and medium business'],
        ['smbs',       'small and medium business'],
        ['smbmid',     'small medium business'],
        ['mid-market', 'mid market'],
        ['bdr',        'business development representative'],
        ['sdr',        'sales development representative'],
        ['ae',         'account executive'],
        ['csm',        'customer success manager'],
        ['cs',         'customer success'],
        ['tam',        'total addressable market'],
        ['sam',        'serviceable addressable market'],

        // ── Supply chain / Logistics ──────────────────────────────────────────
        ['scm',        'supply chain management'],
        ['wms',        'warehouse management system'],
        ['erp2',       'enterprise resource planning'],   // secondary alias
        ['skus',       'sku'],
        ['3pl',        'third party logistics'],
        ['jit',        'just in time'],
        ['po2',        'purchase order'],                 // secondary alias
        // ── REST / HTTP ───────────────────────────────────────────────────────
        ['restful',    'rest'],
        ['restapi',    'rest api'],
        ['graphql',    'graphql'],
    ]);

    // ── Suffix-stripping stemmer ────────────────────────────────────────────────
    // Reduces common English inflections to a shared root so "managing",
    // "management", and "managed" all collapse to the same stem "manag".
    function stem(word) {
        const w = word.toLowerCase();
        if (w.length <= 4) return w;
        // Longest suffix first — order matters
        const rules = [
            'ations','ation','ments','ment','ness','ings',
            'ing','ers','er','ied','ies','ed','ly','es','s',
        ];
        for (const suf of rules) {
            if (w.endsWith(suf) && (w.length - suf.length) >= 4) {
                const root = w.slice(0, -suf.length);
                // Strip trailing silent 'e' (manage → manag, compute → comput)
                return (root.endsWith('e') && root.length > 4) ? root.slice(0, -1) : root;
            }
        }
        // Strip lone trailing 'e' on base forms (e.g. "code" → "cod" ← skip, too short)
        if (w.endsWith('e') && w.length > 5) return w.slice(0, -1);
        return w;
    }

    // ── Pre-processor: normalise compound tokens BEFORE any splitting ──────────
    // Must run before stripping punctuation so that C++, P&L, CI/CD etc. survive.
    function preprocess(text) {
        return text
            .toLowerCase()
            // Tech
            .replace(/\bc\+\+/g,     'cpp')
            .replace(/\bc#/g,        'csharp')
            .replace(/\.net\b/g,     'dotnet')
            .replace(/node\.js/g,    'nodejs')
            .replace(/react\.js/g,   'reactjs')
            .replace(/vue\.js/g,     'vuejs')
            .replace(/next\.js/g,    'nextjs')
            .replace(/express\.js/g, 'expressjs')
            .replace(/ci\/cd/g,      'cicd')
            // Business &-compounds (must precede generic & stripping)
            .replace(/fp&a/g,        'fpanda')
            .replace(/r&d/g,         'randd')
            .replace(/m&a/g,         'manda')
            .replace(/p&l/g,         'pandl')
            .replace(/l&d/g,         'landd')
            // A/B testing
            .replace(/\ba\/b\b/g,     'abtesting');
    }

    // ── Tokeniser ──────────────────────────────────────────────────────────────
    function tokenize(text) {
        return preprocess(text)
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length >= 2);
    }

    // ── Normalise a single token via alias map ─────────────────────────────────
    function normalise(token) {
        return ALIASES.get(token) || token;
    }

    // ── Build weighted term map from job description ───────────────────────────
    // Returns Map<key, { weight, display, isPhrase }>
    function buildJobTerms(text) {
        const terms = new Map();

        const add = (raw, weight, isPhrase) => {
            const display = isPhrase ? raw : normalise(raw);
            if (STOP_WORDS.has(display)) return;
            if (display.length < 2) return;
            // Aliases that expand to a phrase (e.g. 'ml' → 'machine learning')
            const actualPhrase = isPhrase || display.includes(' ');
            const key = actualPhrase ? display : stem(display);
            if (key.length < 2) return;
            const prev = terms.get(key);
            if (prev) {
                prev.weight = Math.min(prev.weight + 0.5, 3.0);
            } else {
                terms.set(key, { weight, display, isPhrase: actualPhrase });
            }
        };

        // Split into clauses so bigrams never straddle a sentence boundary.
        // preprocess() first so Node.js, CI/CD, P&L etc. survive the dot-split.
        const clauses = preprocess(text).split(/[.!?\n;:]+/);

        for (const clause of clauses) {
            const tokens = clause
                .replace(/[^a-z0-9\s]/g, ' ')
                .split(/\s+/)
                .filter(w => w.length >= 2);

            // Single tokens
            for (const tok of tokens) {
                const norm = normalise(tok);
                if (!STOP_WORDS.has(norm)) add(tok, 1.0, false);
            }

            // Bigrams — skip if either token is an alias-expanded phrase
            // (avoids nonsense like "search engine optimization search engine marketing")
            for (let i = 0; i < tokens.length - 1; i++) {
                const a = normalise(tokens[i]);
                const b = normalise(tokens[i + 1]);
                if (a.includes(' ') || b.includes(' ')) continue;
                if (
                    !STOP_WORDS.has(a) && !STOP_WORDS.has(b) &&
                    a.length >= 4 && b.length >= 4
                ) {
                    add(`${a} ${b}`, 2.0, true);
                }
            }
        }

        return terms;
    }

    // ── Pre-index CV text for fast multi-form lookup ───────────────────────────
    function indexCV(cvText) {
        const tokens = tokenize(cvText).map(normalise);
        return {
            // Use preprocessed raw so alias-expanded phrases can match verbatim
            raw:      preprocess(cvText).replace(/[^a-z0-9\s]/g, ' '),
            tokenSet: new Set(tokens),
            stemSet:  new Set(tokens.map(stem)),
        };
    }

    // ── Check CV for a single term (word or phrase) ────────────────────────────
    // For phrase keys we check BOTH raw text (handles written-out phrases) AND
    // tokenSet (handles when CV uses the abbreviation, e.g. 'SEO' for
    // 'search engine optimization').
    function cvHasTerm(idx, key, isPhrase) {
        if (isPhrase) return idx.raw.includes(key) || idx.tokenSet.has(key);
        return idx.stemSet.has(key) || idx.tokenSet.has(key);
    }

    // ── Public: score CV against job description ───────────────────────────────
    /**
     * @param {string} cvText
     * @param {string} jobText
     * @returns {{ score: number, matched: string[], missing: string[] }}
     */
    function scoreMatch(cvText, jobText) {
        const jobTerms = buildJobTerms(jobText);
        const cvIdx    = indexCV(cvText);

        let totalWeight   = 0;
        let matchedWeight = 0;
        const matched = [];
        const missing = [];

        for (const [key, { weight, display, isPhrase }] of jobTerms) {
            totalWeight += weight;
            if (cvHasTerm(cvIdx, key, isPhrase)) {
                matchedWeight += weight;
                matched.push({ display, weight });
            } else {
                missing.push({ display, weight });
            }
        }

        const score = totalWeight > 0
            ? Math.min(100, Math.round((matchedWeight / totalWeight) * 100))
            : 0;

        // Sort by weight descending — most important terms first
        matched.sort((a, b) => b.weight - a.weight || a.display.localeCompare(b.display));
        missing.sort((a, b) => b.weight - a.weight || a.display.localeCompare(b.display));

        return {
            score,
            matched: matched.map(x => x.display),
            missing: missing.map(x => x.display),
        };
    }

    // ── Legacy compat ──────────────────────────────────────────────────────────
    function extractKeywords(text) {
        return new Set(buildJobTerms(text).keys());
    }

    window.keywordMatcher = { extractKeywords, scoreMatch };
})();
