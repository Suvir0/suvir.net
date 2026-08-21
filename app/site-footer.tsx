import { profile } from "./content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
      </p>
      <nav aria-label="Elsewhere">
        <a href={profile.github} target="_blank" rel="noopener noreferrer">github</a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">linkedin</a>
      </nav>
      <p className="colophon">suvir.net, written by hand, {new Date().getFullYear()}</p>
    </footer>
  );
}
