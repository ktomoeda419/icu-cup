import { NextRequest, NextResponse } from "next/server";
import { getGroupByAccessCode } from "@/lib/data";
import { GROUPS_COOKIE, ACTIVE_GROUP_COOKIE } from "@/lib/session";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

export async function POST(req: NextRequest) {
  // 後方互換: 旧クライアントは { password }、新クライアントは { code }
  const body = await req.json();
  const code: string | undefined = body.code ?? body.password;

  if (!code) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const group = await getGroupByAccessCode(code);
  if (!group) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 既に解錠済みのグループに今回のグループを追加
  const existing = req.cookies.get(GROUPS_COOKIE)?.value;
  const ids = new Set(existing ? existing.split(",").filter(Boolean) : []);
  ids.add(group.id);

  const res = NextResponse.json({ ok: true, group: { id: group.id, name: group.name } });
  const opts = {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: THIRTY_DAYS,
  };
  res.cookies.set(GROUPS_COOKIE, Array.from(ids).join(","), opts);
  res.cookies.set(ACTIVE_GROUP_COOKIE, group.id, opts);
  // ミドルウェア互換のためのフラグ
  res.cookies.set("icu_auth", "1", opts);
  return res;
}
