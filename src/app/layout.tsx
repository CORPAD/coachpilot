import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CoachPilot",
  description: "Le bras droit IA des coachs sportifs",
};

const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('cp_theme');
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored === 'dark' || (!stored && prefersDark);
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen text-zinc-900 dark:text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
