import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getGroups, getGroup, createGroup } from "@/lib/data";
import {
  getUnlockedGroupIds,
  getActiveGroupId,
  GROUPS_COOKIE,
  ACTIVE_GROUP_COOKIE,
} from "@/lib/session";

export const dynamic = "force-dynamic";

const THIRTY_DAYS = 60 * 60 * 24 * 30;
const cookieOpts = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: THIRTY_DAYS,
};

// 解錠済みグループ一覧（切替UI用。access_code は返さない）
export async function GET() {
  const unlocked = await getUnlockedGroupIds();
  const all = await getGroups();
  const groups = all
    .filter((g) => unlocked.includes(g.id))
    .map((g) => ({ id: g.id, name: g.name }));
  const activeId = await getActiveGroupId();
  return NextResponse.json({ groups, activeId });
}

// 新しいグループを作成（作成者は自動で解錠＆アクティブ化）
export async function POST(req: NextRequest) {
  const { name, access_code } = await req.json();
  if (!name?.trim() || !access_code?.trim()) {
    return NextResponse.json(
      { error: "name と access_code は必須です" },
      { status: 400 }
    );
  }

  const id = randomUUID();
  try {
    await createGroup(id, name.trim(), access_code.trim());
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // access_code の重複など
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const group = await getGroup(id);
  const ids = new Set(await getUnlockedGroupIds());
  ids.add(id);

  const res = NextResponse.json({ ok: true, group });
  res.cookies.set(GROUPS_COOKIE, Array.from(ids).join(","), cookieOpts);
  res.cookies.set(ACTIVE_GROUP_COOKIE, id, cookieOpts);
  return res;
}
