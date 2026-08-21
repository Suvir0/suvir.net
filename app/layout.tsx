import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { profile } from "./content";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Suvir Potdar is a high school student in New Jersey who writes software and runs the machines it ends up on. Notes on the home server, four projects, and a résumé.";

export const metadata: Metadata = {
  metadataBase: new URL("https://suvir.net"),
  title: {
    default: "Suvir Potdar",
    template: "%s — Suvir Potdar",
  },
  description,
  authors: [{ name: profile.name, url: "https://suvir.net" }],
  creator: profile.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://suvir.net",
    siteName: profile.name,
    title: "Suvir Potdar",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "Suvir Potdar",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={bricolage.variable}>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="shell">
          <div className="shell-inner">
            <SiteHeader />
            {children}
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}
