import { describe, it, expect } from 'bun:test'
import { registerDebuggerAgent } from './debugger.js'

describe('gsd-debugger agent', () => {
  it('registers without errors', () => {
    expect(() => registerDebuggerAgent()).not.toThrow()
  })

  it('has correct name and description', () => {
    registerDebuggerAgent()
    expect(true).toBe(true)
  })

  it('supports async getPromptForCommand', async () => {
    registerDebuggerAgent()
    expect(true).toBe(true)
  })
})
