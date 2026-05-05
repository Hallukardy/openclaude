import { readFileSync } from 'fs'
import { join } from 'path'
import { registerBundledSkill } from '../bundledSkills.js'

const DEBUGGER_SPEC = readFileSync(
  join(process.cwd(), '.openclaude/agents/debugger.md'),
  'utf-8',
)

export function registerDebuggerAgent(): void {
  registerBundledSkill({
    name: 'gsd-debugger',
    description:
      'Investigates bugs using scientific method with hypothesis-driven debugging, iterative refinement, and systematic testing.',
    whenToUse:
      'When you have a bug to investigate and need systematic hypothesis-driven debugging with root cause identification.',
    userInvocable: true,
    context: 'fork',
    model: 'claude-opus-4-7',
    async getPromptForCommand(args) {
      let prompt = DEBUGGER_SPEC
      if (args) {
        prompt += `\n\n## Bug to Debug\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
