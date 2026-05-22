import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name, gender, aliases } = await req.json();
  await sql`
    UPDATE players SET name = ${name}, gender = ${gender}, aliases = ${aliases}
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`DELETE FROM players WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
