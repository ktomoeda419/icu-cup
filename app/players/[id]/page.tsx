import { supabase } from "@/lib/supabase";
import { differential, handicapV1 } from "@/lib/handicap";
import HcChart from "./HcChart";


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

  // event_date で時系列に並べ替え（created_at は入力順になりがち）
  const sortedScores = (scores || []).slice().sort((a: any, b: any) => {
    const da = a.event?.event_date ? new Date(a.event.event_date).getTime() : 0;
    const db = b.event?.event_date ? new Date(b.event.event_date).getTime() : 0;
    return da - db;
  });

  type TrendRow = {
    event_date: string;
    event_name: string;
    course_name: string;
    gross: number;
    cr: number | null;
    slope: number | null;
    diff: number | null;
    hc_after: number | null;
  };

  const trend: TrendRow[] = [];
  const diffsForHc: number[] = [];

  for (const s of sortedScores as any[]) {
    const course = s.event?.course;
    const gross = Number(s.total_score);

    const event_date = s.event?.event_date || "-";
    const event_name = s.event?.name || "-";
    const course_name = course?.name || "-";

    let cr: number | null = null;
    let slope: number | null = null;
    let diff: number | null = null;

    if (course) {
      cr =
        player.gender === "M"
          ? Number(course.regular_course_rating)
          : Number(course.red_course_rating);

      slope =
        player.gender === "M"
          ? Number(course.regular_slope)
          : Number(course.red_slope);

      // レート/スロープが欠けてる場合は HC 計算から除外（表示だけは残す）
      if (
        Number.isFinite(gross) &&
        Number.isFinite(cr) &&
        Number.isFinite(slope) &&
        (slope as number) > 0
      ) {
        diff = differential(gross, cr as number, slope as number);
        diffsForHc.push(diff);
      }
    }

    const hc_after = diffsForHc.length > 0 ? handicapV1(diffsForHc) : null;

    trend.push({
      event_date,
      event_name,
      course_name,
      gross,
      cr: Number.isFinite(cr as any) ? (cr as number) : null,
      slope: Number.isFinite(slope as any) ? (slope as number) : null,
      diff,
      hc_after,
    });
  }

  // 現在HC（最新）
  const hc = diffsForHc.length > 0 ? handicapV1(diffsForHc) : 0;

  return (
    <main style={{ padding: 24 }}>
      <h1>{player.name}</h1>
      <p>性別: {player.gender === "M" ? "男性（Regular）" : "女性（Red）"}</p>
      <p>
        <b>現在HC（V1）:</b> {hc}
      </p>
      <p style={{ color: "#666" }}>HC計算に使用したラウンド数: {diffsForHc.length}</p>
      
      <h2 style={{ marginTop: 24 }}>HC推移（グラフ）</h2>
      <HcChart data={trend} />

      <h2 style={{ marginTop: 16 }}>HC推移（V1）</h2>
      <table border={1} cellPadding={8} style={{ marginTop: 8, width: "100%" }}>
        <thead>
          <tr>
            <th>日付</th>
            <th>大会</th>
            <th>コース</th>
            <th>Gross</th>
            <th>CR</th>
            <th>Slope</th>
            <th>Diff</th>
            <th>HC(累積)</th>
          </tr>
        </thead>
        <tbody>
          {trend.map((t, i) => (
            <tr key={i}>
              <td>{t.event_date}</td>
              <td>{t.event_name}</td>
              <td>{t.course_name}</td>
              <td>
                <b>{t.gross}</b>
              </td>
              <td>{t.cr ?? "-"}</td>
              <td>{t.slope ?? "-"}</td>
              <td>{t.diff == null ? "-" : t.diff.toFixed(1)}</td>
              <td>{t.hc_after == null ? "-" : t.hc_after}</td>
            </tr>
          ))}
          {trend.length === 0 && (
            <tr>
              <td colSpan={8} style={{ color: "#666" }}>
                まだスコアがありません
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
          {(sortedScores || []).map((s: any, i: number) => (
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
          {(sortedScores || []).length === 0 && (
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
