"use client"

import type { ReactNode } from "react"
import { useContext } from "react"
import { ChevronDown, Send, Sparkles } from "lucide-react"
import { AgentConfigContext } from "@/context/AgentConfigContext"

function AgentMessage({ children, time = "9:42 AM", agentName }: { children: ReactNode; time?: string; agentName: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"><Sparkles className="size-4" /></div>
      <div className="max-w-[78%]">
        <p className="mb-1.5 text-xs font-medium text-zinc-500">{agentName} <span className="ml-1 font-normal">{time}</span></p>
        <div className="rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-6 text-zinc-700">{children}</div>
      </div>
    </div>
  )
}

function UserMessage() {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className="max-w-[78%]">
        <p className="mb-1.5 text-right text-xs font-medium text-zinc-500">You <span className="ml-1 font-normal">9:42 AM</span></p>
        <div className="rounded-2xl rounded-tr-md bg-violet-600 px-4 py-3 text-sm leading-6 text-white">I’m putting together a launch for a small plant shop. Help me find a warm, memorable theme.</div>
      </div>
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">JD</div>
    </div>
  )
}

function ChatComposer() {
  return (
    <div className="shrink-0 border-t border-zinc-200 px-7 py-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-50">
        <textarea aria-label="Message Nova" rows={2} placeholder="Ask your agent anything..." className="w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400" />
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-xs text-zinc-400">Nova can make mistakes. Review important information.</span>
          <button type="button" aria-label="Send message" className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700"><Send className="size-4" /></button>
        </div>
      </div>
    </div>
  )
}

export default function AgentChat() {
  const context = useContext(AgentConfigContext)
  if (!context) throw new Error("AgentChat must be rendered inside AgentConfigContext")
  const agentName = context.agentConfig?.name || "Agent"

  return (
    <section className="flex min-w-[380px] flex-1 flex-col bg-white">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-zinc-200 px-7">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-violet-700 ring-1 ring-violet-200">{context.agentConfig?.agentImage ? <img src={context.agentConfig.agentImage} alt="" className="size-full object-cover" /> : <Sparkles className="size-5" />}</div>
          <div><h1 className="text-sm font-semibold">{agentName}</h1><p className="text-xs text-zinc-500">{context.agentConfig?.description || "Your AI agent"}</p></div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700" aria-label="Agent status: Active">
          <span className="size-1.5 rounded-full bg-emerald-500" /> Active <ChevronDown className="size-3.5" />
        </div>
      </header>
      <div className="flex flex-1 flex-col overflow-y-auto px-7 py-8">
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-7">
          <div className="self-center rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-500">Today</div>
          <AgentMessage agentName={agentName} time="9:40 AM">Hi! I’m {agentName}, your creative assistant. I can help brainstorm ideas, shape a draft, or give your project a fresh perspective. What are you working on?</AgentMessage>
          <UserMessage />
          <AgentMessage agentName={agentName}>
            How about <span className="font-medium text-zinc-900">“A Little More Green”</span> — a welcoming neighborhood garden where every plant has a story? The visual direction could pair soft botanical greens with warm terracotta and handwritten notes.
            <div className="mt-3 flex flex-wrap gap-2">{["The everyday jungle", "Grow at your own pace", "Rooted in the neighborhood"].map((idea) => <span key={idea} className="rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-600">{idea}</span>)}</div>
          </AgentMessage>
          <div className="mt-auto" />
        </div>
      </div>
      <ChatComposer />
    </section>
  )
}
