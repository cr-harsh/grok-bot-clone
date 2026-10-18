import { agentResponseSchema, type AgentResponse } from "./agent-response-schema"

export type Message = {
  role: "user" | "agent" | "assistant"
  content: string
}

type CatalogTool = { slug: string; name: string; description: string }
type GroqMessage = Record<string, unknown>
type GroqTool = {
  type: "function"
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

export const buildAgentInstructions = (
  agentName: string,
  customInstructions: string,
  availableTools: CatalogTool[],
  timezone: string,
) => `You are ${agentName}.\n${customInstructions}\n\nUser timezone: ${timezone}\nCurrent date in the user's timezone: ${currentDateInTimezone(timezone)}\n\nAvailable app catalog:\n${availableTools
  .map((tool) => `- ${tool.slug}: ${tool.name} — ${tool.description}`)
  .join("\n")}\n\nReturn one JSON object with fields type, message, questions, suggestedTools, routine. type must be message, clarification, routine, or tool_connection. questions and suggestedTools are arrays; routine is an object or null. For recurring requests, always draft a routine and never execute the action immediately. Treat “every [time]” as daily unless the user specifies days. Convert the requested time to HH:mm. Use the supplied timezone and today's date when the user omits timezone or start date. Infer a sensible, low-risk default for unspecified message content (for example, a friendly “Good morning!” greeting) and describe that default in the routine instructions instead of asking the user to provide it. Ask a clarification only when an essential detail cannot be reasonably inferred. Include every required routine field: name, goal, instructions, schedule (startDate, time, timezone, frequency, weekDays), and tools. For an action requiring an app that is unavailable in the connected tools, use tool_connection and suggest only tool slugs from the catalog. Never claim a routine has been scheduled or an action has succeeded unless that actually happened.`

const weekdayCodes: Record<string, { code: "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU"; aliases: string[] }> = {
  monday: { code: "MO", aliases: ["mon", "monday"] },
  tuesday: { code: "TU", aliases: ["tue", "tues", "tuesday"] },
  wednesday: { code: "WE", aliases: ["wed", "wednesday"] },
  thursday: { code: "TH", aliases: ["thu", "thur", "thurs", "thursday"] },
  friday: { code: "FR", aliases: ["fri", "friday"] },
  saturday: { code: "SA", aliases: ["sat", "saturday"] },
  sunday: { code: "SU", aliases: ["sun", "sunday"] },
}

function currentDateInTimezone(timezone: string) {
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date())
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

function inferToolConnectionRequest(text: string, availableTools: CatalogTool[]): AgentResponse | null {
  const normalized = text.toLowerCase()
  if (!/\b(connect|authorize|link)\b/.test(normalized)) return null

  const matches = availableTools.filter((tool) => {
    const name = tool.name.toLowerCase()
    const slug = tool.slug.toLowerCase()
    return normalized.includes(name) || normalized.includes(slug)
  })
  if (!matches.length) return null

  return {
    type: "tool_connection",
    message: `Choose an app below to connect ${matches.length === 1 ? "it" : "them"} to your agent.`,
    questions: [],
    suggestedTools: matches.map(({ slug, name }) => ({ slug, reason: `Connect your ${name} account to let the agent use it.` })),
    routine: null,
  }
}

function inferRoutineRequest(text: string, timezone: string, availableTools: CatalogTool[]): AgentResponse | null {
  const normalized = text.toLowerCase()
  const recurring = /\b(every|each day|daily|every day|every morning|every weekday|weekly)\b/.test(normalized)
  if (!recurring) return null

  const twelveHourTime = normalized.match(/\b(?:at\s*)?(\d{1,2})(?::([0-5]\d))?\s*(a\.?m\.?|p\.?m\.?)\b/)
  const twentyFourHourTime = normalized.match(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/)
  let hour: number
  let minute: string
  if (twelveHourTime) {
    hour = Number(twelveHourTime[1]) % 12
    if (twelveHourTime[3].startsWith("p")) hour += 12
    minute = twelveHourTime[2] ?? "00"
  } else if (twentyFourHourTime) {
    hour = Number(twentyFourHourTime[1])
    minute = twentyFourHourTime[2]
  } else if (/\bmorning\b/.test(normalized)) {
    hour = 8
    minute = "00"
  } else if (/\bnoon\b/.test(normalized)) {
    hour = 12
    minute = "00"
  } else if (/\bevening\b/.test(normalized)) {
    hour = 18
    minute = "00"
  } else {
    return null
  }

  const requestedDays = Object.values(weekdayCodes)
    .filter(({ aliases }) => aliases.some((alias) => new RegExp(`\\b${alias}\\b`).test(normalized)))
    .map(({ code }) => code)
  const weekdaysOnly = /\bweekdays?\b/.test(normalized)
  const weekDays = weekdaysOnly ? ["MO", "TU", "WE", "TH", "FR"] as const : requestedDays
  const frequency = weekDays.length ? "weekly" : "daily"

  const matchedTool = availableTools.find((tool) =>
    normalized.includes(tool.name.toLowerCase()) || normalized.includes(tool.slug.toLowerCase()),
  )
  const appMention = normalized.match(/\b(slack|gmail|outlook|discord|notion)\b/)?.[1]
  const toolSlug = matchedTool?.slug ?? appMention
  const toolName = matchedTool?.name ?? (appMention ? appMention[0].toUpperCase() + appMention.slice(1) : "")
  const hasGreeting = /\bgreet(?:ing)?\b|\bhello\b|\bgood morning\b/.test(normalized)
  const task = hasGreeting ? "greeting" : "scheduled task"
  const destination = toolName ? ` to ${toolName}` : ""
  const time = `${String(hour).padStart(2, "0")}:${minute}`
  const routineName = `${frequency === "daily" ? "Daily" : "Weekly"}${toolName ? ` ${toolName}` : ""} ${hasGreeting ? "greeting" : "routine"}`
  const instructions = hasGreeting
    ? `Send a friendly greeting${toolName ? ` to ${toolName}` : ""}, such as “Good morning!”.`
    : `Perform this task: ${text.trim()}`

  return {
    type: "routine",
    message: `I drafted a ${frequency} ${task}${destination} for ${time} (${timezone}). Review the proposal below before setting it up.`,
    questions: [],
    suggestedTools: [],
    routine: {
      name: routineName,
      goal: text.trim(),
      instructions,
      schedule: {
        startDate: currentDateInTimezone(timezone),
        time,
        timezone,
        frequency,
        weekDays: [...weekDays],
      },
      tools: toolSlug ? [{ slug: toolSlug, reason: `Needed to send the ${task}${destination}.` }] : [],
    },
  }
}

async function groqRequest(apiKey: string, body: Record<string, unknown>) {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result?.error?.message || "Groq could not generate a response")
  return result
}

