import { AgentConfigType } from "@/type/Agent"
import { composio } from "./composio"
import { AgentConfig, db } from "@/db"
import { eq } from "drizzle-orm"

export async function getOrCreateAgentSession(agentConfig: AgentConfigType, userEmail: string) {
  if (agentConfig.composioSessionId) {
    try {
      return await composio.sessions.use(agentConfig.composioSessionId)
    } catch {
      // The saved session may have expired or been deleted; create a fresh one.
    }
  }

  const toolkits = Array.isArray(agentConfig.tools)
    ? agentConfig.tools.filter((slug): slug is string => typeof slug === "string")
    : []
  const session = await composio.sessions.create(userEmail, {
    toolkits: toolkits.length ? toolkits : undefined,
  })

  await db.update(AgentConfig)
    .set({ composioSessionId: session.sessionId })
    .where(eq(AgentConfig.agentId, agentConfig.agentId))

  return session
}
