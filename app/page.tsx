import Link from "next/link";
import { profile, projects } from "./content";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: "https://suvir.net",
  sameAs: [profile.github, profile.linkedin],
  homeLocation: { "@type": "Place", name: profile.location },
  affiliation: { "@type": "EducationalOrganization", name: "South Brunswick High School" },
  knowsAbout: ["Software engineering", "Infrastructure", "Linux", "Cybersecurity", "Artificial intelligence", "Networking"],
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <>
      <main id="main-content">
        <section className="hero home-hero section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Student engineer · Class of 2027 · New Jersey</p>
            <h1 id="hero-title">I build software, deploy it, and keep it running.</h1>
            <p className="hero-intro">
              I’m Suvir Potdar, a high school student working across software,
              infrastructure, cybersecurity, and AI. My work covers application
              logic, deployment, identity, networking, and operation.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <Link className="primary-action" href="/projects">Explore projects <Arrow /></Link>
              <Link className="text-action" href="/about">About me <Arrow /></Link>
            </div>
          </div>

          <div className="hero-system home-system" aria-label="A conceptual map of Suvir's engineering interests">
            <div className="system-heading"><span>Operating range</span><span>01-08</span></div>
            <div className="system-map">
              {["Applications", "AI workflows", "Linux", "Containers", "Identity", "Networking", "Monitoring", "Cloud"].map((label, index) => (
                <div className="system-node" key={label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
            <p className="availability">
              <span className="status-dot" aria-hidden="true" />
              {profile.availability.label}
            </p>
          </div>
        </section>

        <section className="section-shell home-section" aria-labelledby="selected-work-title">
          <div className="compact-section-head">
            <div><span>01</span><p>Selected work</p></div>
            <h2 id="selected-work-title">Selected projects with clear technical depth.</h2>
            <Link className="text-action" href="/projects">View all projects <Arrow /></Link>
          </div>
          <div className="compact-project-grid">
            {projects.map((project) => (
              <article key={project.slug}>
                <div className="compact-project-top">
                  <span>{project.index}</span>
                  <span>{project.status}</span>
                </div>
                <p className="project-meta">{project.category} · {project.year}</p>
                <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
                <p>{project.summary}</p>
                <div className="compact-project-bottom">
                  <span>{project.technologies.slice(0, 3).join(" · ")}</span>
                  <Link href={`/projects/${project.slug}`} aria-label={`Read ${project.title} case study`}>↗</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell home-section home-engineering" aria-labelledby="engineering-proof-title">
          <div className="compact-section-head">
            <div><span>02</span><p>Engineering</p></div>
            <h2 id="engineering-proof-title">I work across development, deployment, security, and operations.</h2>
            <Link className="text-action" href="/engineering">Engineering practice <Arrow /></Link>
          </div>
          <div className="engineering-proof-grid">
            <div className="proof-pipeline" aria-label="Simplified engineering workflow">
              {["Build", "Deploy", "Secure", "Operate"].map((item, index) => (
                <div key={item}><span>0{index + 1}</span><strong>{item}</strong></div>
              ))}
            </div>
            <div className="proof-copy">
              <p>
                Operating my own infrastructure has made networking, identity,
                observability, recovery, and documentation part of how I plan
                software from the beginning.
              </p>
              <dl>
                <div><dt>Environment</dt><dd>Linux · Containers · Cloud</dd></div>
                <div><dt>Access</dt><dd>Private networks · OAuth / OIDC</dd></div>
                <div><dt>Feedback</dt><dd>Metrics · Logs · Alerts</dd></div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
    </>
  );
}
