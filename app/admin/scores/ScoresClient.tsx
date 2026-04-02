"use client";

import { useState } from "react";

type Player = { id: string; name: string; gender: string };
type Course = { id: string; name: string };
type ScoreRow = { player_id: string; out: number | ""; inn: number | "" };

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyRow = (): ScoreRow => ({ player_id: "", out: "", inn: "" });

export default function ScoresClient({
  players,
  courses,
}: {
  players: Player[];
  courses: Course[];
}) {
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [courseId, setCourseId] = useState("");
  const [rows, setRows] = useState<ScoreRow[]>([emptyRow()]);
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");

  const updateRow = (i: number, patch: Partial<ScoreRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const total = (r: ScoreRow) =>
    r.out !== "" && r.inn !== "" ? Number(r.out) + Number(r.inn) : null;

  const invalidScore = (v: number | "") =>
    v !== "" && (Number(v) < 30 || Number(v) > 80);

  const handleSave = async () => {
    if (!eventName.trim()) {
      setErrorMsg("大会名を入力してください");
      setStatus("error");
      return;
    }
    if (!eventDate) {
      setErrorMsg("開催日を入力してください");
      setStatus("error");
      return;
    }
    if (!courseId) {
      setErrorMsg("コースを選択してください");
      setStatus("error");
      return;
    }

    const scores = rows
      .filter((r) => r.player_id)
      .map((r) => {
        const t = total(r);
        return {
          player_id: r.player_id,
          out_score: r.out === "" ? null : Number(r.out),
          in_score: r.inn === "" ? null : Number(r.inn),
          total_score: t ?? (r.out !== "" ? Number(r.out) : 0),
        };
      });

    if (scores.length === 0) {
      setErrorMsg("スコアを1件以上入力してください");
      setStatus("error");
      return;
    }

    const newEvent = {
      id: uid(),
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
        body: JSON.stringify(newEvent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("ok");
      setEventName("");
      setEventDate("");
      setCourseId("");
      setRows([emptyRow()]);
    } catch (e: unknown) {
      setErrorMsg(e instanceof Error ? e.message : "エラーが発生しました");
      setStatus("error");
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>ICU杯 成績入力</h1>

      {/* 大会情報 */}
      <section
        style={{ marginTop: 16, padding: 16, border: "1px solid #ddd", borderRadius: 6 }}
      >
        <h2 style={{ marginTop: 0 }}>大会情報</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr",
            gap: "10px 12px",
            alignItems: "center",
            maxWidth: 420,
          }}
        >
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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* スコア入力 */}
      <section style={{ marginTop: 24 }}>
        <h2>スコア入力</h2>
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: 8,
            width: "100%",
          }}
        >
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
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={td}>
                  <input
                    type="number"
                    value={r.out}
                    onChange={(e) =>
                      updateRow(i, {
                        out: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    style={{
                      width: 64,
                      padding: "6px 4px",
                      background: invalidScore(r.out) ? "#ffcccc" : undefined,
                    }}
                  />
                </td>
                <td style={td}>
                  <input
                    type="number"
                    value={r.inn}
                    onChange={(e) =>
                      updateRow(i, {
                        inn: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    style={{
                      width: 64,
                      padding: "6px 4px",
                      background: invalidScore(r.inn) ? "#ffcccc" : undefined,
                    }}
                  />
                </td>
                <td style={{ ...td, textAlign: "center", fontWeight: "bold" }}>
                  {total(r) ?? "-"}
                </td>
                <td style={td}>
                  <button onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          style={{ marginTop: 8 }}
        >
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
          {status === "saving" ? "保存中..." : "保存する"}
        </button>

        {status === "ok" && (
          <p style={{ color: "#008800", marginTop: 12 }}>
            ✓ 保存しました。1〜2分後にサイトに反映されます。
          </p>
        )}
        {status === "error" && (
          <p style={{ color: "#cc0000", marginTop: 12 }}>
            エラー: {errorMsg}
          </p>
        )}
      </section>
    </main>
  );
}

const th: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "8px 12px",
  textAlign: "left",
};
const td: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: "6px 8px",
};
