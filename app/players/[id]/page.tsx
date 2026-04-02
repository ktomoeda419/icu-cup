import { getPlayer, getScoresForPlayer } from "@/lib/data";
import { differential, handicapV1 } from "@/lib/handicap";
import HcChart from "./HcChart";

export default async function PlayerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: playerId } = await params;

  const player = getPlayer(playerId);
  if (!player) {
    return (
      <div className="py-16 text-center text-slate-500">Player not found</div>
    );
  }

  const scores = getScoresForPlayer(playerId);

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

  for (const s of scores) {
    const course = s.event.course;
    const gross = Number(s.total_score);

    const event_date = s.event.event_date || "-";
    const event_name = s.event.name || "-";
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
      cr: Number.isFinite(cr as number) ? (cr as number) : null,
      slope: Number.isFinite(slope as number) ? (slope as number) : null,
      diff,
      hc_after,
    });
  }

  const hc = diffsForHc.length > 0 ? handicapV1(diffsForHc) : 0;

  return (
    <div>
      {/* Player Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xl flex-shrink-0">
            {player.name.slice(0, 1)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">{player.name}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  player.gender === "M"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-pink-50 text-pink-600"
                }`}
              >
                {player.gender === "M" ? "男性 / Regular" : "女性 / Red"}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 mb-1">現在HC（V1）</p>
            <p className="text-3xl font-extrabold text-emerald-700">{hc}</p>
            <p className="text-xs text-slate-400 mt-1">{diffsForHc.length}ラウンド</p>
          </div>
        </div>
      </div>

      {/* HC Chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-900">HC推移（グラフ）</h2>
        </div>
        <div className="p-6">
          <HcChart data={trend} />
        </div>
      </div>

      {/* HC Trend Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-900">HC推移（V1）</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">日付</th>
                <th className="px-4 py-3 text-left font-semibold">大会</th>
                <th className="px-4 py-3 text-left font-semibold">コース</th>
                <th className="px-4 py-3 text-right font-semibold">Gross</th>
                <th className="px-4 py-3 text-right font-semibold">CR</th>
                <th className="px-4 py-3 text-right font-semibold">Slope</th>
                <th className="px-4 py-3 text-right font-semibold">Diff</th>
                <th className="px-4 py-3 text-right font-semibold">HC(累積)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trend.map((t, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-slate-500">{t.event_date}</td>
                  <td className="px-4 py-3 text-slate-700">{t.event_name}</td>
                  <td className="px-4 py-3 text-slate-500">{t.course_name}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{t.gross}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{t.cr ?? "-"}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{t.slope ?? "-"}</td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {t.diff == null ? "-" : t.diff.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                    {t.hc_after == null ? "-" : t.hc_after}
                  </td>
                </tr>
              ))}
              {trend.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                    まだスコアがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-900">スコア履歴</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">日付</th>
                <th className="px-4 py-3 text-left font-semibold">大会</th>
                <th className="px-4 py-3 text-left font-semibold">コース</th>
                <th className="px-4 py-3 text-right font-semibold">OUT</th>
                <th className="px-4 py-3 text-right font-semibold">IN</th>
                <th className="px-4 py-3 text-right font-semibold">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scores.map((s, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-slate-500">{s.event.event_date || "-"}</td>
                  <td className="px-4 py-3 text-slate-700">{s.event.name || "-"}</td>
                  <td className="px-4 py-3 text-slate-500">{s.event.course?.name || "-"}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{s.out_score ?? "-"}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{s.in_score ?? "-"}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{s.total_score}</td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    まだスコアがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
