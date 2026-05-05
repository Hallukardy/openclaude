import { readFileSync } from 'fs'
import { join } from 'path'
import { registerBundledSkill } from '../bundledSkills.js'

const CODE_REVIEWER_SPEC = readFileSync(
  join(process.cwd(), '.openclaude/agents/code-reviewer.md'),
  'utf-8',
)

export function registerCodeReviewerAgent(): void {
  registerBundledSkill({
    name: 'gsd-code-reviewer',
    description:
      'Automated code audit with bug detection, security checks (OWASP top 10), code quality analysis, and style compliance.',
    whenToUse:
      'When you need automated code review of changed files for bugs, security issues, and quality problems.',
    userInvocable: true,
    context: 'fork',
    model: 'claude-opus-4-7',
    async getPromptForCommand(args) {
      let prompt = CODE_REVIEWER_SPEC
      if (args) {
        prompt += `\n\n## Files to Review\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
