import Link from "next/link";
import { getEvents } from "@/lib/data";

export default function EventsPage() {
  const events = getEvents();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">大会一覧</h1>

      <div className="space-y-3">
        {events.map((e) => (
          <Link
            key={e.id}
            href={`/events/${e.id}`}
            className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
          >
            <div className="flex-shrink-0 w-16 text-center">
              <span className="text-xs font-semibold text-slate-400">
                {e.event_date ? e.event_date.slice(0, 4) : "----"}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {e.name}
              </p>
              {e.event_date && (
                <p className="text-xs text-slate-400 mt-0.5">{e.event_date}</p>
              )}
            </div>
            <span className="text-slate-300 group-hover:text-emerald-500 transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
