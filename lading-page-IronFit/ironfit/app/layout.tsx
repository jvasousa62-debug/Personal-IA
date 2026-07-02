import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Iron Fit — Personal IA | Treinador Inteligente 24h",
  description:
    "A primeira plataforma de personal trainer com inteligência artificial para academias do Brasil. Treinos personalizados, dieta inteligente e acompanhamento em tempo real.",
  keywords: "personal trainer ia, app academia, inteligência artificial fitness, iron fit",
  openGraph: {
    title: "Iron Fit — Personal IA",
    description: "Seu treinador pessoal disponível 24 horas com IA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700;900&family=Barlow+Condensed:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
