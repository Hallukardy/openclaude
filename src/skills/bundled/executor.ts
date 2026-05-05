import { readFileSync } from 'fs'
import { join } from 'path'
import { registerBundledSkill } from '../bundledSkills.js'

const EXECUTOR_SPEC = readFileSync(
  join(process.cwd(), '.openclaude/agents/executor.md'),
  'utf-8',
)

export function registerExecutorAgent(): void {
  registerBundledSkill({
    name: 'gsd-executor',
    description:
      'Executes OpenClaude plans with atomic commits, deviation handling, checkpoint protocols, and state management.',
    whenToUse:
      'When you have a PLAN.md and need to execute it atomically with per-task commits and deviation tracking.',
    userInvocable: true,
    context: 'fork',
    model: 'claude-opus-4-7',
    async getPromptForCommand(args) {
      let prompt = EXECUTOR_SPEC
      if (args) {
        prompt += `\n\n## Plan to Execute\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
