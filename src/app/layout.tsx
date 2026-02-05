import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentLinter — ESLint for AI Agents",
  description:
    "Score, diagnose, and auto-fix your CLAUDE.md and agent workspace files. Sharpen your agent's edge.",
  openGraph: {
    title: "AgentLinter — ESLint for AI Agents",
    description: "Score, diagnose, and auto-fix your AI agent workspace files.",
    url: "https://agentlinter.com",
    siteName: "AgentLinter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentLinter — ESLint for AI Agents",
    description: "Score, diagnose, and auto-fix your AI agent workspace files.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
