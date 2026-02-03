// application/calculate_ats_score/keyword_config.js

/**
 * Configuration for keyword extraction and ATS scoring
 */
export const ATS_CONFIG = {
  // Maximum text length for processing
  MAX_TEXT_LENGTH: 50000,
  
  // Minimum keyword length
  MIN_KEYWORD_LENGTH: 3,
  
  // Minimum length for non-technical terms to be considered
  MIN_GENERAL_KEYWORD_LENGTH: 6,
};

/**
 * Common stop words to filter out during keyword extraction
 * These are extremely common words that don't contribute to ATS scoring
 */
export const STOP_WORDS = new Set([
  // Articles & Determiners
  'a', 'an', 'the',
  
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'mine', 'yours', 'hers', 'ours', 'theirs',
  'this', 'that', 'these', 'those',
  'who', 'what', 'which', 'where', 'when', 'why', 'how',
  
  // Prepositions
  'in', 'on', 'at', 'by', 'for', 'from', 'to', 'with', 'of', 'about',
  'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'over', 'against', 'within', 'without',
  
  // Conjunctions
  'and', 'or', 'but', 'nor', 'so', 'yet',
  
  // Auxiliary Verbs & Common Verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'done',
  'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could',
  
  // Common Generic Verbs (typically not ATS-relevant)
  'make', 'made', 'making',
  'get', 'got', 'getting',
  'go', 'went', 'going', 'gone',
  'come', 'came', 'coming',
  'take', 'took', 'taking', 'taken',
  'see', 'saw', 'seeing', 'seen',
  'know', 'knew', 'knowing', 'known',
  'think', 'thought', 'thinking',
  'look', 'looked', 'looking',
  'want', 'wanted', 'wanting',
  'give', 'gave', 'giving', 'given',
  'use', 'used', 'using',
  'find', 'found', 'finding',
  'tell', 'told', 'telling',
  'ask', 'asked', 'asking',
  'work', 'worked', 'working',
  'seem', 'seemed', 'seeming',
  'feel', 'felt', 'feeling',
  'try', 'tried', 'trying',
  'leave', 'left', 'leaving',
  'call', 'called', 'calling',
  
  // Common Generic Nouns/Adjectives (not ATS-relevant)
  'thing', 'things',
  'time', 'times',
  'person', 'people',
  'way', 'ways',
  'day', 'days',
  'year', 'years',
  'man', 'woman',
  'child', 'children',
  'life', 'world', 'school', 'state', 'family', 'student', 'group',
  'country', 'problem', 'hand', 'part', 'place', 'case', 'week',
  'company', 'system', 'program', 'question', 'work', 'government',
  'number', 'night', 'point', 'home', 'water', 'room', 'mother',
  'area', 'money', 'story', 'fact', 'month', 'lot', 'right', 'study',
  'book', 'eye', 'job', 'word', 'business', 'issue', 'side', 'kind',
  'head', 'house', 'service', 'friend', 'father', 'power', 'hour',
  'game', 'line', 'end', 'member', 'law', 'car', 'city', 'community',
  'name', 'president', 'team', 'minute', 'idea', 'kid', 'body', 'information',
  
  // Quantifiers & Modifiers
  'all', 'some', 'any', 'no', 'none',
  'each', 'every', 'either', 'neither',
  'both', 'few', 'many', 'much', 'more', 'most', 'less', 'least',
  'several', 'other', 'another',
  'such', 'only', 'own', 'same', 'different',
  'very', 'too', 'quite', 'rather', 'just',
  'even', 'also', 'still', 'already', 'never', 'always',
  'often', 'sometimes', 'usually',
  'now', 'then', 'here', 'there',
  'today', 'tomorrow', 'yesterday',
  
  // Generic job description filler words
  'ability', 'abilities',
  'skill', 'skills',
  'experience', 'experienced', 'experiences',
  'knowledge', 'knowledgeable',
  'understanding',
  'strong', 'stronger', 'strongest',
  'good', 'better', 'best',
  'great', 'excellent',
  'looking', 'seeking',
  'needed', 'need', 'needs',
  'required', 'require', 'requires',
  'preferred', 'prefer', 'prefers',
  'ideal', 'ideally',
  'plus', 'bonus',
]);

/**
 * Technical terms, technologies, and job-specific keywords
 * These are always considered relevant for ATS scoring
 */
