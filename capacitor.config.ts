import type { CapacitorConfig } from "@capacitor/cli";

// 本番の Vercel デプロイ URL を入れる。
// 環境変数 CAP_SERVER_URL があればそれを優先（CI やローカルで差し替え可能）。
// 例: https://icu-cup.vercel.app
const SERVER_URL = process.env.CAP_SERVER_URL ?? "https://icu-cup.vercel.app";

const config: CapacitorConfig = {
  appId: "jp.icucup.app",
  appName: "ICU杯",
  // server.url 方式：ネイティブの殻が本番サイトを読み込む。
  // webDir はビルド生成物の置き場として必須だが、server.url 使用時は
  // 中身（www/index.html）は接続失敗時のフォールバックとしてのみ使われる。
  webDir: "www",
  server: {
    url: SERVER_URL,
    cleartext: false,
  },
  ios: {
    // ステータスバーや下部のホームインジケータ領域を WebView に含める
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      backgroundColor: "#f9fafb",
      showSpinner: false,
    },
  },
};

export default config;
