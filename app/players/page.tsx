import Link from "next/link";
import { getPlayers } from "@/lib/data";

export default function PlayersPage() {
  const players = getPlayers();

  return (
    <main style={{ padding: 24 }}>
      <h1>Players</h1>

      <ul style={{ paddingLeft: 18 }}>
        {players.map((p) => (
          <li key={p.id} style={{ margin: "8px 0" }}>
            <Link href={`/players/${p.id}`} style={{ textDecoration: "none" }}>
              {p.name}
            </Link>{" "}
            <span style={{ color: "#666" }}>
              ({p.gender === "M" ? "M / Regular" : "F / Red"})
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
