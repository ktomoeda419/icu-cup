"use client";

import { useEffect, useRef, useState } from "react";

type Row = {
  name: string;
  out: number | "";
  in: number | "";
};

const STORAGE_KEY = "icu_scores_draft_v1";

export default function ScoresPage() {
  // 初期ロードが完了したか（復元→保存の順序事故を防ぐ）
  const hydratedRef = useRef(false);

  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 6 }, () => ({ name: "", out: "", in: "" }))
  );

  // 初回：保存データがあれば復元（ここが終わるまで保存しない）
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRows(JSON.parse(saved));
    } catch {
      // 何もしない（壊れたJSON等）
    } finally {
      hydratedRef.current = true;
    }
  }, []);

  // 変更時：自動保存（初期復元が終わってからのみ）
  useEffect(() => {
    if (!hydratedRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const updateRow = (i: number, key: keyof Row, value: any) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: value };
    setRows(next);
  };

  const addRow = () => setRows([...rows, { name: "", out: "", in: "" }]);

  const removeRow = (i: number) => setRows(rows.filter((_, idx) => idx !== i));

  const total = (r: Row) =>
    r.out !== "" && r.in !== "" ? Number(r.out) + Number(r.in) : "";

  const invalidOutIn = (v: number | "") => v !== "" && (v < 30 || v > 80);

  const downloadCsv = () => {
    const header = ["name", "out", "in", "total"];
    const lines = rows.map((r) => {
      const t = total(r);
      const safe = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
      const out = r.out === "" ? "" : String(r.out);
      const inn = r.in === "" ? "" : String(r.in);
      const tot = t === "" ? "" : String(t);
      return [safe(r.name), out, inn, tot].join(",");
    });
    const csv = [header.join(","), ...lines].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "icu-cup-scores.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    // confirmが邪魔してるケースもあるので、まず確実に消す
    localStorage.removeItem(STORAGE_KEY);
    setRows(Array.from({ length: 6 }, () => ({ name: "", out: "", in: "" })));

    // それでも表示が残る（キャッシュ/復元）時の保険：再読み込み
    // ※不要なら消してOK
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>ICU杯 成績入力</h1>

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={addRow}>＋ 行を追加</button>
        <button onClick={downloadCsv}>CSVダウンロード</button>
        <button onClick={clearAll}>クリア</button>
      </div>

      <table border={1} cellPadding={8} style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>名前</th>
            <th>OUT</th>
            <th>IN</th>
            <th>TOTAL</th>
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
                <button onClick={() => removeRow(i)}>削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 12, color: "#666" }}>
        ※ 自動保存されます（リロードしても消えません） / OUT・IN が 30–80 以外は赤表示
      </p>
    </main>
  );
}
