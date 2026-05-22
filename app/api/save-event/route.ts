import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const event = await req.json();

  const exists = await sql`SELECT id FROM events WHERE id = ${event.id}`;

  if (exists.rows.length > 0) {
    await sql`
      UPDATE events SET name = ${event.name}, event_date = ${event.event_date}, course_id = ${event.course_id}
      WHERE id = ${event.id}
    `;
    await sql`DELETE FROM scores WHERE event_id = ${event.id}`;
  } else {
    await sql`
      INSERT INTO events (id, name, event_date, course_id)
      VALUES (${event.id}, ${event.name}, ${event.event_date}, ${event.course_id})
    `;
  }

  for (const s of event.scores ?? []) {
    await sql`
      INSERT INTO scores (event_id, player_id, out_score, in_score, total_score)
      VALUES (${event.id}, ${s.player_id}, ${s.out_score ?? null}, ${s.in_score ?? null}, ${s.total_score})
    `;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await sql`DELETE FROM events WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
