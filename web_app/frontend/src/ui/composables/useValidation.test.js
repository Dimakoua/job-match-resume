import { describe, it, expect, beforeEach } from 'vitest'
import { useValidation } from './useValidation.js'

describe('useValidation', () => {
  let validation

  beforeEach(() => {
    validation = useValidation()
  })

  it('should validate email correctly', () => {
    expect(validation.validate('email', 'test@example.com', ['email'])).toBe(true)
    expect(validation.validate('email', 'invalid-email', ['email'])).toBe(false)
    expect(validation.errors.value.email).toBe('Please enter a valid email address')
  })

  it('should validate phone correctly', () => {
    expect(validation.validate('phone', '(555) 123-4567', ['phone'])).toBe(true)
    expect(validation.validate('phone', '+1 555 123 4567', ['phone'])).toBe(true)
    expect(validation.validate('phone', 'invalid-phone', ['phone'])).toBe(false)
    expect(validation.errors.value.phone).toBe('Please enter a valid phone number')
  })

  it('should validate URL correctly', () => {
    expect(validation.validate('url', 'https://linkedin.com/in/johndoe', ['url'])).toBe(true)
    expect(validation.validate('url', 'linkedin.com/in/johndoe', ['url'])).toBe(true)
    expect(validation.validate('url', 'invalid-url', ['url'])).toBe(false)
    expect(validation.errors.value.url).toBe('Please enter a valid URL')
  })

  it('should handle optional fields', () => {
    expect(validation.validate('email', '', ['email'])).toBe(true) // Empty is valid for optional
    expect(validation.validate('phone', '', ['phone'])).toBe(true)
    expect(validation.validate('url', '', ['url'])).toBe(true)
  })

  it('should clear errors on successful validation', () => {
    validation.validate('email', 'invalid', ['email'])
    expect(validation.errors.value.email).toBeDefined()

    validation.validate('email', 'valid@example.com', ['email'])
    expect(validation.errors.value.email).toBeUndefined()
  })
})