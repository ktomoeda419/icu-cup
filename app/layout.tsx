import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "ICU杯",
  description: "ICU高校34期生 ゴルフ大会ポータル",
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
