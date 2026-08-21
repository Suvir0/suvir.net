"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { profile } from "./content";

const navigation = [
  { href: "/", label: "notes" },
  { href: "/work", label: "work" },
  { href: "/resume", label: "résumé" },
];

export function SiteHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    const path = pathname.replace(/\/+$/, "") || "/";
    return href === "/" ? path === "/" : path.startsWith(href);
  }

  return (
    <header className="topbar">
      <p className="topbar-name">
        <Link href="/">{profile.name}</Link>
        <span className="topbar-place">, {profile.location}</span>
      </p>
      <nav aria-label="Primary">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
        <a href={`mailto:${profile.email}`}>email</a>
      </nav>
    </header>
  );
}
