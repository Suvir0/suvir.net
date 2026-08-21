export const profile = {
  name: "Suvir Potdar",
  location: "New Jersey",
  graduationYear: 2027,
  email: "hello@suvir.net",
  github: "https://github.com/Suvir0",
  githubUser: "Suvir0",
  linkedin: "https://www.linkedin.com/in/suvir-p/",
  openTo:
    "Internships, and anyone who wants a second pair of hands on their infrastructure.",
};

export type Rebuild = {
  os: string;
  body: string;
  note: string;
};

export const rebuilds: Rebuild[] = [
  {
    os: "Proxmox, on an old HP laptop from 2015",
    body:
      "I picked Proxmox because it was the first recommendation that popped up when you searched for home lab on Reddit and other forums. This was a computer that my family never used, so it seemed perfect. Knowing absolutely nothing about networking, getting the WebUI and the VMs set up was a journey by itself.",
    note: "The laptop is now sitting in a drawer. It still works, though.",
  },
  {
    os: "Proxmox, on my gaming PC",
    body:
      "I stopped playing video games, so I never had a use for it after. I had a Mac now, and that was enough. The PC had a powerful CPU and plenty of RAM, which I upgraded later on. The networking didn’t get easier, but at least I was getting the hang of it. The continuity with the VMs wasn’t great, and I didn’t feel like debugging machines at 3 a.m. because I wanted to watch a movie or people couldn’t access my Minecraft servers.",
    note:
      "I learned about reverse proxies and how easy it is to have your server compromised when exposing services to the web.",
  },
  {
    os: "Unraid",
    body:
      "Unraid was easy. The drives just worked. I was able to run parity, so data loss was rarely a worry. I could do everything I needed with just mouse clicks instead of running Linux commands and praying they worked. This was the best during the school year because it required such low maintenance that I could start the server and forget about it.",
    note: "Lasted the longest of the five rebuilds because of its ease.",
  },
  {
    os: "Proxmox, again",
    body:
      "The ease of Unraid started to feel underwhelming. This was when I realized I actually enjoyed the debugging sessions. Even though they increased my stress level overall, it was fun to learn how a capital letter could take down my whole media stack.",
    note: "The problem wasn’t the OS. I just couldn’t make up my mind.",
  },
  {
    os: "Ubuntu",
    body:
      "I wanted a GUI to explore KDE and Hyprland. Up to this point, I had never used a Linux distro with a GUI. All my work had been in the CLI or the WebUI. The great thing about Ubuntu was that I could use that machine as my main computer via Moonlight and still run every service that I had running on Proxmox.",
    note: "This might change by next summer.",
  },
];

export type Mistake = {
  lead: string;
  body: string;
};

export const mistakes: Mistake[] = [
  {
    lead: "I spent hundreds of dollars on AI tools looking for the best one.",
    body:
      "Different platforms, overlapping subscriptions, months of it. Whichever one is best changes every few weeks, so I was tuning my tools instead of finishing my work. I still use them every day. I just stopped expecting them to know what I meant.",
  },
  {
    lead: "I couldn’t commit to an operating system.",
    body:
      "Five rebuilds means the server spent more time getting set up than it did being used. At least twice I switched because I was bored, not because Proxmox or Unraid was stopping me from doing anything. I like the setup part more than I should, and that is a slow way to get something running.",
  },
  {
    lead: "Sometimes I quit for a week.",
    body:
      "When something is broken deep enough (permissions, DNS, a container that won’t resolve its own hostname) I stop and come back seven days later. It works more often than sitting there does. I have never once found the answer on the night I was mad about it.",
  },
];

export type Fact = {
  term: string;
  value: string;
};

export const rightNow: Fact[] = [
  {
    term: "The server runs",
    value: "Ubuntu, with a desktop on it for once. Docker for anything that will tolerate it.",
  },
  {
    term: "I mostly write",
    value:
      "Python and TypeScript. Java for AP CS, and enough C++ to keep the Discord bridge compiling.",
  },
  {
    term: "Also keeping alive",
    value:
      "Cloudflare DNS and tunnels, an Authentik login for the private stuff, and Grafana dashboards I check more often than I need to.",
  },
  {
    term: "Working on",
    value: "The SAT practice app. Cleaning up the extractor so the repo can go public.",
  },
];

export type Change = {
  date: string;
  text: string;
};

export const changelog: Change[] = [
  {
    date: "August 21, 2026",
    text:
      "Threw out the old site. It had a grid of eight boxes and a slogan and told you nothing about me. Rewrote the whole thing as sentences.",
  },
  {
    date: "August 21, 2026",
    text: "Removed the light and dark toggle. This page is one color, on purpose.",
  },
];

export type Work = {
  title: string;
  status?: string;
  href?: string;
  meta: string;
  body: string;
  hard: string;
  stack: string;
  sourceHref?: string;
};

export const work: Work[] = [
  {
    title: "practice.suvir.net",
    meta: "SAT practice, private, 2026",
    body:
      "A study app over the 3,714-question official SAT bank, plus a rebuild of Bluebook’s testing surface so practicing feels like the real thing instead of a worksheet. I use it myself. It’s gated and the repo is private, because the questions belong to College Board. The software is mine.",
    hard:
      "A Python extractor. The source PDFs set every equation as vector art rather than text, so nothing parsed straight through. It crops each equation off the page and drops the image back exactly where the math belongs.",
    stack: "Vanilla JavaScript, no build step. Two Cloudflare Workers, D1, Python.",
  },
  {
    title: "Roon Rich Presence",
    href: "https://rrp.suvir.net",
    meta: "desktop app, 2026",
    body:
      "A local app that publishes what Roon is playing to Discord. No account, no hosted service, and no listening history leaving the machine. Authorization, settings, and diagnostics all stay on your own device.",
    hard:
      "Discord’s SDK is native and proprietary, so it sits behind a small C++ bridge with a stub backend for development and CI, while Roon discovery and playback mapping live in a tested TypeScript core. Every build ships signed, with checksums, an SBOM, and provenance.",
    stack: "TypeScript, React, Electron, C++, Roon API, GitHub Actions.",
  },
  {
    title: "Ripuz",
    meta: "Python automation, 2026",
    status:
      "On hold. I’m rebranding this one and rewriting most of it. What’s below still runs on my server. It just isn’t the version I want to put my name on yet.",
    body:
      "A containerized workflow that takes a pile of separate command-line tools with inconsistent output and turns them into one repeatable pipeline: request in, durable job queue, metadata processing, verification, cleanup.",
    hard:
      "Making long jobs safe to resume. Once jobs can overlap or restart, idempotency and deduplication stop being nice ideas, and the preflight checks and disk guards have to run before a big batch instead of after it falls over.",
    stack: "Python, FastAPI, Docker, SQLite.",
  },
  {
    title: "GuessThatStat",
    href: "https://gts.suvir.net",
    meta: "study tool, 2025",
    body:
      "An AP Statistics practice app I built for my class. One question, an answer, an immediate explanation, then forward. It started as a way to study and became the first thing I shipped that other people used without me in the room.",
    hard:
      "Not the code, the loop. Classmates found interaction problems in ten minutes that I hadn’t seen in a week of building it alone, and every one of them came down to how fast the feedback showed up.",
    stack: "React, TypeScript, HTML, CSS.",
    sourceHref: "https://github.com/Suvir0/GuessThatStat",
  },
];
