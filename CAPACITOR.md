# ICU杯 iPhoneアプリ（Capacitor）セットアップ手順

このアプリは **Capacitor の `server.url` 方式** で iPhone アプリ化している。
ネイティブの殻（iOSアプリ）が本番 Vercel サイトを WebView で読み込む構成なので、
SSR・DB・API・ログイン認証は今のまま全部動く。Web を更新すればアプリにも即反映される。

---

## 仕組み（ざっくり）

```
[iPhoneアプリ(殻)] --(全画面WebView)--> [https://本番URL (Vercel)] --> [Postgres]
```

- アプリにコードは同梱しない。常に本番サイトを表示する。
- 接続失敗時のみ `www/index.html`（フォールバック画面）が出る。

---

## 前提（Mac側で必要なもの）

- macOS + **Xcode**（App Store から無料）
- **CocoaPods**: `sudo gem install cocoapods`
- Node.js（このリポジトリが動く環境）
- iPhone 実機（または Xcode のシミュレータ）

---

## 初回セットアップ（Macで実行）

```bash
git pull                       # このブランチの変更を取得
npm install                    # 依存をインストール

# 本番URLを設定（capacitor.config.ts のデフォルトと違う場合のみ）
export CAP_SERVER_URL="https://あなたの本番URL.vercel.app"

npx cap add ios                # iOSネイティブプロジェクトを生成（初回のみ）
npx cap sync ios               # 設定とプラグインを反映
npx cap open ios               # Xcode が開く
```

> `npx cap add ios` / `sync` / `open` は npm scripts でも実行可：
> `npm run ios:add` / `npm run ios:sync` / `npm run ios:open`

---

## Xcode での作業（コード手書きは不要）

1. 左ペインで **App** ターゲットを選択 → **Signing & Capabilities** タブ。
2. **Team** に自分の Apple ID を設定（無料アカウントでもOK）。
   - 無料アカウントの場合、アプリは7日で失効するので再ビルドが必要。
   - Apple Developer Program（$99/年）なら制限なし＆TestFlight配布が可能。
3. 上部で接続した iPhone を選択 → **▶️（Run）** を押す。
4. 初回は iPhone 側で「設定 > 一般 > VPNとデバイス管理」から開発者を信頼。

これでホーム画面に「ICU杯」アイコンが入り、全画面でアプリとして起動する。

---

## アイコン / スプラッシュ画像の差し替え

1. 1024×1024 の PNG アイコンを用意。
2. `@capacitor/assets` で自動生成すると楽:
   ```bash
   npm install -D @capacitor/assets
   # resources/icon.png（1024x1024）と resources/splash.png（2732x2732）を置く
   npx capacitor-assets generate --ios
   npx cap sync ios
   ```

---

## 本番URLを変えたいとき

`capacitor.config.ts` の `SERVER_URL` を直接書き換えるか、
環境変数 `CAP_SERVER_URL` を設定してから `npx cap sync ios` を実行する。

---

## 仲間内に配る方法

- **手軽**: 各自の iPhone を Mac に繋いで Xcode から Run（無料アカウントは7日失効）。
- **おすすめ**: Apple Developer Program に登録 → **TestFlight** で配布（最大1万人、メール招待だけ）。
- App Store 公開も可能だが、Guideline 4.2（単なるWebサイトラッパー禁止）対策として
  プッシュ通知などネイティブ機能の追加が望ましい。

---

## トラブルシュート

| 症状 | 対処 |
|------|------|
| 真っ白／フォールバック画面が出る | `CAP_SERVER_URL` が正しいか、本番サイトが公開されているか確認 |
| ノッチに被る | `npx cap sync ios` をやり直す（`contentInset: always` 設定済み） |
| Pods エラー | `cd ios/App && pod install` |
| 設定変更が反映されない | `npx cap sync ios` を再実行 |
