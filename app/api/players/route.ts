import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await sql`SELECT id, name, gender, aliases FROM players ORDER BY name`;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { id, name, gender, aliases } = await req.json();
  await sql`
    INSERT INTO players (id, name, gender, aliases)
    VALUES (${id}, ${name}, ${gender}, ${aliases})
  `;
  return NextResponse.json({ ok: true });
}
