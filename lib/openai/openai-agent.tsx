export type Message = {
  role: "user" | "agent" | "assistant"
  content: string
}

type AgentOptions = {
  name: string
  instructions: string
  model: string
}

export const createAgent = (name: string, instructions: string): AgentOptions => ({
  name,
  instructions,
  model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
})

export const executeAgentChat = async (
  name: string,
  instructions: string,
  messages: Message[],
) => {
  const agent = createAgent(name, instructions)
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured")
  }

  const history = messages.map((message) => ({
    role: message.role === "agent" ? "assistant" : message.role,
    content: message.content,
  }))

  const groqMessages = [
    ...(agent.instructions.trim()
      ? [{ role: "system" as const, content: agent.instructions }]
      : []),
    ...history,
  ]

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: agent.model, messages: groqMessages }),
    cache: "no-store",
  })

  const result = await response.json()
  if (!response.ok) {
    throw new Error(result?.error?.message || "Groq could not generate a response")
  }

  const output = result?.choices?.[0]?.message?.content
  if (typeof output !== "string" || !output.trim()) {
    throw new Error("Groq returned an empty response")
  }

  return output
}
