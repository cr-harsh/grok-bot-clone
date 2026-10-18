import { CalendarClock, Repeat, Wrench } from "lucide-react"
import type { RoutineDraft } from "@/lib/groq/agent-response-schema"
import type { ToolConnectionCardData } from "@/type/Message"

const frequencyLabels: Record<RoutineDraft["schedule"]["frequency"], string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
}

const weekDayLabels: Record<string, string> = {
  MO: "Mon", TU: "Tue", WE: "Wed", TH: "Thu", FR: "Fri", SA: "Sat", SU: "Sun",
}

export function RoutineCard({
  routine,
  tools,
}: {
  routine: RoutineDraft
  tools: ToolConnectionCardData[]
}) {
  const schedule = routine.schedule
  const days = schedule.weekDays.map((day) => weekDayLabels[day]).join(", ")
  const cadence = schedule.frequency === "weekly" && days
    ? `Weekly · ${days}`
    : frequencyLabels[schedule.frequency]

  return (
    <section className="mt-3 overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm" aria-label="Routine proposal">
      <div className="flex items-start gap-3 border-b border-violet-100 bg-violet-50/70 px-4 py-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white text-violet-700 ring-1 ring-violet-100">
          <Repeat className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Routine proposal</p>
          <h3 className="mt-0.5 text-sm font-semibold text-zinc-900">{routine.name}</h3>
        </div>
      </div>

      <div className="space-y-3 px-4 py-3">
        <p className="text-sm leading-5 text-zinc-600">{routine.goal}</p>
        <div className="flex items-start gap-2 text-xs text-zinc-600">
          <CalendarClock className="mt-0.5 size-4 shrink-0 text-violet-600" />
          <span>{cadence} · {schedule.time} · {schedule.timezone} <span className="text-zinc-400">(starts {schedule.startDate})</span></span>
        </div>

        {routine.tools.length > 0 && (
          <div className="border-t border-zinc-100 pt-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-zinc-700">
              <Wrench className="size-3.5 text-zinc-500" /> Tools this routine needs
            </p>
            <ul className="space-y-2">
              {routine.tools.map(({ slug, reason }) => {
                const tool = tools.find((item) => item.slug === slug)
                return (
                  <li key={slug} className="flex items-start gap-2 text-xs">
                    {tool?.icon ? <img src={tool.icon} alt="" className="mt-0.5 size-4 rounded object-contain" /> : <span className="mt-0.5 size-4 rounded bg-zinc-100" aria-hidden="true" />}
                    <span><span className="font-medium text-zinc-800">{tool?.name ?? slug}</span><span className="text-zinc-500"> — {reason}</span></span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        {routine.instructions && <p className="border-t border-zinc-100 pt-3 text-xs leading-5 text-zinc-500">{routine.instructions}</p>}
        <p className="text-[11px] text-zinc-400">Proposal only · Review the schedule and tools before setting it up.</p>
      </div>
    </section>
  )
}
