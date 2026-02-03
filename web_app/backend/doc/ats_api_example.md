# ATS Score API - Frontend Integration Guide

## Endpoint

```
POST /api/resumes/calculate-ats-score
```

**Authentication:** Requires JWT token in `Authorization: Bearer <token>` header.

## Request Body

```json
{
  "resumeText": "Senior JavaScript developer with React and Node.js expertise. Built scalable applications.",
  "jobDescription": "Looking for JavaScript developer with React, Angular, and Python skills."
}
```

## Response Structure

```json
{
  "score": 60,
  "matchedKeywords": ["developer", "javascript", "react"],
  "missedKeywords": ["angular", "python"],
  "resumeKeywords": ["applications", "developer", "expertise", "javascript", "react", "scalable", "senior"],
  "jobDescriptionKeywords": ["angular", "developer", "javascript", "python", "react"],
  "totalKeywords": 5,
  "metadata": {
    "resumeLength": 93,
    "jobDescriptionLength": 75,
    "matchRate": 0.6,
    "resumeKeywordCount": 7,
    "jobKeywordCount": 5,
    "matchedCount": 3,
    "missedCount": 2
  }
}
```

## Response Fields

### Core Fields

- **`score`** (number, 0-100): Overall ATS compatibility score
  - Calculated as: `(matchedKeywords.length / totalKeywords) * 100`
  - Example: 60 means 60% of job description keywords are in the resume

### Keyword Arrays (all sorted alphabetically)

- **`matchedKeywords`** (string[]): Keywords found in BOTH resume and job description
  - **Frontend use:** Highlight these in GREEN in the resume
  - Example: `["developer", "javascript", "react"]`

- **`missedKeywords`** (string[]): Keywords in job description but MISSING from resume
  - **Frontend use:** Display these in RED in a "Missing Keywords" section
  - Example: `["angular", "python"]`

- **`resumeKeywords`** (string[]): ALL keywords extracted from the resume
  - **Frontend use:** Complete list of resume terms for analysis/display
  - Example: `["applications", "developer", "expertise", "javascript", "react", "scalable", "senior"]`

- **`jobDescriptionKeywords`** (string[]): ALL keywords extracted from job description
  - **Frontend use:** Reference list for job requirements
  - Example: `["angular", "developer", "javascript", "python", "react"]`

- **`totalKeywords`** (number): Total number of keywords in job description
  - **Backwards compatibility field** - same as `jobDescriptionKeywords.length`

### Metadata Object

- **`resumeLength`**: Character count of resume text
- **`jobDescriptionLength`**: Character count of job description
- **`matchRate`**: Decimal representation of match percentage (0.6 = 60%)
- **`resumeKeywordCount`**: Number of keywords in resume (`resumeKeywords.length`)
- **`jobKeywordCount`**: Number of keywords in job description (`jobDescriptionKeywords.length`)
- **`matchedCount`**: Number of matched keywords (`matchedKeywords.length`)
- **`missedCount`**: Number of missed keywords (`missedKeywords.length`)

## Frontend Implementation Examples

### 1. Display ATS Score with Visual Indicator

```javascript
const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

<div className={`text-4xl font-bold ${getScoreColor(response.score)}`}>
  {response.score}%
</div>
<p className="text-sm text-gray-600">
  {response.metadata.matchedCount} of {response.metadata.jobKeywordCount} keywords matched
</p>
```

### 2. Highlight Matched Keywords in Resume

```javascript
// Highlight matched keywords in green
const highlightResumeText = (text, matchedKeywords) => {
  let highlightedText = text;
  
  matchedKeywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    highlightedText = highlightedText.replace(
      regex, 
      `<span class="bg-green-200 font-semibold">$&</span>`
    );
  });
  
  return highlightedText;
};
```

### 3. Display Missing Keywords Alert

```javascript
{response.missedKeywords.length > 0 && (
  <div className="border-l-4 border-red-500 bg-red-50 p-4">
    <h3 className="font-semibold text-red-800">
      Missing Keywords ({response.metadata.missedCount})
    </h3>
    <div className="mt-2 flex flex-wrap gap-2">
      {response.missedKeywords.map(keyword => (
        <span 
          key={keyword}
          className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
        >
          {keyword}
        </span>
      ))}
    </div>
    <p className="mt-2 text-sm text-red-600">
      Consider adding these keywords to improve your ATS score
    </p>
  </div>
)}
```

