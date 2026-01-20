"use client";

import { useEffect, useMemo, useState } from "react";

type Gender = "M" | "F";
type Player = {
  id: string;
  name: string;      // 正式名（表示用）
  gender: Gender;    // 男=Regular, 女=Red の前提
  aliases: string[]; // 表記ゆれ（ローマ字/漢字/あだ名など）
};

const PLAYERS_KEY = "icu_players_v1";

const uid = () => Math.random().toString(36).slice(2, 10);

function normalize(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[‐-–—−]/g, "-");
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("M");
  const [aliasesText, setAliasesText] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PLAYERS_KEY);
      if (saved) setPlayers(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  }, [players]);

  const addPlayer = () => {
    const n = name.trim();
    if (!n) return;

    const aliases = aliasesText
      .split(/[,\n]/)
      .map((x) => x.trim())
      .filter(Boolean);

    const p: Player = {
      id: uid(),
      name: n,
      gender,
      aliases,
    };

    setPlayers((prev) => [...prev, p]);
    setName("");
    setAliasesText("");
    setGender("M");
  };

  const removePlayer = (id: string) => {
    if (!confirm("削除しますか？")) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const updatePlayer = (id: string, patch: Partial<Player>) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  // 衝突チェック（同じ正規化文字列が複数人に割り当てられてないか）
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

          <div>別名（任意）</div>
          <textarea
            value={aliasesText}
            onChange={(e) => setAliasesText(e.target.value)}
            placeholder={"カンマ or 改行区切り\n例：Tomoeda Koki, Koki Tomoeda, ともえだ"}
            rows={3}
          />
        </div>

        <button onClick={addPlayer} style={{ marginTop: 10 }}>
          ＋ 追加
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
        <table border={1} cellPadding={8} style={{ width: "100%", maxWidth: 980 }}>
          <thead>
            <tr>
              <th>正式名</th>
              <th>性別</th>
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
                  <button onClick={() => removePlayer(p.id)}>削除</button>
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
      </section>

      <p style={{ marginTop: 12, color: "#666" }}>
        ※ データはブラウザ内（localStorage）に保存されます。将来Supabaseに移行できます。
      </p>
    </main>
  );
}
