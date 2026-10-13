"use client"

import { useContext } from "react"
import { Shuffle, Sparkles } from "lucide-react"
import { AgentConfigContext } from "@/context/AgentConfigContext"

const avatarOptions = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=320&h=320&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&h=320&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=320&h=320&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=320&h=320&fit=crop&crop=faces",
]

export default function AgentIdentityForm() {
  const context = useContext(AgentConfigContext)
  if (!context) throw new Error("AgentIdentityForm must be rendered inside AgentConfigContext")
  const { agentConfig, setAgentConfig } = context

  const shuffleAvatar = () => {
    if (!agentConfig) return
    const availableAvatars = avatarOptions.filter((avatar) => avatar !== agentConfig.agentImage)
    const nextAvatar = availableAvatars[Math.floor(Math.random() * availableAvatars.length)]
    setAgentConfig({ ...agentConfig, agentImage: nextAvatar })
  }

  return (
    <section className="flex items-center gap-4 border-b border-zinc-100 py-5">
      <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700 ring-1 ring-violet-200">
        {agentConfig?.agentImage ? <img src={agentConfig.agentImage} alt={`${agentConfig.name} avatar`} className="size-full object-cover" /> : <Sparkles className="size-8" />}
      </div>
      <div className="min-w-0 flex-1">
        <button type="button" onClick={shuffleAvatar} disabled={!agentConfig} className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><Shuffle className="size-3.5" /> Shuffle avatar</button>
        <label htmlFor="agent-name" className="mb-1 block text-xs font-medium text-zinc-500">Agent name</label>
        <input id="agent-name" value={agentConfig?.name ?? ""} onChange={(event) => agentConfig && setAgentConfig({ ...agentConfig, name: event.target.value })} disabled={!agentConfig} className="h-9 w-full rounded-lg border border-zinc-200 px-3 text-sm font-medium outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-zinc-50" />
      </div>
    </section>
  )
}
