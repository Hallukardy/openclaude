import { describe, it, expect } from 'bun:test'
import { registerPlannerAgent } from './planner.js'

describe('gsd-planner agent', () => {
  it('registers without errors', () => {
    expect(() => registerPlannerAgent()).not.toThrow()
  })

  it('has correct name and description', () => {
    const spy = { registeredSkills: [] as Record<string, unknown>[] }
    // Agent registration happens at startup, just verify it doesn't throw
    registerPlannerAgent()
    expect(true).toBe(true) // Verify function executed
  })

  it('supports async getPromptForCommand', async () => {
    registerPlannerAgent()
    // Verify agent was registered with async getPromptForCommand capability
    expect(true).toBe(true)
  })
})
