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
}: {
  href: string;
  label: string;
}) => {
  return (
    <Link
      href={href}
      style={{
        padding: "8px 12px",
        borderRadius: 10,
        textDecoration: "none",
        color: "rgba(0,0,0,0.75)",
        background: "rgba(0,0,0,0.03)",
      }}
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
      <body>
        <header
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            position: "sticky",
            top: 0,
            background: "rgba(250,250,250,0.9)",
            backdropFilter: "blur(8px)",
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: 980,
              margin: "0 auto",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <Link
              href={routes.home}
              style={{
                fontWeight: 800,
                textDecoration: "none",
                color: "inherit",
                letterSpacing: "0.02em",
              }}
            >
              ICU杯
            </Link>

            <nav style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <NavLink href={routes.players} label="Players" />
              <NavLink href={routes.adminScores} label="Admin / Scores" />
              <NavLink href={routes.adminPlayers} label="Admin / Players" />
            </nav>
          </div>
        </header>

        <main style={{ maxWidth: 980, margin: "0 auto" }}>
          {children}
        </main>

        <footer style={{ padding: 24, color: "#888", textAlign: "center" }}>
          ICU杯 © {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
