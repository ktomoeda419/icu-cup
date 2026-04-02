import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { routes } from "../lib/routes";

export const metadata: Metadata = {
  title: "ICU杯",
  description: "ICU高校34期生 ゴルフ大会ポータル",
};

const NavLink = ({
  href,
  label,
  small,
}: {
  href: string;
  label: string;
  small?: boolean;
}) => {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors ${
        small ? "text-xs" : "text-sm font-medium"
      }`}
    >
      {label}
    </Link>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased bg-gray-50 text-slate-900">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <Link
              href={routes.home}
              className="font-extrabold text-lg tracking-tight text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              ICU杯
            </Link>

            <nav className="flex items-center gap-1">
              <NavLink href="/events" label="Events" />
              <NavLink href={routes.players} label="Players" />
              <span className="w-px h-4 bg-gray-200 mx-1" />
              <NavLink href={routes.adminScores} label="Admin / Scores" small />
              <NavLink href={routes.adminPlayers} label="Admin / Players" small />
            </nav>
          </div>
        </header>

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
