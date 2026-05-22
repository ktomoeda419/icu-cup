import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`SELECT id, name, gender, aliases, initial_hc FROM players ORDER BY name`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { id, name, gender, aliases, initial_hc } = await req.json();
  await sql`
    INSERT INTO players (id, name, gender, aliases, initial_hc)
    VALUES (${id}, ${name}, ${gender}, ${aliases}, ${initial_hc ?? null})
  `;
  return NextResponse.json({ ok: true });
}
