import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { SiteHeader } from "./site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "suvir.net";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const requestOrigin = new URL(`${protocol}://${host}`);

  return {
  metadataBase: requestOrigin,
  title: {
    default: "Suvir Potdar — Software, Infrastructure & AI",
    template: "%s — Suvir Potdar",
  },
  description:
    "Portfolio of Suvir Potdar, a New Jersey student developer building software, self-hosted infrastructure, automation, and AI-assisted engineering workflows.",
  keywords: [
    "Suvir Potdar",
    "student developer",
    "software engineering",
    "cybersecurity",
    "Python",
    "TypeScript",
    "Linux",
    "Docker",
    "self-hosted infrastructure",
    "artificial intelligence",
    "New Jersey",
    "Class of 2027",
  ],
  authors: [{ name: "Suvir Potdar", url: "https://suvir.net" }],
  creator: "Suvir Potdar",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: requestOrigin,
    siteName: "Suvir Potdar",
    title: "Suvir Potdar — Software, Infrastructure & AI",
    description:
      "Student engineer building practical software, infrastructure, automation, and AI-assisted workflows.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Suvir Potdar — Software, Infrastructure, AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Suvir Potdar — Software, Infrastructure & AI",
    description:
      "Student engineer building practical software, infrastructure, automation, and AI-assisted workflows.",
    images: ["/og.png"],
  },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('suvir-theme')==='light'?'light':'dark'}catch(e){document.documentElement.dataset.theme='dark'}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
