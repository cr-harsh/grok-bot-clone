import { and, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { AgentConfig, db } from "@/db"
import { authOptions } from "../../auth/[...nextauth]/route"
import { executeAgentChat, type Message } from "@/lib/openai/openai-agent"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { agentId, messages } = body as Record<string, unknown>
  if (
    typeof agentId !== "string" ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every(
      (message) =>
        message &&
        typeof message === "object" &&
        ["user", "agent", "assistant"].includes((message as Message).role) &&
        typeof (message as Message).content === "string",
    )
  ) {
    return NextResponse.json({ error: "A valid agentId and message history are required." }, { status: 400 })
  }

  const [agentConfig] = await db
    .select()
    .from(AgentConfig)
    .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, session.user.email)))
    .limit(1)

  if (!agentConfig) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  try {
    const response = await executeAgentChat(
      agentConfig.name,
      "",
      messages as Message[],
    )
    return NextResponse.json({ response })
  } catch (error) {
    console.error("Agent chat generation failed:", error)
    return NextResponse.json({ error: "Could not generate a response. Please try again." }, { status: 502 })
  }
}