export const TECHNICAL_TERMS = new Set([
  // Programming Languages
  'javascript', 'typescript', 'python', 'java', 'kotlin', 'scala',
  'csharp', 'c++', 'cpp', 'c#', 'php', 'ruby', 'go', 'golang', 'rust',
  'swift', 'objective-c', 'objectivec', 'perl', 'r', 'matlab',
  'shell', 'bash', 'powershell', 'lua', 'dart', 'elixir', 'erlang',
  'haskell', 'clojure', 'groovy', 'coffeescript',
  
  // Frontend Frameworks & Libraries
  'react', 'reactjs', 'angular', 'angularjs', 'vue', 'vuejs', 'svelte',
  'jquery', 'backbone', 'ember', 'nextjs', 'next', 'nuxt', 'gatsby',
  'redux', 'mobx', 'vuex', 'recoil', 'zustand',
  
  // Backend Frameworks
  'node', 'nodejs', 'express', 'expressjs', 'nestjs', 'fastify', 'koa',
  'django', 'flask', 'fastapi', 'pyramid',
  'spring', 'springboot', 'hibernate', 'struts',
  'laravel', 'symfony', 'codeigniter', 'yii',
  'rails', 'sinatra', 'rubyonrails',
  'aspnet', 'asp.net', 'dotnet', '.net',
  'gin', 'echo', 'fiber',
  
  // Databases
  'sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'sqlite', 'mariadb',
  'mongodb', 'mongoose', 'redis', 'memcached', 'elasticsearch', 'solr',
  'cassandra', 'dynamodb', 'couchdb', 'neo4j', 'firebase', 'firestore',
  'oracle', 'mssql', 'sqlserver', 'db2',
  
  // Cloud & Infrastructure
  'aws', 'amazon', 'azure', 'gcp', 'google-cloud', 'heroku', 'digitalocean',
  'cloudflare', 'vercel', 'netlify', 'linode', 'vultr',
  's3', 'ec2', 'lambda', 'cloudformation', 'terraform', 'ansible',
  'kubernetes', 'k8s', 'docker', 'containerization', 'microservices',
  'serverless', 'iaas', 'paas', 'saas',
  
  // DevOps & CI/CD
  'jenkins', 'travis', 'circleci', 'gitlab-ci', 'github-actions',
  'bamboo', 'teamcity', 'octopus',
  'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
  'ci/cd', 'cicd', 'continuous-integration', 'continuous-delivery',
  'devops', 'sre', 'infrastructure', 'monitoring', 'logging',
  'prometheus', 'grafana', 'datadog', 'newrelic', 'splunk',
  'nagios', 'zabbix', 'elk', 'logstash', 'kibana',
  
  // Testing
  'testing', 'test-driven', 'tdd', 'bdd',
  'jest', 'mocha', 'jasmine', 'karma', 'cypress', 'selenium', 'puppeteer',
  'playwright', 'testcafe', 'webdriver',
  'junit', 'testng', 'pytest', 'unittest', 'rspec',
  'unit-testing', 'integration-testing', 'e2e-testing', 'end-to-end',
  
  // Mobile Development
  'android', 'ios', 'mobile', 'react-native', 'reactnative', 'flutter',
  'xamarin', 'ionic', 'cordova', 'phonegap',
  'swift', 'swiftui', 'objective-c',
  
  // Web Technologies
  'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'stylus',
  'bootstrap', 'tailwind', 'tailwindcss', 'material-ui', 'mui',
  'bulma', 'foundation', 'semantic-ui',
  'webpack', 'babel', 'rollup', 'parcel', 'vite', 'esbuild',
  'npm', 'yarn', 'pnpm',
  
  // APIs & Protocols
  'rest', 'restful', 'graphql', 'grpc', 'soap', 'websocket', 'sse',
  'api', 'apis', 'oauth', 'jwt', 'saml', 'openid',
  'http', 'https', 'tcp', 'udp', 'smtp', 'ftp', 'ssh',
  
  // Architecture & Patterns
  'microservices', 'monolith', 'soa', 'event-driven', 'cqrs',
  'mvc', 'mvvm', 'mvp', 'clean-architecture', 'hexagonal',
  'domain-driven', 'ddd', 'solid', 'design-patterns',
  
  // Methodologies
  'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'safe',
  'sprint', 'standup', 'retrospective', 'planning',
  'jira', 'confluence', 'trello', 'asana', 'notion',
  
  // Data & Analytics
  'data-science', 'machine-learning', 'ml', 'ai', 'artificial-intelligence',
  'deep-learning', 'neural-network', 'nlp', 'computer-vision',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
  'jupyter', 'tableau', 'powerbi', 'looker', 'metabase',
  'hadoop', 'spark', 'kafka', 'airflow', 'etl',
  
  // Security
  'security', 'cybersecurity', 'penetration-testing', 'vulnerability',
  'encryption', 'cryptography', 'ssl', 'tls', 'pki',
  'owasp', 'xss', 'csrf', 'sql-injection', 'authentication',
  'authorization', 'rbac', 'sso', 'mfa', '2fa',
  
  // Operating Systems
  'linux', 'unix', 'ubuntu', 'debian', 'centos', 'redhat', 'fedora',
  'windows', 'macos', 'mac', 'freebsd',
  
  // Job Titles & Roles
  'developer', 'engineer', 'architect', 'analyst', 'designer',
  'manager', 'lead', 'principal', 'staff',
  'senior', 'junior', 'mid-level', 'entry-level',
  'frontend', 'front-end', 'backend', 'back-end',
  'fullstack', 'full-stack', 'devops',
  'data-engineer', 'data-scientist', 'ml-engineer',
  'qa', 'qe', 'sdet', 'automation-engineer',
  'product-manager', 'project-manager', 'scrum-master',
  'tech-lead', 'team-lead', 'engineering-manager',
  
  // Soft Skills (relevant to tech jobs)
  'leadership', 'collaboration', 'communication',
  'problem-solving', 'critical-thinking', 'analytical',
  'mentoring', 'coaching', 'teaching',
  
  // Other
  'version-control', 'code-review', 'pair-programming',
  'documentation', 'technical-writing',
  'debugging', 'troubleshooting', 'optimization',
  'performance', 'scalability', 'reliability', 'availability',
  'responsive', 'accessibility', 'a11y', 'i18n', 'l10n',
  'cross-browser', 'cross-platform',
]);
