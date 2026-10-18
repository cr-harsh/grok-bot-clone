import { Link2, LoaderCircle, Wrench } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { toast } from "@/components/ui/toast"
import type { AgentResponse } from "@/lib/groq/agent-response-schema"
import type { ToolConnectionCardData } from "@/type/Message"

export function ToolSuggestionCard({
  suggestions,
  tools,
  agentId,
}: {
  suggestions: AgentResponse["suggestedTools"]
  tools: ToolConnectionCardData[]
  agentId?: string
}) {
  const [connectingSlug, setConnectingSlug] = useState<string | null>(null)
  if (!suggestions.length) return null

  const connect = async (slug: string) => {
    if (!agentId) return
    setConnectingSlug(slug)
    try {
      const result = await axios.post<{ redirectUrl?: string | null }>("/api/agent/connect", { agentId, slug })
      if (!result.data.redirectUrl) throw new Error("The provider did not return a connection URL.")
      window.location.assign(result.data.redirectUrl)
    } catch (error) {
      const description = axios.isAxiosError(error)
        ? error.response?.data?.error ?? "Please try again in a moment."
        : error instanceof Error ? error.message : "Please try again in a moment."
      toast.add({ title: "Could not connect app", description, type: "error" })
      setConnectingSlug(null)
    }
  }

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-sky-200 bg-white shadow-sm" aria-label="Suggested tools">
      <div className="flex items-center gap-2 border-b border-sky-100 bg-sky-50/70 px-4 py-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-white text-sky-700 ring-1 ring-sky-100">
          <Link2 className="size-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Tool suggestions</p>
          <p className="text-xs text-zinc-600">The agent needs these apps to carry out the request.</p>
        </div>
      </div>

      <ul className="divide-y divide-zinc-100 px-4">
        {suggestions.map(({ slug, reason }) => {
          const tool = tools.find((item) => item.slug === slug)
          return (
            <li key={slug} className="flex items-center gap-3 py-3">
              {tool?.icon ? (
                <img src={tool.icon} alt="" className="mt-0.5 size-8 rounded-lg border border-zinc-100 object-contain p-1" />
              ) : (
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500"><Wrench className="size-4" /></span>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">{tool?.name ?? slug}</p>
                <p className="mt-0.5 text-xs leading-5 text-zinc-500">{reason || tool?.description || "Connect this app to enable the requested action."}</p>
              </div>
              <button type="button" onClick={() => void connect(slug)} disabled={!agentId || connectingSlug !== null} className="ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-violet-600 px-3 text-xs font-medium text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
                {connectingSlug === slug && <LoaderCircle className="size-3.5 animate-spin" />}
                {connectingSlug === slug ? "Connecting…" : "Connect"}
              </button>
            </li>
          )
        })}
      </ul>
      <p className="px-4 pb-3 text-[11px] text-zinc-400">Connect an app to authorize access for your agent.</p>
    </section>
  )
}
