# ICU杯 App Store 公開計画書

最終更新: 2026-06-14

このドキュメントは、ICU杯アプリ（Capacitor / server.url 方式）を
**App Store で一般公開**するためのロードマップ。
主役のネイティブ機能は **プッシュ通知**。

---

## 0. 現状

- iOS アプリ化済み（Capacitor `server.url` 方式 = 本番 Vercel サイトを WebView 表示）
- 本番URL: `https://icu-cup.vercel.app`
- セットアップ手順: `CAPACITOR.md` 参照

### 公開の最大の壁: App Store ガイドライン 4.2

> 「単に Web サイトを包んだだけのアプリは却下する」

現状の WebView ラッパーのままでは **ほぼ確実にリジェクト**。
これを通すために **プッシュ通知などのネイティブ機能** を足すのが本計画の核心。

---

## 1. 必要なもの（前提）

| 項目 | 内容 | 費用 |
|------|------|------|
| Apple Developer Program | App Store 公開に必須の年会費 | **$99/年** |
| Mac + Xcode | ビルド・申請に必須 | 無料(Mac所有前提) |
| APNs 認証キー (.p8) | プッシュ送信用。Apple Developer で発行 | 無料 |
| プライバシーポリシー | App Store 申請の必須項目。Web に公開ページが必要 | 無料 |
| アプリアイコン | 1024×1024 PNG | 無料 |
| スクリーンショット | iPhone 各サイズ。申請に必須 | 無料 |

---

## 2. プッシュ通知のアーキテクチャ

```
[管理者が大会/結果を保存]
        │
        ▼
[Next.js API (Vercel)] ──(APNs HTTP/2 + JWT)──> [Apple APNs] ──> [各iPhone]
        │
        ├─ device_tokens テーブルから送信先トークンを取得
        └─ .p8 鍵 + Key ID + Team ID で JWT 署名

[アプリ起動時]
   @capacitor/push-notifications で APNs 登録
        │
        ▼
   デバイストークン取得 → POST /api/push/register → device_tokens に保存
```

### 通知のユースケース
- 🆕 新しい大会が登録されたとき
- 🏆 大会結果が公開されたとき
- （将来）コメント・写真が追加されたとき

---

## 3. 実装タスク

### 3-1. クライアント側（アプリ）
- [ ] `@capacitor/push-notifications` を追加
- [ ] アプリ起動時に通知許可をリクエスト & APNs 登録
- [ ] 取得したデバイストークンを `/api/push/register` に送信
- [ ] 通知タップ時に該当ページ（大会詳細など）へ遷移
- [ ] iOS の `Push Notifications` capability を Xcode で有効化

### 3-2. サーバー側（Next.js / Vercel）
- [ ] `device_tokens` テーブル追加（token, platform, created_at）
- [ ] `POST /api/push/register` … トークン登録（重複は UPSERT）
- [ ] 送信ユーティリティ `lib/push.ts` … APNs HTTP/2 + JWT 署名
- [ ] 大会保存 (`/api/save-event`) 成功時に通知送信をフック
- [ ] 環境変数: `APNS_KEY_ID` / `APNS_TEAM_ID` / `APNS_BUNDLE_ID` / `APNS_P8`（鍵本体）

### 3-3. 申請準備
- [ ] プライバシーポリシーページ `/privacy` を追加して公開
- [ ] アプリアイコン（1024px）+ スプラッシュ生成（`@capacitor/assets`）
- [ ] App Store Connect でアプリ登録（カテゴリ: スポーツ）
- [ ] スクリーンショット撮影（実機 or シミュレータ）
- [ ] 審査メモに「同窓ゴルフ会の私的ポータル + 大会通知機能」と明記

---

## 4. APNs セットアップ手順（koki さんが Apple Developer で実施）

1. [Apple Developer](https://developer.apple.com/account) → Certificates, IDs & Profiles
2. **Keys** → 「+」→ APNs を有効にしてキー作成 → `.p8` をダウンロード（**再DL不可・大切に保管**）
3. 控える値:
   - **Key ID**（キー作成時に表示）
   - **Team ID**（アカウント右上）
   - **Bundle ID** = `jp.icucup.app`
4. これらを Vercel の環境変数に設定（`.p8` の中身は改行込みで `APNS_P8` に貼る）

> ⚠️ `.p8` 鍵は絶対に Git にコミットしない。Vercel の環境変数だけで管理。

---

## 5. 申請〜公開の流れ

1. Xcode で Archive → App Store Connect にアップロード
2. **TestFlight** で身内テスト（推奨。バグ出し）
3. App Store Connect でメタデータ入力（説明・スクショ・プライバシー）
4. 審査提出 → 通常1〜3日
5. （4.2 でリジェクトされたら）プッシュ通知などネイティブ機能を審査メモで強調して再提出

---

## 6. 費用まとめ

| 項目 | 費用 |
|------|------|
| Apple Developer Program | $99 / 年 |
| Vercel（既存） | 現状のまま（無料枠で可） |
| APNs / 通知送信 | 無料（Apple 直送信） |
| **合計** | **実質 $99/年のみ** |

---

## 7. 進め方の提案

1. **今**: 計画書（本ドキュメント）レビュー
2. 次: プッシュ通知の実装（クライアント + サーバー + DB）
   - APNs 鍵が無くてもコードは先に書ける。鍵設定は後から env で。
3. 並行: アイコン/スプラッシュ、プライバシーポリシーページ
4. 最後: koki さんが Apple Developer 登録 → Xcode で申請

> プッシュ通知の実装は鍵が無くても進められるので、レビューOKならすぐ着手できる。
