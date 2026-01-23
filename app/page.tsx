"use client";

import Link from "next/link";
import { routes } from "../lib/routes";

const Card = ({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) => {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 12,
        textDecoration: "none",
        color: "inherit",
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = "none";
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ marginTop: 8, color: "#555" }}>{description}</p>
    </Link>
  );
};

export default function HomePage() {
  return (
    <main style={{ padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h1>ICU杯</h1>
      <p style={{ color: "#666" }}>ICU高校34期生 ゴルフ大会ポータル</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginTop: 24,
        }}
      >
        <Card
          title="Events"
          description="大会一覧・全員の結果（歴史アーカイブ）"
          href="/events"
        />

        <Card
          title="Players"
          description="プレーヤー一覧・個人成績・ハンディキャップ"
          href={routes.players}
        />

        <Card
          title="Scores（幹事）"
          description="成績入力・大会管理"
          href={routes.adminScores}
        />

        <Card
          title="Players管理（幹事）"
          description="プレーヤーマスタ・名寄せ・性別"
          href={routes.adminPlayers}
        />
      </div>
    </main>
  );
}