### 4. Keyword Breakdown Dashboard

```javascript
<div className="grid grid-cols-3 gap-4">
  <div className="bg-blue-50 p-4 rounded">
    <div className="text-2xl font-bold text-blue-700">
      {response.metadata.resumeKeywordCount}
    </div>
    <div className="text-sm text-blue-600">Total Resume Keywords</div>
  </div>
  
  <div className="bg-green-50 p-4 rounded">
    <div className="text-2xl font-bold text-green-700">
      {response.metadata.matchedCount}
    </div>
    <div className="text-sm text-green-600">Matched Keywords</div>
  </div>
  
  <div className="bg-red-50 p-4 rounded">
    <div className="text-2xl font-bold text-red-700">
      {response.metadata.missedCount}
    </div>
    <div className="text-sm text-red-600">Missing Keywords</div>
  </div>
</div>
```

## Error Handling

### Validation Errors (400)

```json
{
  "error": "Validation error",
  "details": {
    "resumeText": ["required field", "must be a non-empty string"]
  }
}
```

### Text Too Long (413)

```json
{
  "error": "Text too long",
  "field": "resumeText",
  "actualLength": 60000,
  "maxLength": 50000
}
```

### Authentication Error (401)

```json
{
  "error": "Unauthorized"
}
```

## Keyword Extraction Logic

### What Keywords Are Extracted?

1. **Technical Terms** (prioritized): 350+ technical terms including:
   - Programming languages: `javascript`, `python`, `java`, `typescript`, `ruby`, etc.
   - Frameworks: `react`, `angular`, `vue`, `django`, `rails`, `spring`, etc.
   - Tools & Technologies: `docker`, `kubernetes`, `aws`, `git`, `jenkins`, etc.
   - Methodologies: `agile`, `scrum`, `devops`, `testing`, etc.

2. **General Keywords** (length >= 6 characters):
   - `leadership`, `scalable`, `applications`, `expertise`, etc.

### What Is Filtered Out?

1. **Stop Words** (200+ common words):
   - Articles: `a`, `an`, `the`
   - Pronouns: `i`, `you`, `he`, `she`, `it`, `we`, `they`
   - Common verbs: `have`, `make`, `get`, `go`, `work`, etc.
   - Generic terms: `experience`, `responsible`, `knowledge`, `skills`, etc.

2. **Short Words** (< 3 characters):
   - `is`, `or`, `my`, `in`, etc.

3. **Numbers-Only**:
   - `2024`, `5`, `100`, etc.

### Text Normalization

- **Case insensitive**: `JavaScript` = `javascript` = `JAVASCRIPT`
- **Hyphen/slash handling**: `full-stack` → `full stack`, `CI/CD` → `CI CD`
- **Multiple spaces normalized**: `React    Developer` → `react developer`

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:8787/api/resumes/calculate-ats-score \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "Senior JavaScript developer with React expertise",
    "jobDescription": "Looking for JavaScript developer with React and Angular"
  }'
```

### Using Fetch API

```javascript
const response = await fetch('/api/resumes/calculate-ats-score', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    resumeText: resume.content,
    jobDescription: jobPosting.description
  })
});

const data = await response.json();

if (response.ok) {
  // Success - display ATS score and keywords
  displayAtsResults(data);
} else {
  // Error handling
  handleError(data.error);
}
```

## Best Practices

1. **Visual Hierarchy**: Display score prominently, then matched/missed keywords
2. **Actionable Feedback**: Show missing keywords with suggestions to add them
3. **Progressive Enhancement**: Show basic score first, then expand to keyword details
4. **Loading States**: ATS calculation is fast (~100-300ms) but show loading indicator
5. **Caching**: Consider caching results for same resume/JD combination
6. **Accessibility**: Use ARIA labels for screen readers describing score significance
7. **Mobile-Friendly**: Ensure keyword chips wrap properly on small screens

## Performance Characteristics

- **Average Response Time**: 100-300ms
- **Maximum Text Size**: 50,000 characters per field
- **Scalability**: No external AI calls, deterministic algorithm
- **Rate Limiting**: Standard API rate limits apply
