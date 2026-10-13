import { CalendarClock, MoreHorizontal, Settings2, Wrench } from "lucide-react"
import type { ConfigTab } from "./types"

const tabs: { id: ConfigTab; label: string; icon: typeof Settings2 }[] = [
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "schedule", label: "Schedule", icon: CalendarClock },
  { id: "agent-settings", label: "Agent Settings", icon: MoreHorizontal },
]

export default function ConfigTabs({ activeTab, onChange }: { activeTab: ConfigTab; onChange: (tab: ConfigTab) => void }) {
  return (
    <nav aria-label="Agent configuration sections" className="-mx-1 flex items-center gap-1 border-b border-zinc-200 py-2">
      {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" title={label} aria-label={label} aria-pressed={activeTab === id} onClick={() => onChange(id)} className={`flex size-10 items-center justify-center rounded-lg transition-colors ${activeTab === id ? "bg-violet-50 text-violet-700" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"}`}><Icon className="size-[18px]" /></button>)}
      <span className="ml-auto text-xs font-medium text-zinc-500">{tabs.find((tab) => tab.id === activeTab)?.label}</span>
    </nav>
  )
}
