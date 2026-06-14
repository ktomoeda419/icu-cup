import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";
import { getActiveGroupId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const groupId = await getActiveGroupId();
  if (!groupId) return NextResponse.json([], { status: 200 });

  const { rows } = await sql`
    SELECT id, name, gender, aliases, initial_hc FROM players
    WHERE group_id = ${groupId}
    ORDER BY name
  `;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const groupId = await getActiveGroupId();
  if (!groupId) {
    return NextResponse.json({ error: "グループ未選択" }, { status: 403 });
  }

  const { id, name, gender, aliases, initial_hc } = await req.json();
  await sql`
    INSERT INTO players (id, name, gender, aliases, initial_hc, group_id)
    VALUES (${id}, ${name}, ${gender}, ${aliases}, ${initial_hc ?? null}, ${groupId})
  `;
  return NextResponse.json({ ok: true });
}
