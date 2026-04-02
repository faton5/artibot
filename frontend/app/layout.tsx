import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { headers } from "next/headers";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ArtiBot — Assistant IA pour artisans",
  description: "Gérez vos prospects automatiquement avec l'IA",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <ClerkProvider nonce={nonce} dynamic>
      <html lang="fr">
        <body className="antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
