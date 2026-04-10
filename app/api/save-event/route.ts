import { NextRequest, NextResponse } from "next/server";

const OWNER = "ktomoeda419";
const REPO = "icu-cup";
const FILE_PATH = "data/events.json";

export async function POST(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN が設定されていません" },
      { status: 500 }
    );
  }

  const newEvent = await req.json();

  // 現在の events.json を GitHub から取得
  const fileRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );

  if (!fileRes.ok) {
    const err = await fileRes.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const fileData = await fileRes.json();
  const current: unknown[] = JSON.parse(
    Buffer.from(fileData.content, "base64").toString("utf-8")
  );

  const exists = current.some((e: any) => e.id === newEvent.id);
  const updated = exists
    ? current.map((e: any) => (e.id === newEvent.id ? newEvent : e))
    : [...current, newEvent];

  const newContentBase64 = Buffer.from(
    JSON.stringify(updated, null, 2)
  ).toString("base64");

  const commitMessage = exists
    ? `大会を更新: ${newEvent.name} (${newEvent.event_date})`
    : `大会を追加: ${newEvent.name} (${newEvent.event_date})`;

  // ファイルを更新（コミット）
  const updateRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: commitMessage,
        content: newContentBase64,
        sha: fileData.sha,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "GITHUB_TOKEN が設定されていません" },
      { status: 500 }
    );
  }

  const { id, name } = await req.json();

  const fileRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
      cache: "no-store",
    }
  );

  if (!fileRes.ok) {
    const err = await fileRes.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  const fileData = await fileRes.json();
  const current: any[] = JSON.parse(
    Buffer.from(fileData.content, "base64").toString("utf-8")
  );

  const updated = current.filter((e) => e.id !== id);

  const newContentBase64 = Buffer.from(
    JSON.stringify(updated, null, 2)
  ).toString("base64");

  const updateRes = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `大会を削除: ${name}`,
        content: newContentBase64,
        sha: fileData.sha,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json();
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
