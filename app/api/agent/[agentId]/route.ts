import { getServerSession } from "next-auth"
import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { AgentConfig, db } from "@/db"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { agentId } = await params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { name, description, agentImage } = body as Record<string, unknown>
  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof description !== "string" ||
    typeof agentImage !== "string"
  ) {
    return NextResponse.json(
      { error: "Name, description, and avatar image are required." },
      { status: 400 },
    )
  }

  const [agentConfig] = await db
    .update(AgentConfig)
    .set({ name: name.trim(), description, agentImage })
    .where(and(eq(AgentConfig.agentId, agentId), eq(AgentConfig.userEmail, session.user.email)))
    .returning()

  if (!agentConfig) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 })
  }

  return NextResponse.json({ agentConfig, message: "Agent configuration updated successfully." })
}
