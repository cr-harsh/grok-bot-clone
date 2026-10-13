"use client"

import { useContext, useState } from "react"
import axios from "axios"
import { Check } from "lucide-react"
import AgentIdentityForm from "./AgentIdentityForm"
import AgentSettingsTab from "./AgentSettingsTab"
import ConfigTabs from "./ConfigTabs"
import ScheduleTab from "./ScheduleTab"
import SettingsTab from "./SettingsTab"
import ToolsTab from "./ToolsTab"
import type { ConfigTab } from "./types"
import { AgentConfigContext } from "@/context/AgentConfigContext"
import { toast } from "@/components/ui/toast"

export default function AgentConfigSidebar() {
  const context = useContext(AgentConfigContext)
  if (!context) throw new Error("AgentConfigSidebar must be rendered inside AgentConfigContext")
  const { agentConfig, setAgentConfig } = context
  const [activeTab, setActiveTab] = useState<ConfigTab>("settings")
  const [isSaving, setIsSaving] = useState(false)

  const saveAgentConfig = async () => {
    if (!agentConfig) {
      toast.add({ title: "Agent not ready", description: "Wait for the agent configuration to load, then try again.", type: "warning" })
      return
    }

    const name = agentConfig.name.trim()
    if (!name) {
      toast.add({ title: "Agent name is required", description: "Enter a name before saving your changes.", type: "warning" })
      return
    }

    setIsSaving(true)
    try {
      const response = await axios.patch(`/api/agent/${encodeURIComponent(agentConfig.agentId)}`, {
        name,
        description: agentConfig.description ?? "",
        agentImage: agentConfig.agentImage ?? "",
      })
      setAgentConfig(response.data.agentConfig)
      toast.add({ title: "Changes saved", description: "Your agent configuration has been updated.", type: "success" })
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? "Please try again in a moment."
        : "Please try again in a moment."
      toast.add({ title: "Could not save changes", description: message, type: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <aside className="flex w-[420px] shrink-0 flex-col border-l border-zinc-200 bg-white xl:w-[460px]">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-zinc-200 px-6">
        <div><h2 className="text-sm font-semibold">Agent Configuration</h2><p className="mt-0.5 text-xs text-zinc-500">Customize how {agentConfig?.name || "your agent"} works</p></div>
        <button type="button" onClick={saveAgentConfig} disabled={isSaving || !agentConfig} className="inline-flex h-9 items-center gap-2 rounded-lg bg-violet-600 px-3.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"><Check className="size-4" /> {isSaving ? "Saving..." : "Save"}</button>
      </header>
      <div className="flex-1 overflow-y-auto px-6">
        <AgentIdentityForm />
        <ConfigTabs activeTab={activeTab} onChange={setActiveTab} />
        {activeTab === "settings" && <SettingsTab />}
        {activeTab === "tools" && <ToolsTab />}
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "agent-settings" && <AgentSettingsTab />}
      </div>
    </aside>
  )
}
