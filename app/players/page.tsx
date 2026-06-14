import Link from "next/link";
import { redirect } from "next/navigation";
import { getPlayers } from "@/lib/data";
import { getActiveGroupId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const groupId = await getActiveGroupId();
  if (!groupId) redirect("/");
  const players = await getPlayers(groupId);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">プレーヤー一覧</h1>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm divide-y divide-gray-100">
        {players.map((p) => (
          <Link
            key={p.id}
            href={`/players/${p.id}`}
            className="group flex items-center gap-4 px-5 py-3 hover:bg-emerald-50 transition-colors no-underline"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
              {p.name.slice(0, 1)}
            </div>
            <p className="flex-1 text-sm font-medium text-slate-900 group-hover:text-emerald-700 transition-colors">
              {p.name}
            </p>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                p.gender === "M"
                  ? "bg-blue-50 text-blue-600"
                  : "bg-pink-50 text-pink-600"
              }`}
            >
              {p.gender === "M" ? "M / Regular" : "F / Red"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
