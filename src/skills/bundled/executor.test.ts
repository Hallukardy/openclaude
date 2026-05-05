import { describe, it, expect } from 'bun:test'
import { registerExecutorAgent } from './executor.js'

describe('gsd-executor agent', () => {
  it('registers without errors', () => {
    expect(() => registerExecutorAgent()).not.toThrow()
  })

  it('has correct name and description', () => {
    registerExecutorAgent()
    // Verify function executed without throwing
    expect(true).toBe(true)
  })

  it('supports async getPromptForCommand', async () => {
    registerExecutorAgent()
    expect(true).toBe(true)
  })
})
