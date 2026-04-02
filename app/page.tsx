"use client";

import Link from "next/link";
import { routes } from "../lib/routes";

const Card = ({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) => {
  return (
    <Link
      href={href}
      className="group block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-inherit no-underline"
    >
      <div className="text-2xl mb-3">{icon}</div>
      <h2 className="text-base font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
        {title}
      </h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </Link>
  );
};

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-6">
          ⛳ ICU高校34期生
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">
          ICU杯
        </h1>
        <p className="mt-3 text-lg text-slate-500">
          ICU高校34期生 ゴルフ大会ポータル
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Card
          icon="📅"
          title="Events"
          description="大会一覧・全員の結果（歴史アーカイブ）"
          href="/events"
        />
        <Card
          icon="👤"
          title="Players"
          description="プレーヤー一覧・個人成績・ハンディキャップ"
          href={routes.players}
        />
        <Card
          icon="✏️"
          title="Scores（幹事）"
          description="成績入力・大会管理"
          href={routes.adminScores}
        />
        <Card
          icon="⚙️"
          title="Players管理（幹事）"
          description="プレーヤーマスタ・名寄せ・性別"
          href={routes.adminPlayers}
        />
      </div>
    </div>
  );
}
