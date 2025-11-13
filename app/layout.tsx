// app/layout.tsx
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"], // <--- ИСПРАВЛЕНО ЗДЕСЬ
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "NeuroVibe PWA",
  description: "Тренируй свою память в стиле киберпанк.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body
        className={`${jetbrainsMono.className} bg-zinc-950 text-zinc-200 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
