import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function PlayersPage() {
  const { data: players, error } = await supabase
    .from("players")
    .select("id,name,gender")
    .order("name", { ascending: true });

  if (error) return <main style={{ padding: 24 }}>Error: {error.message}</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Players</h1>
      <ul>
        {players?.map((p) => (
          <li key={p.id}>
            <Link href={`/players/${p.id}`}>{p.name}</Link>（{p.gender === "M" ? "男" : "女"}）
          </li>
        ))}
      </ul>
    </main>
  );
}
