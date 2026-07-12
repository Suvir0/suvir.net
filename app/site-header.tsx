"use client";

import Link from "next/link";

export function SiteHeader() {
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("suvir-theme", next);
  }

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" aria-label="Suvir Potdar, home">
          <span className="brand-mark" aria-hidden="true">SP</span>
          <span>Suvir Potdar</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          <Link href="/#about">About</Link>
          <Link href="/#work">Work</Link>
          <Link href="/#engineering">Engineering</Link>
          <Link href="/#experience">Experience</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/resume">Résumé</Link>
        </nav>

        <div className="header-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle color theme"
            title="Toggle color theme"
          >
            <span aria-hidden="true">◐</span>
            <span className="theme-label">Theme</span>
          </button>

          <details className="mobile-menu">
            <summary aria-label="Open navigation">Menu</summary>
            <nav aria-label="Mobile navigation">
              <Link href="/#about">About</Link>
              <Link href="/#work">Work</Link>
              <Link href="/#engineering">Engineering</Link>
              <Link href="/#experience">Experience</Link>
              <Link href="/#contact">Contact</Link>
              <Link href="/resume">Résumé</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
