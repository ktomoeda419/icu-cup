"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type GroupOption = { id: string; name: string };

export default function AdminGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // 新規作成
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  // 既存グループの解錠
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockMsg, setUnlockMsg] = useState<string | null>(null);

  const load = () => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((d) => {
        setGroups(d.groups ?? []);
        setActiveId(d.activeId ?? "");
      })
      .catch(() => {});
  };

  useEffect(load, []);

  const createGroup = async () => {
    if (!name.trim() || !code.trim()) return;
    setCreating(true);
    setCreateMsg(null);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, access_code: code }),
    });
    setCreating(false);
    if (res.ok) {
      setCreateMsg(`「${name}」を作成しました（コード: ${code}）`);
      setName("");
      setCode("");
      load();
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setCreateMsg(`エラー: ${d.error ?? "作成に失敗しました"}`);
    }
  };

  const unlock = async () => {
    if (!unlockCode.trim()) return;
    setUnlockMsg(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: unlockCode }),
    });
    if (res.ok) {
      setUnlockMsg("グループを解錠しました");
      setUnlockCode("");
      load();
      router.refresh();
    } else {
      setUnlockMsg("コードが違います");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">グループ管理</h1>

      {/* 参加中グループ */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">参加中のグループ</h2>
        <ul className="divide-y divide-gray-100">
          {groups.map((g) => (
            <li key={g.id} className="py-2 flex items-center gap-2 text-sm">
              <span className="font-medium text-slate-900">{g.name}</span>
              {g.id === activeId && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  選択中
                </span>
              )}
            </li>
          ))}
          {groups.length === 0 && (
            <li className="py-2 text-sm text-slate-400">まだありません</li>
          )}
        </ul>
      </section>

      {/* 新規グループ作成 */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">新しいグループを作成</h2>
        <div className="flex flex-col gap-3 max-w-md">
          <input
            placeholder="グループ名（例: 田中家コンペ）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <input
            placeholder="アクセスコード（メンバーに共有）"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={createGroup}
            disabled={creating}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold py-2 rounded-md transition-colors text-sm"
          >
            {creating ? "作成中…" : "作成して切替"}
          </button>
          {createMsg && <p className="text-sm text-slate-600">{createMsg}</p>}
        </div>
      </section>

      {/* 既存グループの解錠 */}
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">
          他のグループに参加（コード入力）
        </h2>
        <div className="flex flex-col gap-3 max-w-md">
          <input
            placeholder="アクセスコード"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
          <button
            onClick={unlock}
            className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 rounded-md transition-colors text-sm"
          >
            参加する
          </button>
          {unlockMsg && <p className="text-sm text-slate-600">{unlockMsg}</p>}
        </div>
      </section>
    </div>
  );
}
