import type { AgentResponse } from "@/lib/groq/agent-response-schema"

export type MessageType = {
  id: string
  role: "user" | "agent" | "assistant"
  content: string
  time: string
  response?: AgentResponse
  toolCards?: ToolConnectionCardData[]
}

export type ToolConnectionCardData = {
  slug: string
  name: string
  description: string
  icon?: string
  isConnected?: boolean
  isEnabled?: boolean
  redirectUrl?: string | null
}
