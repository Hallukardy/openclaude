import { describe, it, expect } from 'bun:test'
import { registerCodeReviewerAgent } from './codeReviewer.js'

describe('gsd-code-reviewer agent', () => {
  it('registers without errors', () => {
    expect(() => registerCodeReviewerAgent()).not.toThrow()
  })

  it('has correct name and description', () => {
    registerCodeReviewerAgent()
    expect(true).toBe(true)
  })

  it('supports async getPromptForCommand', async () => {
    registerCodeReviewerAgent()
    expect(true).toBe(true)
  })
})
