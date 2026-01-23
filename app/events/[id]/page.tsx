import { supabase } from "@/lib/supabase";
import { differential, handicapV1 } from "@/lib/handicap";
import ResultsTable from "./ResultsTable";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: eventId } = await params;

  // 大会情報
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id,name,event_date, course:courses(id,name,regular_course_rating,regular_slope,red_course_rating,red_slope)"
    )
    .eq("id", eventId)
    .single();

  if (eventError) {
    return <main style={{ padding: 24 }}>Error: {eventError.message}</main>;
  }
  if (!event) {
    return <main style={{ padding: 24 }}>Event not found</main>;
  }

  // course が配列で返るケースに対応
  const eventCourse = Array.isArray((event as any).course)
    ? (event as any).course[0]
    : (event as any).course;

  // スコア（全員分）
  const { data: scores, error: scoreError } = await supabase
    .from("scores")
    .select(
      `
      id,
      player_id,
      total_score,
      out_score,
      in_score,
      created_at,
      player:players(id,name,gender)
    `
    )
    .eq("event_id", eventId);

  if (scoreError) {
    return <main style={{ padding: 24 }}>Error: {scoreError.message}</main>;
  }

  const rows = scores || [];

  // ===== 各プレーヤーの「大会日までのHC」を計算 =====
  const hcByPlayerId: Record<string, number> = {};

  for (const r of rows as any[]) {
    const pid = r.player_id;
    if (hcByPlayerId[pid] != null) continue;

    const gender = r.player?.gender ?? "M";

    // そのプレーヤーの「この大会より前」のスコア
    const { data: pastScores, error: pastError } = await supabase
      .from("scores")
      .select(
        `
        total_score,
        event:events(
          event_date,
          course:courses(
            regular_course_rating,
            regular_slope,
            red_course_rating,
            red_slope
          )
        )
      `
      )
      .eq("player_id", pid)
      .lt("event.event_date", (event as any).event_date);

    if (pastError) {
      return <main style={{ padding: 24 }}>Error: {pastError.message}</main>;
    }

    const diffs: number[] = [];

    for (const ps of pastScores || []) {
      // event / course が配列で返るケースに対応
      const ev = Array.isArray((ps as any).event)
        ? (ps as any).event[0]
        : (ps as any).event;

      const courseRaw = ev?.course;
      const course = Array.isArray(courseRaw) ? courseRaw[0] : courseRaw;
      if (!course) continue;

      const gross = Number((ps as any).total_score);
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

  // ===== ResultsTable に渡すデータ =====
  const results = rows.map((r: any) => {
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
      <h1>{(event as any).name}</h1>
      <p style={{ color: "#666" }}>
        {(event as any).event_date} / {eventCourse?.name ?? "-"}
      </p>

      <h2 style={{ marginTop: 16 }}>結果</h2>
      <ResultsTable results={results} />

      <p style={{ marginTop: 12, color: "#666" }}>
        ※ Net = Gross − この大会時点のHC（V1）
      </p>
    </main>
  );
}
