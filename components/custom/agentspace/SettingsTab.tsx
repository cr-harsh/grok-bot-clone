"use client"

import { useContext } from "react"
import { AgentConfigContext } from "@/context/AgentConfigContext"

export default function SettingsTab() {
  const context = useContext(AgentConfigContext)
  if (!context) throw new Error("SettingsTab must be rendered inside AgentConfigContext")
  const { agentConfig, setAgentConfig } = context

  return (
    <div className="space-y-5 py-5">
      <div>
        <label htmlFor="agent-description-instructions" className="mb-1.5 block text-xs font-semibold text-zinc-700">Agent description &amp; instructions</label>
        <textarea id="agent-description-instructions" value={agentConfig?.description ?? ""} onChange={(event) => agentConfig && setAgentConfig({ ...agentConfig, description: event.target.value })} disabled={!agentConfig} rows={12} className="w-full resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm leading-6 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50" />
        <p className="mt-1.5 text-xs text-zinc-400">Describe your agent and include the instructions it should follow in this field.</p>
      </div>
    </div>
  )
}
