"use client";

import { useState } from "react";

type Row = {
  name: string;
  out: number | "";
  in: number | "";
};

export default function ScoresPage() {
  const [rows, setRows] = useState<Row[]>(
    Array.from({ length: 6 }, () => ({ name: "", out: "", in: "" }))
  );

  const updateRow = (i: number, key: keyof Row, value: any) => {
    const next = [...rows];
    next[i] = { ...next[i], [key]: value };
    setRows(next);
  };

  const total = (r: Row) =>
    r.out !== "" && r.in !== "" ? Number(r.out) + Number(r.in) : "";

  const invalidOutIn = (v: number | "") =>
    v !== "" && (v < 30 || v > 80);

  return (
    <main style={{ padding: 24 }}>
      <h1>ICU杯 成績入力</h1>

      <table border={1} cellPadding={8} style={{ marginTop: 16 }}>
        <thead>
          <tr>
            <th>名前</th>
            <th>OUT</th>
            <th>IN</th>
            <th>TOTAL</th>
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
                    updateRow(i, "out", e.target.value === "" ? "" : Number(e.target.value))
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
                    updateRow(i, "in", e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </td>
              <td>{total(r)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: 12, color: "#666" }}>
        ※ OUT/IN が 30–80 以外は赤表示
      </p>
    </main>
  );
}
