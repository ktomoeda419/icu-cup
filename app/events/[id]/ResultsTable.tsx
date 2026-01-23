"use client";

import { useMemo, useState } from "react";
import Link from "next/link";


type ResultRow = {
  playerId: string;
  name: string;
  gender: "M" | "F" | string;
  hc: number;
  out: number | null;
  inn: number | null;
  gross: number;
  net: number;
};

function rankRows(rows: ResultRow[], key: "net" | "gross") {
  const sorted = [...rows].sort((a, b) => {
    const da = a[key] - b[key];
    if (da !== 0) return da;
    const tie = key === "net" ? a.gross - b.gross : a.net - b.net;
    if (tie !== 0) return tie;
    return a.name.localeCompare(b.name, "ja");
  });

  let rank = 1;
  return sorted.map((r, idx) => {
    if (idx > 0) {
      const prev = sorted[idx - 1];
      if (r[key] !== prev[key]) rank = idx + 1;
    }
    return { ...r, rank };
  });
}

export default function ResultsTable({ results }: { results: ResultRow[] }) {
  const [mode, setMode] = useState<"net" | "gross">("net");
  const ranked = useMemo(() => rankRows(results, mode), [results, mode]);

  return (
    <section>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <span style={{ fontWeight: 700 }}>並び替え:</span>

        <button
          onClick={() => setMode("net")}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: mode === "net" ? "#111" : "transparent",
            color: mode === "net" ? "#fff" : "inherit",
          }}
        >
          Net順位
        </button>

        <button
          onClick={() => setMode("gross")}
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            border: "1px solid #ddd",
            cursor: "pointer",
            background: mode === "gross" ? "#111" : "transparent",
            color: mode === "gross" ? "#fff" : "inherit",
          }}
        >
          Gross順位
        </button>

        <span style={{ color: "#666", marginLeft: 8 }}>
          {mode === "net" ? "Net昇順（小さいほど上位）" : "Gross昇順（小さいほど上位）"}
        </span>
      </div>

      <table border={1} cellPadding={8} style={{ width: "100%", marginTop: 12 }}>
        <thead>
          <tr>
            <th>順位</th>
            <th>名前</th>
            <th>Gender</th>
            <th>HC(大会時点)</th>
            <th>OUT</th>
            <th>IN</th>
            <th>Gross</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((r: any) => (
            <tr key={r.playerId}>
              <td><b>{r.rank}</b></td>
              <td>
                <Link
                    href={`/players/${r.playerId}`}
                    style={{ textDecoration: "none" }}
                >
                    {r.name}
                </Link>
                </td>
              <td>{r.gender}</td>
              <td>{r.hc}</td>
              <td>{r.out ?? "-"}</td>
              <td>{r.inn ?? "-"}</td>
              <td><b>{r.gross}</b></td>
              <td><b>{r.net}</b></td>
            </tr>
          ))}

          {ranked.length === 0 && (
            <tr>
              <td colSpan={8} style={{ color: "#666" }}>
                まだスコアが登録されていません
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
