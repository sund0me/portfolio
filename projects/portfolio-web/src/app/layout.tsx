import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio | AI Automation Engineer",
  description: "AI Automation Engineer: инфраструктура, сети, безопасность и backend для AI-автоматизаций.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
