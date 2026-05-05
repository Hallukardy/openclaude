export interface AgentDefinition {
  name: string
  description: string
  role: string
  tools: string[]
  completionMarkers: string[]
  context?: 'inline' | 'fork'
  model?: string
}

export interface AgentTask {
  id: string
  type: 'standard' | 'checkpoint' | 'review' | 'debug'
  action: string
  verify?: string
  acceptance_criteria?: string[]
  files?: string[]
}

export interface AgentPlan {
  objective: string
  tasks: AgentTask[]
  verification: string
  success_criteria: string[]
  dependencies?: Record<string, string[]>
}

export interface CheckpointState {
  taskId: string
  completedTasks: string[]
  pendingTasks: string[]
  reason?: string
  restoreInstructions?: string
}

export interface ReviewFinding {
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  file: string
  line: number
  issue: string
  fix: string
  cwe?: string
}

export interface ReviewResult {
  findings: ReviewFinding[]
  summary: string
  depth: 'quick' | 'standard' | 'deep'
  filesReviewed: string[]
  timestamp: string
}

export interface AgentResult {
  success: boolean
  output: string
  completionMarker?: string
  artifacts?: Record<string, string>
  checkpointState?: CheckpointState
  reviewResult?: ReviewResult
}
