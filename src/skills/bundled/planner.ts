import { readFileSync } from 'fs'
import { join } from 'path'
import { registerBundledSkill } from '../bundledSkills.js'

const PLANNER_SPEC = readFileSync(
  join(process.cwd(), '.openclaude/agents/planner.md'),
  'utf-8',
)

export function registerPlannerAgent(): void {
  registerBundledSkill({
    name: 'gsd-planner',
    description:
      'Creates executable phase plans with task breakdown, dependency analysis, and goal-backward verification.',
    whenToUse:
      'When you need to plan implementation of a feature, phase, or major refactoring with dependencies and execution waves.',
    userInvocable: true,
    context: 'fork',
    model: 'claude-opus-4-7',
    async getPromptForCommand(args) {
      let prompt = PLANNER_SPEC
      if (args) {
        prompt += `\n\n## Planning Task\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
