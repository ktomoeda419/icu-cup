"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Player = { id: string; name: string; gender: "M" | "F" };

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("players")
        .select("id,name,gender")
        .order("name", { ascending: true });

      if (error) setError(error.message);
      else setPlayers((data || []) as Player[]);
    })();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Players</h1>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <ul>
        {players.map((p) => (
          <li key={p.id}>
            <Link href={`/players/${p.id}`}>{p.name}</Link>（{p.gender === "M" ? "男" : "女"}）
          </li>
        ))}
      </ul>

      {(!error && players.length === 0) && (
        <p style={{ color: "#666" }}>まだDBにプレーヤーがいません（SupabaseにplayersをInsertしてね）</p>
      )}
    </main>
  );
}
