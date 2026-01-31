import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DraftVersionUseCase } from './DraftVersionUseCase.js'

// Mock localStorage
const localStorageStore = new Map()
const localStorageMock = {
  getItem: vi.fn((key) => localStorageStore.get(key) || null),
  setItem: vi.fn((key, value) => localStorageStore.set(key, value)),
  clear: vi.fn(() => localStorageStore.clear()),
  removeItem: vi.fn((key) => localStorageStore.delete(key)),
}
global.localStorage = localStorageMock

describe('DraftVersionUseCase', () => {
  let useCase
  const testResumeId = 'test-resume-123'

  beforeEach(() => {
    // Clear localStorage store
    localStorageStore.clear()
    useCase = new DraftVersionUseCase('test_versions', 5) // Small limit for testing
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should save a new snapshot', () => {
    const data = { title: 'Test Resume' }
    const snapshot = useCase.saveSnapshot(testResumeId, 'Manual Save', data)

    expect(snapshot).toBeDefined()
    expect(snapshot.name).toBe('Manual Save')
    expect(snapshot.data).toEqual(data)

    const history = useCase.getHistory(testResumeId)
    expect(history).toHaveLength(1)
    expect(history[0]).toEqual(snapshot)
  })

  it('should limit the number of versions', () => {
    for (let i = 0; i < 7; i++) {
      useCase.saveSnapshot(testResumeId, 'Save ' + i, { version: i })
    }

    const history = useCase.getHistory(testResumeId)
    expect(history).toHaveLength(5) // Limited to 5
  })

  it('should merge auto-saves within 1 minute', () => {
    // Mock Date
    const originalDate = global.Date
    let mockTime = new Date('2024-01-01T10:00:00Z').getTime()
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(mockTime)
        }
        return new originalDate(...args)
      }
      static now() {
        return mockTime
      }
    }
    global.Date.prototype.toISOString = originalDate.prototype.toISOString

    // First auto-save
    const data1 = { title: 'Version 1' }
    const snap1 = useCase.saveSnapshot(testResumeId, 'Auto-save', data1)

    // Advance time by 30 seconds
    mockTime += 30 * 1000

    // Second auto-save (should merge)
    const data2 = { title: 'Version 2' }
    const snap2 = useCase.saveSnapshot(testResumeId, 'Auto-save', data2)

    // Should be the same snapshot, updated
    expect(snap2.id).toBe(snap1.id)
    expect(snap2.data).toEqual(data2)

    const history = useCase.getHistory(testResumeId)
    expect(history).toHaveLength(1)
    expect(history[0].data).toEqual(data2)

    // Restore original Date
    global.Date = originalDate
  })

  it('should not merge auto-saves after 1 minute', () => {
    const originalDate = global.Date
    let mockTime = new Date('2024-01-01T10:00:00Z').getTime()
    global.Date = class extends Date {
      constructor(...args) {
        if (args.length === 0) {
          return new originalDate(mockTime)
        }
        return new originalDate(...args)
      }
      static now() {
        return mockTime
      }
    }
    global.Date.prototype.toISOString = originalDate.prototype.toISOString

    // First auto-save
    useCase.saveSnapshot(testResumeId, 'Auto-save', { title: 'Version 1' })

    // Advance time by 2 minutes
    mockTime += 2 * 60 * 1000

    // Second auto-save (should not merge)
    useCase.saveSnapshot(testResumeId, 'Auto-save', { title: 'Version 2' })

    const history = useCase.getHistory(testResumeId)
    expect(history).toHaveLength(2)

    global.Date = originalDate
  })

  it('should not merge manual saves', () => {
    useCase.saveSnapshot(testResumeId, 'Manual Save', { title: 'Version 1' })
    useCase.saveSnapshot(testResumeId, 'Manual Save', { title: 'Version 2' })

    const history = useCase.getHistory(testResumeId)
    expect(history).toHaveLength(2)
  })

  it('should clear history', () => {
    useCase.saveSnapshot(testResumeId, 'Save', { title: 'Test' })
    expect(useCase.getHistory(testResumeId)).toHaveLength(1)

    useCase.clearHistory(testResumeId)
    expect(useCase.getHistory(testResumeId)).toHaveLength(0)
  })

  it('should delete a specific version', () => {
    const snap1 = useCase.saveSnapshot(testResumeId, 'Save 1', { title: '1' })
    const snap2 = useCase.saveSnapshot(testResumeId, 'Save 2', { title: '2' })

    expect(useCase.getHistory(testResumeId)).toHaveLength(2)

    useCase.deleteVersion(testResumeId, snap1.id)

    const history = useCase.getHistory(testResumeId)
    expect(history).toHaveLength(1)
    expect(history[0].id).toBe(snap2.id)
  })
})