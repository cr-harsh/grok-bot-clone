import { Copy, HeartPulse, RotateCcw, ShieldAlert, Trash2 } from "lucide-react"

export default function AgentSettingsTab() {
  return (
    <div className="space-y-5 py-5">
      <div className="space-y-1 rounded-xl border border-zinc-200 p-1">
        <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-zinc-50"><Copy className="size-4 text-zinc-500" /><span className="flex-1 text-sm font-medium">Duplicate agent</span><span className="text-xs text-zinc-400">Make a copy</span></button>
        <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-zinc-50"><HeartPulse className="size-4 text-zinc-500" /><span className="flex-1 text-sm font-medium">Pause agent</span><span className="text-xs text-zinc-400">Temporarily stop runs</span></button>
        <button type="button" className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-zinc-50"><RotateCcw className="size-4 text-zinc-500" /><span className="flex-1 text-sm font-medium">Reset agent</span><span className="text-xs text-zinc-400">Restore defaults</span></button>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-red-800"><ShieldAlert className="size-4" /> Danger zone</div>
        <p className="mb-3 text-xs leading-5 text-red-700/80">Deleting an agent is permanent and removes its configuration.</p>
        <button type="button" className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50"><Trash2 className="size-3.5" /> Delete agent</button>
      </div>
    </div>
  )
}
