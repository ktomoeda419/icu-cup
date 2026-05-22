"use client";

import { useEffect, useMemo, useState } from "react";

type Gender = "M" | "F";
type Player = {
  id: string;
  name: string;
  gender: Gender;
  aliases: string[];
  initial_hc: number | null;
};

const uid = () => crypto.randomUUID();

function normalize(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[‐\-–—−]/g, "-");
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [aliasesText, setAliasesText] = useState("");
  const [initialHc, setInitialHc] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlayers = async () => {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const addPlayer = async () => {
    const n = name.trim();
    if (!n) return;

    const aliases = aliasesText
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean);

    setSaving(true);
    await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: uid(), name: n, gender, aliases, initial_hc: initialHc !== "" ? Number(initialHc) : null }),
    });
    setName("");
    setAliasesText("");
    setGender("M");
    setInitialHc("");
    await fetchPlayers();
    setSaving(false);
  };

  const removePlayer = async (id: string) => {
    if (!confirm("削除しますか？")) return;
    setDeletingId(id);
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    await fetchPlayers();
    setDeletingId(null);
  };

  const updatePlayer = async (id: string, patch: Partial<Player>) => {
    const current = players.find((p) => p.id === id);
    if (!current) return;
    const updated = { ...current, ...patch };
    setPlayers((prev) => prev.map((p) => (p.id === id ? updated : p)));
    await fetch(`/api/players/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const collisions = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const p of players) {
      const keys = [p.name, ...p.aliases].map(normalize).filter(Boolean);
      for (const k of keys) {
        const arr = map.get(k) || [];
        arr.push(p.name);
        map.set(k, arr);
      }
    }
    return Array.from(map.entries()).filter(([, arr]) => new Set(arr).size >= 2);
  }, [players]);

  return (
    <main style={{ padding: 24 }}>
      <h1>ICU杯 Playersマスタ</h1>

      <section style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
        <h2 style={{ marginTop: 0 }}>追加</h2>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 8, maxWidth: 720 }}>
          <div>正式名</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：友枝 弘毅" />

          <div>性別</div>
          <select value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
            <option value="M">男性（Regular）</option>
            <option value="F">女性（Red）</option>
          </select>

          <div>仮ハンデ（任意）</div>
          <input
            type="number"
            min={0}
            max={54}
            step={0.1}
            value={initialHc}
            onChange={(e) => setInitialHc(e.target.value)}
            placeholder="例：18.0"
          />

          <div>別名（任意）</div>
          <textarea
            value={aliasesText}
            onChange={(e) => setAliasesText(e.target.value)}
            placeholder={"カンマ or 改行区切り\n例：Tomoeda Koki, Koki Tomoeda, ともえだ"}
            rows={3}
          />
        </div>

        <button onClick={addPlayer} disabled={saving} style={{ marginTop: 10 }}>
          {saving ? "追加中..." : "＋ 追加"}
        </button>
      </section>

      {collisions.length > 0 && (
        <section style={{ marginTop: 16, padding: 12, border: "1px solid #f5c2c7", background: "#fff5f5" }}>
          <b>⚠ 別名の衝突があります（同じ表記が複数人に割り当てられています）</b>
          <ul>
            {collisions.map(([k, arr]) => (
              <li key={k}>
                <code>{k}</code> → {Array.from(new Set(arr)).join(" / ")}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ marginTop: 16 }}>
        <h2>一覧</h2>
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <table border={1} cellPadding={8} style={{ width: "100%", maxWidth: 980 }}>
            <thead>
              <tr>
                <th>正式名</th>
                <th>性別</th>
                <th>仮ハンデ</th>
                <th>別名（カンマ区切り）</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {players.map((p) => (
                <tr key={p.id}>
                  <td>
                    <input
                      value={p.name}
                      onChange={(e) => updatePlayer(p.id, { name: e.target.value })}
                      style={{ width: "100%" }}
                    />
                  </td>
                  <td>
                    <select
                      value={p.gender}
                      onChange={(e) => updatePlayer(p.id, { gender: e.target.value as Gender })}
                    >
                      <option value="M">男性</option>
                      <option value="F">女性</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={54}
                      step={0.1}
                      value={p.initial_hc ?? ""}
                      onChange={(e) =>
                        updatePlayer(p.id, { initial_hc: e.target.value !== "" ? Number(e.target.value) : null })
                      }
                      style={{ width: 80 }}
                      placeholder="-"
                    />
                  </td>
                  <td>
                    <input
                      value={p.aliases.join(", ")}
                      onChange={(e) =>
                        updatePlayer(p.id, {
                          aliases: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      style={{ width: "100%" }}
                      placeholder="例：Tomoeda Koki, ともえだ"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => removePlayer(p.id)}
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? "削除中..." : "削除"}
                    </button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ color: "#666" }}>
                    まだ登録がありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
