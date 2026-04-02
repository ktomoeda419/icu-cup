import Link from "next/link";
import { getPlayers } from "@/lib/data";

export default function PlayersPage() {
  const players = getPlayers();

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">プレーヤー一覧</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((p) => (
          <Link
            key={p.id}
            href={`/players/${p.id}`}
            className="group flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {p.name.slice(0, 1)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                {p.name}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  p.gender === "M"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-pink-50 text-pink-600"
                }`}
              >
                {p.gender === "M" ? "M / Regular" : "F / Red"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
