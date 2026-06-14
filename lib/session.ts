import { cookies } from "next/headers";

// 解錠済みグループID一覧（カンマ区切り）
export const GROUPS_COOKIE = "icu_groups";
// 現在選択中のグループID
export const ACTIVE_GROUP_COOKIE = "icu_group";

export async function getUnlockedGroupIds(): Promise<string[]> {
  const store = await cookies();
  const raw = store.get(GROUPS_COOKIE)?.value;
  return raw ? raw.split(",").filter(Boolean) : [];
}

// 現在アクティブなグループID。未指定なら解錠済みの先頭。無ければ null。
export async function getActiveGroupId(): Promise<string | null> {
  const store = await cookies();
  const unlocked = await getUnlockedGroupIds();
  const active = store.get(ACTIVE_GROUP_COOKIE)?.value;
  if (active && unlocked.includes(active)) return active;
  return unlocked[0] ?? null;
}
