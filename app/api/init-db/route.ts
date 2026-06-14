import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import playersData from "@/data/players.json";
import eventsData from "@/data/events.json";

export const dynamic = "force-dynamic";

type SeedPlayer = { id: string; name: string; gender: string; aliases: string[] };
type SeedScore = {
  player_id: string;
  out_score?: number | null;
  in_score?: number | null;
  total_score: number;
};
type SeedEvent = {
  id: string;
  name: string;
  event_date: string;
  course_id: string;
  scores?: SeedScore[];
};

export async function POST() {
  try {
    // スキーマ作成
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        gender TEXT NOT NULL,
        aliases TEXT[] DEFAULT '{}'
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        event_date TEXT NOT NULL,
        course_id TEXT NOT NULL
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        player_id TEXT NOT NULL,
        out_score INT,
        in_score INT,
        total_score INT NOT NULL
      )
    `;

    // プレーヤーをシード（既存は上書き）
    for (const p of playersData as SeedPlayer[]) {
      await sql`
        INSERT INTO players (id, name, gender, aliases)
        VALUES (${p.id}, ${p.name}, ${p.gender}, ${p.aliases as unknown as string})
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, gender = EXCLUDED.gender, aliases = EXCLUDED.aliases
      `;
    }

    // イベントをシード
    for (const e of eventsData as SeedEvent[]) {
      await sql`
        INSERT INTO events (id, name, event_date, course_id)
        VALUES (${e.id}, ${e.name}, ${e.event_date}, ${e.course_id})
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, event_date = EXCLUDED.event_date, course_id = EXCLUDED.course_id
      `;

      for (const s of e.scores ?? []) {
        // スコアは重複チェックが難しいので一旦削除して再挿入
        await sql`DELETE FROM scores WHERE event_id = ${e.id} AND player_id = ${s.player_id}`;
        await sql`
          INSERT INTO scores (event_id, player_id, out_score, in_score, total_score)
          VALUES (${e.id}, ${s.player_id}, ${s.out_score ?? null}, ${s.in_score ?? null}, ${s.total_score})
        `;
      }
    }

    return NextResponse.json({ ok: true, message: "DB初期化・シード完了" });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
