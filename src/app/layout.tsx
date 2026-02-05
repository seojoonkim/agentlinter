import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentLinter — ESLint for AI Agents",
  description:
    "Score, diagnose, and auto-fix your CLAUDE.md and agent workspace files.",
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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
