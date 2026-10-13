import { Clock3, Plus, RotateCcw } from "lucide-react"

export default function ScheduleTab() {
  return (
    <div className="space-y-5 py-5">
      <div>
        <p className="mb-2 text-xs font-semibold text-zinc-700">When should Nova run?</p>
        <div className="grid grid-cols-3 gap-2">{[{ label: "Manual", icon: Plus }, { label: "Recurring", icon: RotateCcw }, { label: "Specific time", icon: Clock3 }].map(({ label, icon: Icon }, index) => <button key={label} type="button" className={`flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border px-2 text-xs font-medium ${index === 0 ? "border-violet-300 bg-violet-50 text-violet-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}><Icon className="size-4" />{label}</button>)}</div>
      </div>
      <div className="space-y-3 rounded-xl border border-zinc-200 p-4">
        <div className="flex items-center justify-between"><span className="text-sm font-medium">Recurring schedule</span><span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-500">Preview</span></div>
        <label className="block text-xs font-medium text-zinc-600">Frequency<select defaultValue="daily" className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-sm text-zinc-700 outline-none"><option value="daily">Every day</option><option value="weekly">Every week</option><option value="monthly">Every month</option></select></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium text-zinc-600">Time<input type="time" defaultValue="08:00" className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 px-2.5 text-sm text-zinc-700" /></label><label className="text-xs font-medium text-zinc-600">Timezone<select defaultValue="local" className="mt-1.5 h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-sm text-zinc-700"><option value="local">Your local time</option><option value="utc">UTC</option></select></label></div>
        <div className="rounded-lg bg-violet-50 px-3 py-2.5 text-xs font-medium text-violet-800">Every day at 8:00 AM</div>
      </div>
      <p className="text-xs text-zinc-400">Schedule controls are a visual preview.</p>
    </div>
  )
}
