import { defineStore } from 'pinia'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resume: {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
    },
  }),
  actions: {
    updateResume(newData) {
      this.resume = { ...this.resume, ...newData }
    },
    updatePersonalInfo(info) {
      this.resume.personalInfo = { ...this.resume.personalInfo, ...info }
    },
  },
})