export async function executeAgentChat(
  name: string,
  instructions: string,
  messages: Message[],
  session: any | null,
  availableTools: CatalogTool[],
  timezone = "UTC",
): Promise<AgentResponse> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured")

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")
  if (latestUserMessage) {
    const connectionRequest = inferToolConnectionRequest(latestUserMessage.content, availableTools)
    if (connectionRequest) return connectionRequest
    const routineDraft = inferRoutineRequest(latestUserMessage.content, timezone, availableTools)
    if (routineDraft) return routineDraft
  }

  const system = buildAgentInstructions(name, instructions, availableTools, timezone)
  const history: GroqMessage[] = messages.map(({ role, content }) => ({
    role: role === "agent" ? "assistant" : role,
    content,
  }))

  let tools: GroqTool[] = []
  if (session) {
    const toolList = await session.tools()
    tools = (Array.isArray(toolList) ? toolList : []).map((entry: any) => {
      const fn = entry?.function ?? entry
      return {
        type: "function" as const,
        function: {
          name: fn.name ?? entry.name,
          description: fn.description ?? entry.description ?? "",
          parameters: fn.parameters ?? entry.parameters ?? { type: "object", properties: {} },
        },
      }
    }).filter((tool) => typeof tool.function.name === "string")
  }

  for (let turn = 0; turn < 6; turn += 1) {
    const result = await groqRequest(apiKey, {
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      messages: [{ role: "system", content: system }, ...history],
      ...(tools.length ? { tools, tool_choice: "auto" } : {}),
      ...(tools.length ? {} : { response_format: { type: "json_object" } }),
    })

    const assistant = result?.choices?.[0]?.message
    if (!assistant) throw new Error("Groq returned an empty response")

    if (Array.isArray(assistant.tool_calls) && assistant.tool_calls.length) {
      if (!session) throw new Error("Groq requested a tool without an active Composio session")
      history.push({ role: "assistant", content: assistant.content ?? null, tool_calls: assistant.tool_calls })

      for (const call of assistant.tool_calls) {
        let args: Record<string, unknown>
        try {
          args = JSON.parse(call.function.arguments || "{}")
        } catch {
          throw new Error(`Groq returned invalid arguments for ${call.function.name}`)
        }
        const execution = await session.execute(call.function.name, args)
        history.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(execution),
        })
      }
      continue
    }

    if (typeof assistant.content !== "string" || !assistant.content.trim()) {
      throw new Error("Groq returned an empty response")
    }
    let parsed: unknown
    try {
      parsed = JSON.parse(assistant.content)
    } catch {
      parsed = { type: "message", message: assistant.content, questions: [], suggestedTools: [], routine: null }
    }
    const validated = agentResponseSchema.safeParse(parsed)
    if (!validated.success) {
      return {
        type: "message",
        message: typeof (parsed as any)?.message === "string" ? (parsed as any).message : assistant.content,
        questions: [],
        suggestedTools: [],
        routine: null,
      }
    }
    return validated.data
  }

  throw new Error("Agent exceeded the maximum number of tool calls")
}
