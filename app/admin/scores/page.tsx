"use client";

import { useEffect, useRef, useState } from "react";

type Row = {
  name: string;
  out: number | "";
  in: number | "";
};

const STORAGE_KEY = "icu_scores_draft_v1";
const PLAYERS_KEY = "icu_players_v1";

type Gender = "M" | "F";
type Player = {
  id: string;
  name: string;
  gender: Gender;
  aliases: string[];
};

function normalize(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[‐-–—−]/g, "-");
}

const uid = () => Math.random().toString(36).slice(2, 10);

export default function ScoresPage() {
  const hydratedRef = useRef(false);

  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 6 }, () => ({ name: "", out: "", in: "" }))
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [courseId, setCourseId] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLAYERS_KEY);
      if (saved) setPlayers(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRows(JSON.parse(saved));
    } catch {
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const updateRow = (i: number, key: keyof Row, value: string | number) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: value };
    setRows(next);
  };

  const addRow = () => setRows([...rows, { name: "", out: "", in: "" }]);

  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const total = (r: Row) =>
    r.out !== "" && r.in !== "" ? Number(r.out) + Number(r.in) : "";

  const invalidOutIn = (v: number | "") => v !== "" && (v < 30 || v > 80);

  const matchPlayer = (nameRaw: string): Player | null => {
    const key = normalize(nameRaw);
    if (!key) return null;
    for (const p of players) {
      const keys = [p.name, ...(p.aliases || [])].map(normalize);
      if (keys.includes(key)) return p;
    }
    return null;
  };

  const downloadJson = () => {
    const scores = rows
      .filter((r) => r.name.trim() !== "")
      .map((r) => {
        const matched = matchPlayer(r.name);
        const t = total(r);
        return {
          player_id: matched?.id ?? r.name.trim(),
          out_score: r.out === "" ? null : Number(r.out),
          in_score: r.in === "" ? null : Number(r.in),
          total_score: t === "" ? null : t,
        };
      });

    const eventEntry = {
      id: uid(),
      name: eventName.trim() || "大会名未入力",
      event_date: eventDate || "0000-00-00",
      course_id: courseId.trim() || "",
      scores,
    };

    const blob = new Blob([JSON.stringify(eventEntry, null, 2)], {
      type: "application/json;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `event-${eventDate || "unknown"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    setRows(Array.from({ length: 6 }, () => ({ name: "", out: "", in: "" })));
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>ICU杯 成績入力</h1>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", maxWidth: 480 }}>
        <h2 style={{ marginTop: 0 }}>大会情報</h2>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8 }}>
          <div>大会名</div>
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="例：第3回 ICU杯"
          />
          <div>開催日</div>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />
          <div>コースID</div>
          <input
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            placeholder="courses.json の id を入力"
          />
        </div>
      </section>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={addRow}>＋ 行を追加</button>
        <button onClick={downloadJson}>JSONダウンロード</button>
        <button onClick={clearAll}>クリア</button>
      </div>

      <table border={1} cellPadding={8} style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>名前</th>
            <th>OUT</th>
            <th>IN</th>
            <th>TOTAL</th>
            <th>一致</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                <input
                  value={r.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={r.out}
                  style={{
                    background: invalidOutIn(r.out) ? "#ffcccc" : undefined,
                  }}
                  onChange={(e) =>
                    updateRow(
                      i,
                      "out",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  value={r.in}
                  style={{
                    background: invalidOutIn(r.in) ? "#ffcccc" : undefined,
                  }}
                  onChange={(e) =>
                    updateRow(
                      i,
                      "in",
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </td>
              <td>{total(r)}</td>
              <td>
                {matchPlayer(r.name) ? (
                  <span style={{ color: "#008800" }}>✓</span>
                ) : (
                  <span style={{ color: "#ff0000" }}>✗</span>
                )}
              </td>
              <td>
                <button onClick={() => removeRow(i)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 12, color: "#666" }}>
        ※ 自動保存されます / OUT・IN が 30–80 以外は赤表示
      </p>

      <section style={{ marginTop: 24, padding: 12, border: "1px solid #ddd", background: "#f9f9f9" }}>
        <h2 style={{ marginTop: 0 }}>使い方</h2>
        <ol style={{ paddingLeft: 20, lineHeight: 2 }}>
          <li>大会情報（大会名・開催日・コースID）を入力</li>
          <li>スコアを入力（名前はplayersマスタのエイリアスと一致すると✓になります）</li>
          <li>「JSONダウンロード」で event-YYYY-MM-DD.json を保存</li>
          <li>ダウンロードしたJSONの内容を <code>data/events.json</code> の配列に追加してGitHubにコミット</li>
        </ol>
      </section>
    </main>
  );
}
