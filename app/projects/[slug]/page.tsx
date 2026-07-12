import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "../../content";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const projectIndex = projects.findIndex((item) => item.slug === slug);
  const nextProject = projects[(projectIndex + 1) % projects.length];

  return (
    <main id="main-content">
      <header className="page-hero dense-page-hero section-shell case-hero dense-case-hero">
        <div>
          <p className="eyebrow">{project.index} / {project.category}</p>
          <h1>{project.title}</h1>
          <p className="case-summary">{project.summary}</p>
          {(project.href || project.sourceHref) && (
            <div className="hero-actions" aria-label={`${project.title} links`}>
              {project.href && (
                <a className="primary-action" href={project.href} target="_blank" rel="noopener noreferrer">
                  {project.hrefLabel} <span aria-hidden="true">↗</span>
                </a>
              )}
              {project.sourceHref && (
                <a className="text-action" href={project.sourceHref} target="_blank" rel="noopener noreferrer">
                  View source <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>
          )}
        </div>
        <dl className="case-meta">
          <div><dt>Status</dt><dd>{project.status}</dd></div>
          <div><dt>Date</dt><dd>{project.year}</dd></div>
          <div><dt>Role</dt><dd>Design · Development · Operation</dd></div>
        </dl>
      </header>

      <article className="section-shell case-body">
        <section className="case-section">
          <h2>Overview</h2>
          <p>{project.description}</p>
        </section>
        <section className="case-section">
          <h2>The challenge</h2>
          <p>{project.challenge}</p>
        </section>
        <section className="case-section">
          <h2>The approach</h2>
          <p>{project.approach}</p>
        </section>
        <section className="case-section">
          <h2>Technical decisions</h2>
          <ul>{project.decisions.map((decision) => <li key={decision}>{decision}</li>)}</ul>
        </section>
        <section className="case-section">
          <h2>What I learned</h2>
          <ul>{project.lessons.map((lesson) => <li key={lesson}>{lesson}</li>)}</ul>
        </section>
        <section className="case-section">
          <h2>Technology</h2>
          <ul className="tech-list">
            {project.technologies.map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
        </section>
        <nav className="case-next" aria-label="Case study navigation">
          <Link className="text-action" href="/projects">← All projects</Link>
          <Link className="text-action" href={`/projects/${nextProject.slug}`}>Next: {nextProject.title} →</Link>
        </nav>
      </article>
    </main>
  );
}
