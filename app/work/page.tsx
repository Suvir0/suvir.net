import type { Metadata } from "next";
import { work } from "../content";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Five things Suvir Potdar built and still maintains, with the part that was actually hard.",
};

export default function WorkPage() {
  return (
    <main id="main-content">
      <div className="row intro">
        <p className="lede">
          Five things I built and still maintain, with the part that was actually hard.
        </p>
        <p className="note">
          No status badges, no stack chips. If you want the stack it’s the last line of
          each one.
        </p>
      </div>

      {work.map((item) => (
        <article className="work-item" key={item.title}>
          <p>
            <span className="work-title">
              {item.href ? (
                <a href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.title}
                </a>
              ) : (
                item.title
              )}
            </span>
            <span className="work-meta">&nbsp;&nbsp;{item.meta}</span>
          </p>
          {item.status ? (
            <p className="work-status">
              <span className="work-status-flag">On hold</span>
              {item.status.replace(/^On hold\.\s*/, "")}
            </p>
          ) : null}
          <p>{item.body}</p>
          <p>
            <span className="lead-in">The hard part.</span> {item.hard}
          </p>
          <p className="work-stack">
            {item.stack}
            {item.sourceHref ? (
              <>
                {" "}
                <a href={item.sourceHref} target="_blank" rel="noopener noreferrer">
                  source
                </a>
              </>
            ) : null}
          </p>
        </article>
      ))}
    </main>
  );
}
