import { getEvent, getScoresForEvent, getPastScoresForPlayer } from "@/lib/data";
import { differential, handicapV1 } from "@/lib/handicap";
import ResultsTable from "./ResultsTable";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;

  const event = getEvent(eventId);
  if (!event) {
    return (
      <div className="py-16 text-center text-slate-500">Event not found</div>
    );
  }

  const scores = getScoresForEvent(eventId);

  const hcByPlayerId: Record<string, number> = {};

  for (const r of scores) {
    const pid = r.player_id;
    if (hcByPlayerId[pid] != null) continue;

    const gender = r.player?.gender ?? "M";
    const pastScores = getPastScoresForPlayer(pid, event.event_date);

    const diffs: number[] = [];
    for (const ps of pastScores) {
      const course = ps.event.course;
      if (!course) continue;

      const gross = Number(ps.total_score);
      const cr =
        gender === "M"
          ? Number(course.regular_course_rating)
          : Number(course.red_course_rating);
      const slope =
        gender === "M"
          ? Number(course.regular_slope)
          : Number(course.red_slope);

      if (
        Number.isFinite(gross) &&
        Number.isFinite(cr) &&
        Number.isFinite(slope) &&
        slope > 0
      ) {
        diffs.push(differential(gross, cr, slope));
      }
    }

    hcByPlayerId[pid] = diffs.length > 0 ? handicapV1(diffs) : 0;
  }

  const results = scores.map((r) => {
    const hc = hcByPlayerId[r.player_id] ?? 0;
    const gross = Number(r.total_score);
    const net =
      Number.isFinite(gross) && Number.isFinite(hc)
        ? Math.round((gross - hc) * 10) / 10
        : gross;

    return {
      playerId: r.player_id,
      name: r.player?.name ?? "(unknown)",
      gender: r.player?.gender ?? "M",
      hc,
      gross,
      net,
      out: r.out_score,
      inn: r.in_score,
    };
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">{event.name}</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          {event.event_date && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
              📅 {event.event_date}
            </span>
          )}
          {event.course?.name && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
              ⛳ {event.course.name}
            </span>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-900">結果</h2>
        </div>
        <div className="p-6">
          <ResultsTable results={results} />
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        ※ Net = Gross − この大会時点のHC（V1）
      </p>
    </div>
  );
}
