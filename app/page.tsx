import Image from "next/image";
import portrait from "./suvir-potdar.jpg";
import { changelog, mistakes, profile, rebuilds, rightNow } from "./content";
import { LastPush } from "./last-push";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: "https://suvir.net",
  sameAs: [profile.github, profile.linkedin],
  homeLocation: { "@type": "Place", name: profile.location },
  affiliation: {
    "@type": "EducationalOrganization",
    name: "South Brunswick High School",
  },
  knowsAbout: ["Software engineering", "Linux", "Docker", "Networking", "Python", "TypeScript"],
};

export default function Home() {
  return (
    <>
      <main id="main-content">
        <div className="row intro">
          <div>
            <p className="lede">
              I’m Suvir. I’m seventeen years old, I go to South Brunswick High School,
              and I can’t decide on an operating system.
            </p>
            <p className="body-text">
              Even though most of this page is about my server, it doesn’t capture my
              whole range of abilities. The reason I decided to start with a hook like
              that is because it’s by far my proudest project yet.
            </p>
            <p className="body-text">
              The rest of this website is code. A study app for my AP Statistics class
              that people really used, a macOS app that allows people to show off what
              they’re listening to on Discord, an easy downloader for music just because
              the ones that existed annoyed me, and finally a project for my friends to
              use the SAT question bank just because downloading PDFs for each topic was
              inconvenient.
            </p>
            <p className="body-text">
              I’m graduating in June of 2027. I’m always looking for more work. I’m open
              to internships and part-time positions. I just want people who will let me
              near real infrastructure.
            </p>
          </div>
          <div className="intro-aside">
            <figure className="portrait">
              <Image
                src={portrait}
                alt="Suvir Potdar holding a New Jersey licence plate that reads SENIOR"
                sizes="210px"
                placeholder="blur"
                priority
              />
              <figcaption>Senior photo, 2026.</figcaption>
            </figure>
            <p className="note">
              
            </p>
          </div>
        </div>

        <div className="rule" />

        <section aria-labelledby="rebuilds-title">
          <h2 id="rebuilds-title">
            Here’s the server, rebuild by rebuild. Five rebuilds, three operating
            systems, one gaming PC.
          </h2>

          {rebuilds.map((rebuild) => (
            <div className="row rebuild" key={rebuild.os}>
              <p className="body-text">
                <span className="lead-in">{rebuild.os}.</span> {rebuild.body}
              </p>
              <p className="note">{rebuild.note}</p>
            </div>
          ))}

          <div className="rebuild-close">
            <p className="body-text">
              I didn’t come out of these experiences mastering Linux, exactly. I came out
              knowing that getting a service running was only a third of the work. After
              that, it has to be reachable, logged into, backed up, watched, and easy
              enough that I can fix it at 11 at night or restore from a backup when it
              stops working. Starting from scratch five times wasn’t the best way to
              learn that, looking back.
            </p>
          </div>
        </section>

        <div className="rule" />

        <section aria-labelledby="mistakes-title">
          <h2 id="mistakes-title">
            What I got wrong. Three things I’d rather say myself than have you find out.
          </h2>
          <div className="row mistakes">
            <div>
              {mistakes.map((mistake) => (
                <p className="body-text" key={mistake.lead}>
                  <span className="lead-in">{mistake.lead}</span> {mistake.body}
                </p>
              ))}
            </div>
            <p className="note">A list of only wins isn’t believable.</p>
          </div>
        </section>

        <div className="rule" />

        <section aria-labelledby="now-title">
          <h2 id="now-title">Right now.</h2>
          <dl>
            <div className="dl-row">
              <dt>Last push</dt>
              <dd><LastPush /></dd>
            </div>
            {rightNow.map((fact) => (
              <div className="dl-row" key={fact.term}>
                <dt>{fact.term}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
            <div className="dl-row">
              <dt>Open to</dt>
              <dd>{profile.openTo}</dd>
            </div>
          </dl>
        </section>

        <section className="changelog" aria-labelledby="changelog-title">
          <h2 id="changelog-title">Changes to this page.</h2>
          {changelog.map((change) => (
            <div className="change-row" key={change.text}>
              <span className="change-date">{change.date}</span>
              <span className="change-text">{change.text}</span>
            </div>
          ))}
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </>
  );
}
