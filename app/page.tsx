import Link from "next/link";
import { profile, projects, skillGroups } from "./content";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: "https://suvir.net",
  sameAs: [profile.github, profile.linkedin],
  homeLocation: {
    "@type": "Place",
    name: "South Brunswick, New Jersey",
  },
  affiliation: {
    "@type": "EducationalOrganization",
    name: "South Brunswick High School",
  },
  knowsAbout: [
    "Software engineering",
    "Infrastructure",
    "Linux",
    "Cybersecurity",
    "Artificial intelligence",
    "Networking",
  ],
};

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function Home() {
  return (
    <>
      <main id="main-content">
        <section className="hero section-shell" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">Student engineer · Class of 2027 · New Jersey</p>
            <h1 id="hero-title">I build systems from first line to steady state.</h1>
            <p className="hero-intro">
              I’m Suvir Potdar, a high school student working across software,
              infrastructure, cybersecurity, and AI. I like understanding how
              every layer—from code and identity to networking and deployment—fits together.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="primary-action" href="#work">View selected work <span aria-hidden="true">↓</span></a>
              <Link className="text-action" href="/resume">Read my résumé <Arrow /></Link>
            </div>
          </div>

          <div className="hero-system" aria-label="A conceptual map of Suvir's engineering interests">
            <div className="system-heading">
              <span>Operating range</span>
              <span>01—08</span>
            </div>
            <div className="system-map">
              {[
                ["01", "Applications"],
                ["02", "AI workflows"],
                ["03", "Linux"],
                ["04", "Containers"],
                ["05", "Identity"],
                ["06", "Networking"],
                ["07", "Monitoring"],
                ["08", "Cloud"],
              ].map(([number, label]) => (
                <div className="system-node" key={number}>
                  <span>{number}</span>
                  <strong>{label}</strong>
                </div>
              ))}
            </div>
            {profile.availability.enabled && (
              <p className="availability">
                <span className="status-dot" aria-hidden="true" />
                {profile.availability.label}
              </p>
            )}
          </div>
        </section>

        <section id="about" className="section-shell ruled-section about-section" aria-labelledby="about-title">
          <div className="section-index">
            <span>01</span>
            <span>About</span>
          </div>
          <div className="section-content about-grid">
            <h2 id="about-title">Curious about the entire system.</h2>
            <div className="about-copy">
              <p>
                I’m a student developer from South Brunswick, New Jersey,
                graduating in 2027. I’m most interested in the work where software,
                infrastructure, security, and AI stop being separate subjects.
              </p>
              <p>
                Running my own infrastructure taught me that useful software needs
                more than working code. It also needs thoughtful architecture,
                secure access, reliable deployment, monitoring, documentation, and maintenance.
              </p>
            </div>
            <dl className="fact-list">
              <div><dt>Education</dt><dd>South Brunswick High School · Class of 2027</dd></div>
              <div><dt>Primary languages</dt><dd>Python · TypeScript · Java</dd></div>
              <div><dt>Focus</dt><dd>Software · AI · Cybersecurity · Infrastructure</dd></div>
              <div><dt>Beyond computing</dt><dd>Aerospace · Physics · F1 · Basketball · Soccer</dd></div>
            </dl>
          </div>
        </section>

        <section id="work" className="section-shell ruled-section" aria-labelledby="work-title">
          <div className="section-index">
            <span>02</span>
            <span>Selected work</span>
          </div>
          <div className="section-content">
            <div className="section-heading-row">
              <h2 id="work-title">Projects with an operational point of view.</h2>
              <Link className="text-action" href="/projects">All projects <Arrow /></Link>
            </div>
            <div className="project-list">
              {projects.map((project) => (
                <article className="project-row" key={project.slug}>
                  <div className="project-number">{project.index}</div>
                  <div className="project-main">
                    <p className="project-meta">{project.category} · {project.year}</p>
                    <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
                    <p>{project.summary}</p>
                    <ul className="tech-list" aria-label={`${project.title} technologies`}>
                      {project.technologies.slice(0, 5).map((technology) => <li key={technology}>{technology}</li>)}
                    </ul>
                  </div>
                  <div className={`project-visual project-visual-${project.slug}`} aria-hidden="true">
                    <span className="visual-status">{project.status}</span>
                    <div className="visual-lines"><i /><i /><i /></div>
                    <span className="visual-code">{project.index} / SYS</span>
                  </div>
                  <Link className="project-link" href={`/projects/${project.slug}`} aria-label={`Read ${project.title} case study`}>
                    Case study <Arrow />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="engineering" className="section-shell ruled-section engineering-section" aria-labelledby="engineering-title">
          <div className="section-index">
            <span>03</span>
            <span>Engineering</span>
          </div>
          <div className="section-content">
            <div className="engineering-intro">
              <h2 id="engineering-title">From source code to a maintained system.</h2>
              <p>
                I enjoy writing the application, but I also want to know how it is
                deployed, authenticated, observed, updated, and protected. The
                diagram is conceptual—not a map of any live environment.
              </p>
            </div>

            <div className="pipeline" aria-label="Simplified conceptual infrastructure diagram">
              {[
                ["Request", "Users"],
                ["Route", "DNS + TLS"],
                ["Access", "Private network"],
                ["Control", "Identity / SSO"],
                ["Runtime", "Container services"],
                ["Operate", "Metrics + storage"],
              ].map(([label, value], index) => (
                <div className="pipeline-step" key={label}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="capability-grid">
              <div><span>Build</span><p>Python · TypeScript · Java · APIs · Automation · Git</p></div>
              <div><span>Deploy</span><p>Linux · Docker · Virtualization · Cloud · DNS · TLS</p></div>
              <div><span>Secure</span><p>OAuth 2.0 · OIDC · SSO · Private networking · Access control</p></div>
              <div><span>Operate</span><p>Grafana · Metrics · Alerts · Logs · Troubleshooting · Documentation</p></div>
            </div>
          </div>
        </section>

        <section id="experience" className="section-shell ruled-section" aria-labelledby="experience-title">
          <div className="section-index">
            <span>04</span>
            <span>Experience</span>
          </div>
          <div className="section-content">
            <h2 id="experience-title">Learning through sustained ownership.</h2>
            <div className="timeline">
              <article>
                <div className="timeline-date">2023—Present</div>
                <div>
                  <p className="project-meta">Personal Infrastructure Lab · Self-directed</p>
                  <h3>Infrastructure engineering</h3>
                  <p>Design and maintain a self-hosted environment for virtualization, containers, identity, networking, monitoring, and secure service deployment.</p>
                </div>
              </article>
              <article>
                <div className="timeline-date">2025</div>
                <div>
                  <p className="project-meta">GuessThatStat · Student project</p>
                  <h3>Developer</h3>
                  <p>Designed and shipped an interactive statistics practice application, then refined the product based on feedback from classmates.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="section-shell ruled-section" aria-labelledby="education-title">
          <div className="section-index">
            <span>05</span>
            <span>Education + skills</span>
          </div>
          <div className="section-content education-layout">
            <div className="education-block">
              <p className="project-meta">South Brunswick High School</p>
              <h2 id="education-title">High School Diploma, expected June 2027.</h2>
              <p>Advanced coursework in mathematics, physics, computer science, statistics, and written communication.</p>
              <ul className="coursework-list">
                <li>AP Calculus BC</li>
                <li>AP Statistics</li>
                <li>AP Physics C: Mechanics</li>
                <li>AP Physics C: E&amp;M</li>
                <li>AP Computer Science A</li>
                <li>AP English Language</li>
              </ul>
            </div>
            <div className="skills-list">
              {skillGroups.map((group) => (
                <div key={group.label}>
                  <h3>{group.label}</h3>
                  <p>{group.items.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell ruled-section ai-section" aria-labelledby="ai-title">
          <div className="section-index">
            <span>06</span>
            <span>AI-assisted engineering</span>
          </div>
          <div className="section-content ai-layout">
            <h2 id="ai-title">Use the tool. Understand the result.</h2>
            <div>
              <p>
                I use AI-assisted development to explore unfamiliar codebases,
                compare approaches, automate repetitive work, and accelerate debugging.
              </p>
              <p>
                Generated code is a starting point, not a finished answer. I review
                changes, test behavior, inspect failures, and refine the result until
                I understand what is running and why.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="section-shell contact-section" aria-labelledby="contact-title">
          <div>
            <p className="eyebrow">07 / Contact</p>
            <h2 id="contact-title">Let’s build something useful.</h2>
          </div>
          <div className="contact-copy">
            <p>
              I’m interested in internships, technical mentorship, collaborative
              projects, and teams where I can contribute real work while continuing to grow.
            </p>
            <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email} <Arrow /></a>
            <div className="social-links">
              <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub <Arrow /></a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <Arrow /></a>
              <Link href="/resume">Résumé <Arrow /></Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <p>© {new Date().getFullYear()} Suvir Potdar</p>
        <p>Designed and operated by Suvir.</p>
        <p>Built with React, TypeScript, and stubborn curiosity.</p>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </>
  );
}
