import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Résumé of Suvir Potdar, student software and infrastructure engineer.",
};

export default function ResumePage() {
  return (
    <main id="main-content" className="resume-page section-shell">
      <header className="resume-header">
        <div>
          <p className="eyebrow">Résumé / PDF</p>
          <h1>Suvir Potdar</h1>
        </div>
        <a
          className="primary-action"
          href="/suvir-potdar-resume.pdf"
          download="Suvir-Potdar-Resume.pdf"
        >
          Download PDF <span aria-hidden="true">↓</span>
        </a>
      </header>
      <object
        className="resume-frame"
        data="/suvir-potdar-resume.pdf"
        type="application/pdf"
        aria-label="Suvir Potdar résumé"
      >
        <p className="resume-fallback">
          Your browser cannot display this PDF. <a href="/suvir-potdar-resume.pdf">Open the résumé directly.</a>
        </p>
      </object>
    </main>
  );
}

