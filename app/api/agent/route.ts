import { getServerSession } from "next-auth";
import { and, desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { AgentConfig, db, users } from "@/db";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { agentId, name, description, agentImage } = body as Record<string, unknown>;
  if (
    typeof agentId !== "string" ||
    !agentId.trim() ||
    typeof name !== "string" ||
    !name.trim() ||
    (description !== undefined && typeof description !== "string") ||
    (agentImage !== undefined && typeof agentImage !== "string")
  ) {
    return NextResponse.json(
      { error: "A valid agentId and name are required." },
      { status: 400 },
    );
  }

  await db.insert(users).values({
    name: session.user.name ?? null,
    email: session.user.email,
  }).onConflictDoNothing({ target: users.email });

  const [newAgentConfig] = await db.insert(AgentConfig).values({
    agentId: agentId.trim(),
    name: name.trim(),
    description: typeof description === "string" ? description : null,
    agentImage: typeof agentImage === "string" ? agentImage : null,
    userEmail: session.user.email,
  }).returning();

  return NextResponse.json(
    { message: "Agent configuration saved successfully", agentConfig: newAgentConfig },
    { status: 201 },
  );
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agentId = new URL(req.url).searchParams.get("agentId");

  if (agentId) {
    const [agentConfig] = await db
      .select()
      .from(AgentConfig)
      .where(and(
        eq(AgentConfig.userEmail, session.user.email),
        eq(AgentConfig.agentId, agentId),
      ));

    if (!agentConfig) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    return NextResponse.json(agentConfig);
  }

  const agentConfigs = await db
    .select()
    .from(AgentConfig)
    .where(eq(AgentConfig.userEmail, session.user.email))
    .orderBy(desc(AgentConfig.createdAt));

  return NextResponse.json(agentConfigs);
}
