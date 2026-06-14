import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await sql`
      ALTER TABLE players
      ADD COLUMN IF NOT EXISTS initial_hc NUMERIC DEFAULT NULL
    `;
    return NextResponse.json({ ok: true, message: "マイグレーション完了" });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
