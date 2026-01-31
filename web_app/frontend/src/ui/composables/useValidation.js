import { ref, computed } from 'vue'

// Basic validation rules
const validators = {
  email: (value) => {
    if (!value) return true // Optional field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) || 'Please enter a valid email address'
  },

  phone: (value) => {
    if (!value) return true // Optional field
    // Allow various phone formats: (123) 456-7890, 123-456-7890, +1 123 456 7890, etc.
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,}$/
    return phoneRegex.test(value.replace(/\s/g, '')) || 'Please enter a valid phone number'
  },

  url: (value) => {
    if (!value) return true // Optional field
    // Basic URL regex for common formats
    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
    return urlRegex.test(value.startsWith('http') ? value : `https://${value}`) || 'Please enter a valid URL'
  },

  required: (value) => {
    return (value && value.toString().trim().length > 0) || 'This field is required'
  },

  minLength: (min) => (value) => {
    return !value || value.length >= min || `Must be at least ${min} characters`
  },

  maxLength: (max) => (value) => {
    return !value || value.length <= max || `Must be no more than ${max} characters`
  }
}

export function useValidation() {
  const errors = ref({})

  const validate = (field, value, rules) => {
    for (const rule of rules) {
      let validator
      let param

      if (typeof rule === 'string') {
        validator = validators[rule]
      } else if (typeof rule === 'object' && rule.validator) {
        validator = rule.validator
        param = rule.param
      } else {
        continue
      }

      if (validator) {
        const result = param !== undefined ? validator(param)(value) : validator(value)
        if (result !== true) {
          errors.value[field] = result
          return false
        }
      }
    }
    // Clear error if validation passes
    if (errors.value[field]) {
      delete errors.value[field]
    }
    return true
  }

  const validateAll = (fields) => {
    let isValid = true
    for (const [field, config] of Object.entries(fields)) {
      const { value, rules } = config
      if (!validate(field, value, rules)) {
        isValid = false
      }
    }
    return isValid
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const hasErrors = computed(() => Object.keys(errors.value).length > 0)

  return {
    errors: computed(() => errors.value),
    validate,
    validateAll,
    clearErrors,
    hasErrors
  }
}