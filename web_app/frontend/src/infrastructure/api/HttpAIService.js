import { axios } from '../lib/axios.js'

export class HttpAIService {
  async generateFromJD(jobDescription, userData, templateId = null, generationSettings = null) {
    const payload = { 
      jobDescription, 
      userData
    }
    
    if (templateId) payload.templateId = templateId
    if (generationSettings) payload.generationSettings = generationSettings
    
    const response = await axios.post('/api/resumes/generate-from-jd', payload)
    return response.data.data.resume
  }

  async improveText(text) {
    const response = await axios.post('/api/resumes/improve-text', { text })
    return response.data.data
  }

  async generateSuggestions(jobDescription, resumeText) {
    const response = await axios.post('/api/resumes/generate-suggestions', { 
      jobDescription, 
      resumeText 
    })
    return response.data.data.suggestions
  }

  async parseResumeText(text) {
    const response = await axios.post('/api/resumes/parse-text', { text })
    return response.data.data
  }
}