import { CalendarClock, Copy, Github, Mail, MessageSquare } from "lucide-react"

const tools = [
  { name: "Gmail", icon: Mail, color: "text-red-500" },
  { name: "Slack", icon: MessageSquare, color: "text-violet-600" },
  { name: "Google Calendar", icon: CalendarClock, color: "text-blue-600" },
  { name: "Notion", icon: Copy, color: "text-zinc-800" },
  { name: "GitHub", icon: Github, color: "text-zinc-800" },
]

export default function ToolsTab() {
  return (
    <div className="py-5">
      <p className="mb-4 text-sm leading-5 text-zinc-500">Connect apps to give Nova useful context and capabilities.</p>
      <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 px-3">
        {tools.map(({ name, icon: Icon, color }) => <div key={name} className="flex items-center gap-3 py-3">
          <div className={`flex size-9 items-center justify-center rounded-lg bg-zinc-100 ${color}`}><Icon className="size-[18px]" /></div>
          <span className="flex-1 text-sm font-medium text-zinc-800">{name}</span>
          <button type="button" className="h-8 rounded-lg border border-zinc-200 px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50">Connect</button>
        </div>)}
      </div>
    </div>
  )
}
