"use client"

import type { ReactNode } from "react"
import { useContext, useState } from "react"
import axios from "axios"
import { ChevronDown, Send, Sparkles } from "lucide-react"
import { AgentConfigContext } from "@/context/AgentConfigContext"
import { toast } from "@/components/ui/toast"
import type { MessageType } from "@/type/Message"
import { RoutineCard } from "./generative-ui/RoutineCard"
import { ToolSuggestionCard } from "./generative-ui/ToolSuggestionCard"


function AgentMessage({ children, time, agentName }: { children: ReactNode; time: string; agentName: string }) {
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

function AgentResponseView({ message, agentId }: { message: MessageType; agentId?: string }) {
  const response = message.response
  if (!response) return <p>{message.content}</p>

  return (
    <div>
      <p>{response.message || message.content}</p>
      {response.type === "clarification" && response.questions.length > 0 && (
        <ul className="mt-2 list-inside list-disc space-y-1">
          {response.questions.map(({ id, question }) => <li key={id}>{question}</li>)}
        </ul>
      )}
      {response.routine && (
        <RoutineCard routine={response.routine} tools={message.toolCards ?? []} />
      )}
      {response.suggestedTools.length > 0 && (
        <ToolSuggestionCard suggestions={response.suggestedTools} tools={message.toolCards ?? []} agentId={agentId} />
      )}
    </div>
  )
}

function UserMessage({ children, time }: { children: ReactNode; time: string }) {
  return (
    <div className="flex items-start justify-end gap-3">
      <div className="max-w-[78%]">
        <p className="mb-1.5 text-right text-xs font-medium text-zinc-500">You <span className="ml-1 font-normal">{time}</span></p>
        <div className="rounded-2xl rounded-tr-md bg-violet-600 px-4 py-3 text-sm leading-6 text-white">{children}</div>
      </div>
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-600">JD</div>
    </div>
  )
}

function ChatComposer({ userInput, setUserInput, onSend, isLoading }: { userInput: string; setUserInput: (value: string) => void; onSend: () => void; isLoading: boolean }) {
  return (
    <div className="shrink-0 border-t border-zinc-200 px-7 py-5">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-300 bg-white p-2 shadow-sm focus-within:border-violet-300 focus-within:ring-4 focus-within:ring-violet-50">
        <textarea aria-label="Message Nova" rows={2} value={userInput} onChange={(event) => setUserInput(event.target.value)} placeholder="Ask your agent anything..." className="w-full resize-none bg-transparent px-3 py-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400" />
        <div className="flex items-center justify-between px-2 pb-1">
          <span className="text-xs text-zinc-400">Nova can make mistakes. Review important information.</span>
          <button type="button" onClick={onSend} aria-label="Send message" disabled={!userInput.trim() || isLoading} className="flex size-9 items-center justify-center rounded-xl bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="size-4" /></button>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator({ agentName }: { agentName: string }) {
  return (
    <div className="flex items-start gap-3" role="status" aria-live="polite" aria-label={`${agentName} is typing`}>
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"><Sparkles className="size-4" /></div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-500">{agentName} <span className="ml-1 font-normal">is thinking</span></p>
        <div className="flex h-10 items-center gap-1.5 rounded-2xl rounded-tl-md border border-zinc-200 bg-zinc-50 px-4">
          {[0, 150, 300].map((delay) => <span key={delay} className="size-2 animate-bounce rounded-full bg-violet-500" style={{ animationDelay: `${delay}ms` }} />)}
        </div>
      </div>
    </div>
  )
}

export default function AgentChat() {
  const context = useContext(AgentConfigContext)
  if (!context) throw new Error("AgentChat must be rendered inside AgentConfigContext")
  const agentName = context.agentConfig?.name || "Agent"

  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: 'welcome',
      role: 'agent',
      content: `Hello! I am ${agentName}, how can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    }
  ]);
  const [userInput , setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    const content = userInput.trim()
    if (!content) return

    const agentId = context.agentConfig?.agentId
    if (!agentId) {
      toast.add({ title: "Agent is still loading", description: "Please wait a moment and try again.", type: "warning" })
      return
    }

    const userMessage: MessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    }
    const conversation = [...messages, userMessage]
    setMessages(conversation)
    setUserInput('')

    setIsLoading(true)
    try {
      const response = await axios.post<{
        response: NonNullable<MessageType["response"]>
        toolCards: NonNullable<MessageType["toolCards"]>
      }>("/api/agent/chat", {
        agentId,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        messages: conversation.map(({ role, content }) => ({
          role: role === "agent" ? "agent" : "user",
          content,
        })),
      })

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: crypto.randomUUID(),
          role: 'agent',
          content: response.data.response.message,
          response: response.data.response,
          toolCards: response.data.toolCards,
          time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        },
      ])
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ?? "Please try again in a moment."
        : "Please try again in a moment."
      toast.add({ title: "Could not get a response", description: message, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

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
          
          {messages.map((msg, index) => (
            <div key={msg.id || index}>
              {msg.role === 'agent' ? (
                <AgentMessage agentName={agentName} time={msg.time}>
                  <AgentResponseView message={msg} agentId={context.agentConfig?.agentId} />
                </AgentMessage>
              ) : (
                <UserMessage time={msg.time}>{msg.content}</UserMessage>
              )}
            </div>
          ))}

          {isLoading && <TypingIndicator agentName={agentName} />}
        
          <div className="mt-auto" />
        </div>
      </div>
      <ChatComposer userInput={userInput} setUserInput={setUserInput} onSend={sendMessage} isLoading={isLoading} />
    </section>
  )
}
