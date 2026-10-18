"use client"
import axios from 'axios';
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Orbit, Plus, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useSession } from 'next-auth/react';
import { AgentConfigType } from '@/type/Agent';


export default function AppSidebar() {
  const pathname = usePathname()
  const [agents, setAgents] = useState<AgentConfigType[]>([])
  const [agentsError, setAgentsError] = useState(false)
  const data = useSession();
  const path =  usePathname();


  useEffect(() => {
    let cancelled = false

    const getUserAgents = async () => {
      try {
        const result = await axios.get<AgentConfigType[]>('/api/agent')
        if (!cancelled) setAgents(result.data)
      } catch (error) {
        console.error('Failed to load agents:', error)
        if (!cancelled) setAgentsError(true)
      }
    }

    void getUserAgents()
    return () => {
      cancelled = true
    }
  }, [path])

  const isAgentActive = (agentId: string) => pathname === `/workspace/${agentId}`
  return (
    <aside className="flex h-dvh w-[272px] shrink-0 flex-col border-r border-zinc-200 bg-white px-4 py-5 text-zinc-900">
      <Link href="/workspace" className="mb-8 flex items-center gap-3 rounded-lg px-2 py-1.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
          <Orbit className="size-5" strokeWidth={2.2} />
        </span>
        <span className="text-lg font-semibold tracking-tight">Orbit</span>
      </Link>

      <Link
        href="/workspace/create-agent"
        className="mb-8 flex h-11 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
      >
        <Plus className="size-4" strokeWidth={2.5} />
        Create New Agent
      </Link>

      <div className="mb-3 flex items-center justify-between px-2">
        <h2 className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">Your Agents</h2>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-500">{agents.length}</span>
      </div>

      <nav aria-label="Your agents" className="flex flex-col gap-1">
        {agents.map((agent) => {
          const active = isAgentActive(agent.agentId)
          return (
            <Link
              key={agent.agentId}
              href={`/workspace/${agent.agentId}`}
              aria-current={active ? "page" : undefined}
              className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                active ? "bg-violet-50 text-violet-900" : "text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {agent.agentImage ? (
                <img src={agent.agentImage} alt="" className="size-9 rounded-full object-cover ring-1 ring-black/5" />
              ) : (
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700" aria-hidden="true">
                  <Sparkles className="size-4" />
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{agent.name}</span>
                <span className="block truncate text-xs text-zinc-500">{agent.description}</span>
              </span>
              {active && <span className="size-1.5 rounded-full bg-violet-600" aria-label="Active agent" />}
            </Link>
          )
        })}
        {agentsError && <p role="alert" className="px-2.5 py-2 text-xs text-red-600">Could not load your agents.</p>}
        {!agentsError && agents.length === 0 && <p className="px-2.5 py-2 text-xs text-zinc-500">No agents yet.</p>}
      </nav>

      <div className="mt-auto border-t border-zinc-200 pt-4">
        <Link
          href="/workspace/marketplace"
          className={`mb-3 flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
            pathname.startsWith("/workspace/marketplace") ? "bg-violet-50 text-violet-900" : "text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <Compass className="size-[18px] text-zinc-500" />
          Marketplace
        </Link>

        <button type="button" className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          <span className="flex size-9 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800">JD</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">Jordan Davis</span>
            <span className="block truncate text-xs text-zinc-500">Personal workspace</span>
          </span>
          <Sparkles className="size-4 text-zinc-400" />
        </button>
      </div>
    </aside>
  )
}
