import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résumé",
  description: "One-page résumé for Suvir Potdar.",
};

export default function ResumePage() {
  return (
    <main id="main-content">
      <div className="resume-head">
        <p className="lede">Résumé, one page.</p>
        <a href="/suvir-potdar-resume.pdf" download="Suvir-Potdar-Resume.pdf">
          download the pdf
        </a>
      </div>
      <object
        className="resume-frame"
        data="/suvir-potdar-resume.pdf"
        type="application/pdf"
        aria-label="Suvir Potdar résumé"
      >
        <p className="resume-fallback">
          Your browser won’t display the PDF.{" "}
          <a href="/suvir-potdar-resume.pdf">Open it directly.</a>
        </p>
      </object>
    </main>
  );
}
