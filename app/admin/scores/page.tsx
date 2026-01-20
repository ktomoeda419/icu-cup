"use client";

import { useEffect, useState } from "react";

type Row = {
  name: string;
  out: number | "";
  in: number | "";
};

const STORAGE_KEY = "icu_scores_draft_v1";

export default function ScoresPage() {
  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 6 }, () => ({ name: "", out: "", in: "" }))
  );

  // 初回：保存データがあれば復元
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setRows(JSON.parse(saved));
  }, []);

  // 変更時：自動保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const updateRow = (i: number, key: keyof Row, value: any) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: value };
    setRows(next);
  };

  const addRow = () =>
    setRows([...rows, { name: "", out: "", in: "" }]);

  const removeRow = (i: number) =>
    setRows(rows.filter((_, idx) => idx !== i));

  const total = (r: Row) =>
    r.out !== "" && r.in !== "" ? Number(r.out) + Number(r.in) : "";

  const invalidOutIn = (v: number | "") =>
    v !== "" && (v < 30 || v > 80);

  return (
    <main style={{ padding: 24 }}>
      <h1>ICU杯 成績入力</h1>

      <button onClick={addRow} style={{ marginTop: 8 }}>
        ＋ 行を追加
      </button>

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
        ※ 自動保存されます（リロードしても消えません）
      </p>
    </main>
  );
}
