import { and, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { AgentConfig, db, Tools } from "@/db"
import { authOptions } from "../../auth/[...nextauth]/route"
import { executeAgentChat, type Message } from "@/lib/groq/agent"
import { getOrCreateAgentSession } from "@/lib/composio/service"

export async function POST(request: NextRequest) {
  const auth = await getServerSession(authOptions)
  if (!auth?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const payload = body as Record<string, unknown>
  const { agentId, messages } = payload
  const timezone = typeof payload.timezone === "string" ? payload.timezone : "UTC"
  if (
    typeof agentId !== "string" ||
    !Array.isArray(messages) ||
    !messages.length ||
    !messages.every((item) =>
      item && typeof item === "object" &&
      ["user", "agent", "assistant"].includes((item as Message).role) &&
      typeof (item as Message).content === "string",
    )
  ) {
    return NextResponse.json({ error: "A valid agentId and message history are required." }, { status: 400 })
  }

  const [agentConfig] = await db.select().from(AgentConfig)
    .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, auth.user.email)))
    .limit(1)
  if (!agentConfig) return NextResponse.json({ error: "Agent not found" }, { status: 404 })

  try {
    const availableTools = await db.select().from(Tools).where(eq(Tools.isActive, true))
    const catalog = availableTools.map(({ slug, name, description }) => ({ slug, name, description }))
    const enabledToolSlugs = Array.isArray(agentConfig.tools) ? agentConfig.tools : []
    const session = enabledToolSlugs.length
      ? await getOrCreateAgentSession(agentConfig as any, auth.user.email)
      : null

    const response = await executeAgentChat(
      agentConfig.name,
      agentConfig.description ?? "",
      messages as Message[],
      session,
      catalog,
      timezone,
    )
    const cardSlugs = new Set([
      ...response.suggestedTools.map(({ slug }) => slug),
      ...(response.routine?.tools.map(({ slug }) => slug) ?? []),
    ])
    const toolCards = availableTools
      .filter((tool) => cardSlugs.has(tool.slug))
      .map(({ slug, name, description, icon }) => ({ slug, name, description, icon }))
    return NextResponse.json({ response, toolCards })
  } catch (error) {
    console.error("Agent chat generation failed:", error)
    return NextResponse.json({ error: "Could not generate a response. Please try again." }, { status: 502 })
  }
}
