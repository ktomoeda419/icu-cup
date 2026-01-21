import { supabase } from "@/lib/supabase";
import { differential, handicapV1 } from "@/lib/handicap";

export default async function PlayerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: playerId } = await params;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id,name,gender")
    .eq("id", playerId)
    .single();

  if (playerError) {
    return <main style={{ padding: 24 }}>Error: {playerError.message}</main>;
  }
  if (!player) return <main style={{ padding: 24 }}>Player not found</main>;

  const { data: scores, error } = await supabase
    .from("scores")
    .select(
      "total_score,out_score,in_score,created_at, event:events(id,name,event_date, course:courses(name,regular_course_rating,regular_slope,red_course_rating,red_slope))"
    )
    .eq("player_id", playerId)
    .order("created_at", { ascending: true });

  if (error) return <main style={{ padding: 24 }}>Error: {error.message}</main>;

  const diffs: number[] = [];
  for (const s of scores || []) {
    const course = (s as any).event?.course;
    if (!course) continue;

    const gross = Number(s.total_score);
    const cr =
      player.gender === "M"
        ? Number(course.regular_course_rating)
        : Number(course.red_course_rating);
    const slope =
      player.gender === "M"
        ? Number(course.regular_slope)
        : Number(course.red_slope);

    if (!Number.isFinite(gross) || !Number.isFinite(cr) || !Number.isFinite(slope) || slope <= 0) continue;
    diffs.push(differential(gross, cr, slope));
  }

  const hc = handicapV1(diffs);

  return (
    <main style={{ padding: 24 }}>
      <h1>{player.name}</h1>
      <p>性別: {player.gender === "M" ? "男性（Regular）" : "女性（Red）"}</p>
      <p>
        <b>現在HC（V1）:</b> {hc}
      </p>
      <p style={{ color: "#666" }}>HC計算に使用したラウンド数: {diffs.length}</p>

      <h2 style={{ marginTop: 16 }}>スコア履歴</h2>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>日付</th>
            <th>大会</th>
            <th>コース</th>
            <th>OUT</th>
            <th>IN</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {(scores || []).map((s: any, i: number) => (
            <tr key={i}>
              <td>{s.event?.event_date || "-"}</td>
              <td>{s.event?.name || "-"}</td>
              <td>{s.event?.course?.name || "-"}</td>
              <td>{s.out_score ?? "-"}</td>
              <td>{s.in_score ?? "-"}</td>
              <td>
                <b>{s.total_score}</b>
              </td>
            </tr>
          ))}
          {(scores || []).length === 0 && (
            <tr>
              <td colSpan={6} style={{ color: "#666" }}>
                まだスコアがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
