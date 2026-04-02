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

  const sortedEvents = [...events].sort((a, b) =>
    b.event_date.localeCompare(a.event_date)
  );

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>ICU杯 成績入力</h1>

      {/* 大会情報 */}
      <section style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>{isEditing ? "大会を編集" : "新しい大会を追加"}</h2>
          {isEditing && (
            <button onClick={resetForm} style={{ color: "#666" }}>
              ✕ キャンセル
            </button>
          )}
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr",
          gap: "10px 12px",
          alignItems: "center",
          maxWidth: 420,
          marginTop: 12,
        }}>
          <label>大会名</label>
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="例：第十一回 ICU杯"
            style={{ padding: "6px 8px" }}
          />
          <label>開催日</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            style={{ padding: "6px 8px" }}
          />
          <label>コース</label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            style={{ padding: "6px 8px" }}
          >
            <option value="">-- 選択してください --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* スコア入力 */}
      <section style={{ marginTop: 24 }}>
        <h2>スコア入力</h2>
        <table style={{ borderCollapse: "collapse", marginTop: 8, width: "100%" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>名前</th>
              <th style={th}>OUT</th>
              <th style={th}>IN</th>
              <th style={th}>TOTAL</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td style={td}>
                  <select
                    value={r.player_id}
                    onChange={(e) => updateRow(i, { player_id: e.target.value })}
                    style={{ width: "100%", padding: "6px 4px" }}
                  >
                    <option value="">-- 選択 --</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td style={td}>
                  <input
                    type="number"
                    value={r.out}
                    onChange={(e) => updateRow(i, { out: e.target.value === "" ? "" : Number(e.target.value) })}
                    style={{ width: 64, padding: "6px 4px", background: invalidScore(r.out) ? "#ffcccc" : undefined }}
                  />
                </td>
                <td style={td}>
                  <input
                    type="number"
                    value={r.inn}
                    onChange={(e) => updateRow(i, { inn: e.target.value === "" ? "" : Number(e.target.value) })}
                    style={{ width: 64, padding: "6px 4px", background: invalidScore(r.inn) ? "#ffcccc" : undefined }}
                  />
                </td>
                <td style={{ ...td, textAlign: "center", fontWeight: "bold" }}>
                  {total(r) ?? "-"}
                </td>
                <td style={td}>
                  <button onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}>削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setRows((prev) => [...prev, emptyRow()])} style={{ marginTop: 8 }}>
          ＋ 行を追加
        </button>
      </section>

      {/* 保存ボタン */}
      <section style={{ marginTop: 32 }}>
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          style={{
            padding: "12px 32px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 16,
            cursor: status === "saving" ? "wait" : "pointer",
          }}
        >
          {status === "saving" ? "保存中..." : isEditing ? "更新する" : "保存する"}
        </button>

        {status === "ok" && (
          <p style={{ color: "#008800", marginTop: 12 }}>
            ✓ {isEditing ? "更新" : "保存"}しました。1〜2分後にサイトに反映されます。
          </p>
        )}
        {status === "error" && (
          <p style={{ color: "#cc0000", marginTop: 12 }}>エラー: {errorMsg}</p>
        )}
      </section>

      {/* 既存大会一覧 */}
      <section style={{ marginTop: 48 }}>
        <h2>既存の大会一覧</h2>
        <table style={{ borderCollapse: "collapse", width: "100%", marginTop: 8 }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={th}>大会名</th>
              <th style={th}>開催日</th>
              <th style={th}>参加人数</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {sortedEvents.map((e) => (
              <tr key={e.id} style={{ background: e.id === editingId ? "#fffbe6" : undefined }}>
                <td style={td}>{e.name}</td>
                <td style={td}>{e.event_date}</td>
                <td style={{ ...td, textAlign: "center" }}>{e.scores.length}人</td>
                <td style={td}>
                  <button onClick={() => loadEvent(e)}>
                    {e.id === editingId ? "編集中" : "編集"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

const th: React.CSSProperties = { border: "1px solid #ddd", padding: "8px 12px", textAlign: "left" };
const td: React.CSSProperties = { border: "1px solid #ddd", padding: "6px 8px" };
