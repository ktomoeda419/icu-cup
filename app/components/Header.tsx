"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { routes } from "../../lib/routes";

const NavLink = ({
  href,
  label,
  small,
}: {
  href: string;
  label: string;
  small?: boolean;
}) => (
  <Link
    href={href}
    className={`px-3 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors ${
      small ? "text-xs" : "text-sm font-medium"
    }`}
  >
    {label}
  </Link>
);

type GroupOption = { id: string; name: string };

function GroupSwitcher() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => {
        setGroups(d.groups ?? []);
        setActiveId(d.activeId ?? "");
      })
      .catch(() => {});
  }, []);

  const onChange = async (id: string) => {
    setActiveId(id);
    await fetch("/api/groups/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
  };

  if (groups.length === 0) return null;

  return (
    <select
      value={activeId}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-400"
      aria-label="グループ切替"
    >
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}

export default function Header() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={routes.home}
            className="font-extrabold text-lg tracking-tight text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            ICU杯
          </Link>
          <GroupSwitcher />
        </div>

        <nav className="flex items-center gap-1">
          <NavLink href="/events" label="Events" />
          <NavLink href={routes.players} label="Players" />
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <NavLink href={routes.adminScores} label="Admin / Scores" small />
          <NavLink href={routes.adminPlayers} label="Admin / Players" small />
          <NavLink href={routes.adminGroups} label="Admin / Groups" small />
        </nav>
      </div>
    </header>
  );
}
