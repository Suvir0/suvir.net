import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "../content";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected software, infrastructure, and automation projects by Suvir Potdar.",
};

export default function ProjectsPage() {
  return (
    <main id="main-content">
      <header className="page-hero section-shell">
        <p className="eyebrow">Selected work / 2023—Present</p>
        <h1>Work that connects code to operation.</h1>
        <p>
          These projects are less about collecting technologies and more about
          learning how interaction design, architecture, deployment, security,
          and maintenance affect one another.
        </p>
      </header>

      <section className="section-shell projects-page-list" aria-label="Project case studies">
        <div className="project-list">
          {projects.map((project) => (
            <article className="project-row" key={project.slug}>
              <div className="project-number">{project.index}</div>
              <div className="project-main">
                <p className="project-meta">{project.category} · {project.year}</p>
                <h2><Link href={`/projects/${project.slug}`}>{project.title}</Link></h2>
                <p>{project.description}</p>
                <ul className="tech-list">
                  {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
                </ul>
              </div>
              <div className={`project-visual project-visual-${project.slug}`} aria-hidden="true">
                <span className="visual-status">{project.status}</span>
                <div className="visual-lines"><i /><i /><i /></div>
                <span className="visual-code">{project.index} / SYS</span>
              </div>
              <Link className="project-link" href={`/projects/${project.slug}`}>
                Case study <span aria-hidden="true">↗</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

