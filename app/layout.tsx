import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Construtor de Prompts Complexos",
  description: "Assistente robusto e interativo para construção de prompts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
