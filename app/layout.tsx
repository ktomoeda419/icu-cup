import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "ICU杯",
  description: "ICU高校34期生 ゴルフ大会ポータル",
  appleWebApp: {
    capable: true,
    title: "ICU杯",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // iOS のノッチ/ホームインジケータ領域まで描画を広げる（safe-area と併用）
  viewportFit: "cover",
  themeColor: "#f9fafb",
  // ネイティブアプリらしく、ピンチズームによる意図しない拡大を防ぐ
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-gray-50 text-slate-900">
        <Header />

        <main className="max-w-5xl mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="py-6 text-center text-xs text-slate-400 border-t border-gray-200 mt-8">
          ICU杯 &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
