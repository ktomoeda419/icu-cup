import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// グループ（複数大会）対応のためのマイグレーション。
// 既存データを壊さず、デフォルト「ICU杯」グループに全部割り当てる。
export async function POST() {
  try {
    // 1. groups テーブル
    await sql`
      CREATE TABLE IF NOT EXISTS groups (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        access_code TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ DEFAULT now()
      )
    `;

    // 2. players / events に group_id 列を追加
    await sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS group_id TEXT`;
    await sql`ALTER TABLE events  ADD COLUMN IF NOT EXISTS group_id TEXT`;

    // 3. デフォルトグループ「ICU杯」を用意（access_code は現 SITE_PASSWORD を引き継ぐ）
    const defaultCode = process.env.SITE_PASSWORD ?? "icu";
    let { rows: defaultRows } = await sql`
      SELECT id FROM groups WHERE name = 'ICU杯'
    `;
    if (defaultRows.length === 0) {
      const gid = randomUUID();
      await sql`
        INSERT INTO groups (id, name, access_code)
        VALUES (${gid}, 'ICU杯', ${defaultCode})
        ON CONFLICT (access_code) DO NOTHING
      `;
      ({ rows: defaultRows } = await sql`SELECT id FROM groups WHERE name = 'ICU杯'`);
    }
    const defaultGroupId = defaultRows[0].id as string;

    // 4. group_id 未設定の既存データを ICU杯 に割当
    await sql`UPDATE players SET group_id = ${defaultGroupId} WHERE group_id IS NULL`;
    await sql`UPDATE events  SET group_id = ${defaultGroupId} WHERE group_id IS NULL`;

    return NextResponse.json({
      ok: true,
      message: "グループ移行完了",
      defaultGroupId,
    });
  } catch (e) {
    console.error(e);
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
