"use client";

import { useState } from "react";

type Player = { id: string; name: string; gender: string };
type Course = { id: string; name: string };
type ScoreRow = { player_id: string; out: number | ""; inn: number | "" };
type EventScore = {
  player_id: string;
  out_score: number | null;
  in_score: number | null;
  total_score: number;
};
type Event = {
  id: string;
  name: string;
  event_date: string;
  course_id: string;
  scores: EventScore[];
};

const uid = () => Math.random().toString(36).slice(2, 10);
const emptyRow = (): ScoreRow => ({ player_id: "", out: "", inn: "" });

export default function ScoresClient({
  players,
  courses,
  events,
}: {
  players: Player[];
  courses: Course[];
  events: Event[];
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState<ScoreRow[]>([emptyRow()]);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isEditing = editingId !== null;

  const loadEvent = (event: Event) => {
    setEditingId(event.id);
    setEventName(event.name);
    setEventDate(event.event_date);
    setCourseId(event.course_id);
    setRows(
      event.scores.map((s) => ({
        player_id: s.player_id,
        out: s.out_score ?? "",
        inn: s.in_score ?? "",
      }))
    );
    setStatus("idle");
    setErrorMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setEventName("");
    setEventDate("");
    setCourseId("");
    setRows([emptyRow()]);
    setStatus("idle");
    setErrorMsg("");
  };

  const updateRow = (i: number, patch: Partial<ScoreRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const total = (r: ScoreRow) =>
    r.out !== "" && r.inn !== "" ? Number(r.out) + Number(r.inn) : null;

  const invalidScore = (v: number | "") =>
    v !== "" && (Number(v) < 30 || Number(v) > 80);

  const handleSave = async () => {
    if (!eventName.trim()) { setErrorMsg("大会名を入力してください"); setStatus("error"); return; }
    if (!eventDate) { setErrorMsg("開催日を入力してください"); setStatus("error"); return; }
    if (!courseId) { setErrorMsg("コースを選択してください"); setStatus("error"); return; }

    const scores = rows
      .filter((r) => r.player_id)
      .map((r) => {
        const t = total(r);
        return {
          player_id: r.player_id,
          out_score: r.out === "" ? null : Number(r.out),
          in_score: r.inn === "" ? null : Number(r.inn),
          total_score: t ?? 0,
        };
      });

    if (scores.length === 0) { setErrorMsg("スコアを1件以上入力してください"); setStatus("error"); return; }

    const event = {
      id: editingId ?? uid(),
      name: eventName.trim(),
      event_date: eventDate,
      course_id: courseId,
      scores,
    };

    setStatus("saving");
    setErrorMsg("");

    try {
      const res = await fetch("/api/save-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStatus("ok");
      resetForm();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "エラーが発生しました");
      setStatus("error");
    }
  };

  const handleDelete = async (event: Event) => {
    if (!confirm(`「${event.name}」を削除しますか？この操作は取り消せません。`)) return;
    setDeletingId(event.id);
    try {
      const res = await fetch("/api/save-event", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: event.id, name: event.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      resetForm();
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "削除中にエラーが発生しました");
      setStatus("error");
    } finally {
      setDeletingId(null);
    }
  };

  const sortedEvents = [...events].sort((a, b) =>
    b.event_date.localeCompare(a.event_date)
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">ICU杯 成績入力</h1>

      {/* 大会情報フォーム */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? "大会を編集" : "新しい大会を追加"}
          </h2>
          {isEditing && (
            <button
              onClick={resetForm}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              ✕ キャンセル
            </button>
          )}
        </div>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">大会名</label>
            <input
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="例：第十一回 ICU杯"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">開催日</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">コース</label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
            >
              <option value="">-- 選択してください --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* スコア入力 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-900">スコア入力</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">名前</th>
                <th className="px-4 py-3 text-center font-semibold">OUT</th>
                <th className="px-4 py-3 text-center font-semibold">IN</th>
                <th className="px-4 py-3 text-center font-semibold">TOTAL</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}>
                  <td className="px-4 py-2">
                    <select
                      value={r.player_id}
                      onChange={(e) => updateRow(i, { player_id: e.target.value })}
                      className="w-full px-2 py-1.5 rounded border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                    >
                      <option value="">-- 選択 --</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      value={r.out}
                      onChange={(e) => updateRow(i, { out: e.target.value === "" ? "" : Number(e.target.value) })}
                      className={`w-16 px-2 py-1.5 rounded border text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        invalidScore(r.out)
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-gray-300"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <input
                      type="number"
                      value={r.inn}
                      onChange={(e) => updateRow(i, { inn: e.target.value === "" ? "" : Number(e.target.value) })}
                      className={`w-16 px-2 py-1.5 rounded border text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                        invalidScore(r.inn)
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-gray-300"
                      }`}
                    />
                  </td>
                  <td className="px-4 py-2 text-center font-bold text-slate-900">
                    {total(r) ?? "-"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-gray-100">
          <button
            onClick={() => setRows((prev) => [...prev, emptyRow()])}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
          >
            ＋ 行を追加
          </button>
        </div>
      </section>

      {/* 保存ボタン */}
      <section className="mb-12">
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className={`px-8 py-3 rounded-xl text-white font-semibold text-base shadow-sm transition-all ${
            status === "saving"
              ? "bg-emerald-400 cursor-wait"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-95"
          }`}
        >
          {status === "saving" ? "保存中..." : isEditing ? "更新する" : "保存する"}
        </button>

        {status === "ok" && (
          <p className="mt-3 text-sm text-emerald-700 font-medium">
            ✓ {isEditing ? "更新" : "保存"}しました。1〜2分後にサイトに反映されます。
          </p>
        )}
        {status === "error" && (
          <p className="mt-3 text-sm text-red-600">エラー: {errorMsg}</p>
        )}
      </section>

      {/* 既存大会一覧 */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-slate-900">既存の大会一覧</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-slate-500 text-xs uppercase tracking-wide">
                <th className="px-4 py-3 text-left font-semibold">大会名</th>
                <th className="px-4 py-3 text-left font-semibold">開催日</th>
                <th className="px-4 py-3 text-center font-semibold">参加人数</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedEvents.map((e) => (
                <tr
                  key={e.id}
                  className={
                    e.id === editingId
                      ? "bg-amber-50"
                      : "hover:bg-gray-50 transition-colors"
                  }
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{e.name}</td>
                  <td className="px-4 py-3 text-slate-500">{e.event_date}</td>
                  <td className="px-4 py-3 text-center text-slate-500">{e.scores.length}人</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => loadEvent(e)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        e.id === editingId
                          ? "bg-amber-200 text-amber-800"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }`}
                    >
                      {e.id === editingId ? "編集中" : "編集"}
                    </button>
                    <button
                      onClick={() => handleDelete(e)}
                      disabled={deletingId === e.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-wait"
                    >
                      {deletingId === e.id ? "削除中..." : "削除"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
