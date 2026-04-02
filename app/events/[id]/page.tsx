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
  if (!event) return <main style={{ padding: 24 }}>Event not found</main>;

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
    <main style={{ padding: 24 }}>
      <h1>{event.name}</h1>
      <p style={{ color: "#666" }}>
        {event.event_date} / {event.course?.name ?? "-"}
      </p>

      <h2 style={{ marginTop: 16 }}>結果</h2>
      <ResultsTable results={results} />

      <p style={{ marginTop: 12, color: "#666" }}>
        ※ Net = Gross − この大会時点のHC（V1）
      </p>
    </main>
  );
}
