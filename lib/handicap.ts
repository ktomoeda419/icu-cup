export type Tee = "regular" | "red";

export function differential(gross: number, courseRating: number, slope: number) {
  return ((gross - courseRating) * 113) / slope;
}

export function handicapV1(diffs: number[]) {
  // diffs: 過去のdifferential配列（小さいほど良い）
  const cleaned = diffs.filter((x) => Number.isFinite(x)).slice(-50); // 念のため
  if (cleaned.length === 0) return 48;

  const last5 = cleaned.slice(-5);
  const sorted = [...last5].sort((a, b) => a - b);
  const take = Math.min(2, sorted.length); // 1回しか無ければ1回
  const avg = sorted.slice(0, take).reduce((s, x) => s + x, 0) / take;

  // 上限48
  return Math.min(48, Math.max(0, Math.round(avg * 10) / 10)); // 小数1桁
}
