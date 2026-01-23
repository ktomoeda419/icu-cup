"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TrendRow = {
  event_date: string;
  event_name: string;
  hc_after: number | null;
  diff: number | null;
};

export default function HcChart({ data }: { data: TrendRow[] }) {
  // HCがある行だけ描画
  const chartData = data.filter((d) => d.hc_after != null);

  if (chartData.length === 0) {
    return <p style={{ color: "#666" }}>HC計算可能なデータがありません</p>;
  }

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="event_date" />
          <YAxis reversed domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: any, name) => {
              if (name === "hc_after") return [`HC ${value}`, "HC"];
              if (name === "diff") return [`Diff ${value}`, "Diff"];
              return value;
            }}
            labelFormatter={(label) => `日付: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="hc_after"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
