import { NextRequest, NextResponse } from "next/server";
import { getUnlockedGroupIds, ACTIVE_GROUP_COOKIE } from "@/lib/session";

export const dynamic = "force-dynamic";

// アクティブなグループを切り替える（解錠済みのものだけ）
export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const unlocked = await getUnlockedGroupIds();
  if (!id || !unlocked.includes(id)) {
    return NextResponse.json({ error: "未解錠のグループです" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACTIVE_GROUP_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
