import { axios } from '../lib/axios.js'
import { Resume } from '../../core/domain/resume/Resume.js'

export class HttpResumeRepository {
  async create(resumeData) {
    const response = await axios.post('/api/resumes', resumeData)
    return new Resume(response.data.data.resume.id, response.data.data.resume.title, response.data.data.resume.templateId, response.data.data.resume.sections)
  }

  async list() {
    const response = await axios.get('/api/resumes')
    return response.data.data.resumes.map(r => new Resume(r.id, r.title, r.templateId))
  }

  async get(id) {
    const response = await axios.get(`/api/resumes/${id}`)
    return new Resume(response.data.data.resume.id, response.data.data.resume.title, response.data.data.resume.templateId, response.data.data.resume.sections)
  }

  async update(id, resumeData) {
    const response = await axios.put(`/api/resumes/${id}`, resumeData)
    return new Resume(response.data.data.resume.id, response.data.data.resume.title, response.data.data.resume.templateId, response.data.data.resume.sections)
  }

  async delete(id) {
    await axios.delete(`/api/resumes/${id}`)
  }

  async listTemplates() {
    const response = await axios.get('/api/templates')
    return response.data.data.templates
  }

  async download(id, format) {
    const response = await axios.get(`/api/resumes/${id}/export?format=${format}`, {
      responseType: 'blob',
    })
    return response.data
  }

  async calculateAtsScore(resumeText, jobDescription) {
    const response = await axios.post('/api/resumes/calculate-ats-score', {
      resumeText,
      jobDescription
    })
    return response.data.data
  }
}