import { axios } from '../lib/axios.js'

export class HttpAIService {
  async generateFromJD(jobDescription, userData, templateId = null) {
    const response = await axios.post('/api/resumes/generate-from-jd', { 
      jobDescription, 
      userData, 
      templateId 
    })
    return response.data.data.resume
  }

  async improveText(text) {
    const response = await axios.post('/api/resumes/improve-text', { text })
    return response.data.data
  }
}