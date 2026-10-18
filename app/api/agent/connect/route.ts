import { and, eq } from "drizzle-orm"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { AgentConfig, db, Tools } from "@/db"
import { authOptions } from "../../auth/[...nextauth]/route"
import { composio } from "@/lib/composio/composio"

export async function POST(request: NextRequest) {
  const auth = await getServerSession(authOptions)
  if (!auth?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
  const { agentId, slug } = payload as Record<string, unknown>
  if (typeof agentId !== "string" || typeof slug !== "string") {
    return NextResponse.json({ error: "An agentId and tool slug are required." }, { status: 400 })
  }

  const [agentConfig] = await db.select().from(AgentConfig)
    .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, auth.user.email)))
    .limit(1)
  if (!agentConfig) return NextResponse.json({ error: "Agent not found" }, { status: 404 })

  const [tool] = await db.select().from(Tools)
    .where(and(eq(Tools.slug, slug), eq(Tools.isActive, true)))
    .limit(1)
  if (!tool) return NextResponse.json({ error: "App not found" }, { status: 404 })

  try {
    const connection = await composio.toolkits.authorize(auth.user.email, tool.slug)
    const enabledTools = Array.isArray(agentConfig.tools) ? agentConfig.tools : []
    await db.update(AgentConfig)
      .set({
        tools: Array.from(new Set([...enabledTools.filter((item): item is string => typeof item === "string"), tool.slug])),
        composioSessionId: null,
      })
      .where(eq(AgentConfig.agentId, agentConfig.agentId))
    return NextResponse.json({ redirectUrl: connection.redirectUrl })
  } catch (error) {
    console.error("Tool connection could not be started:", error)
    return NextResponse.json({ error: "Could not start the app connection. Please try again." }, { status: 502 })
  }
}
