import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachPilot",
  description: "Le bras droit IA des coachs sportifs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
