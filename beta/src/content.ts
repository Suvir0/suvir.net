// Trimmed from ../../app/content.ts. The main site is a reading layout and can
// afford ninety-word paragraphs. This renders into an 80x30 text-mode screen,
// so every entry here keeps the facts and the numbers and drops the setup.
//
// Same facts, same voice. If the main site changes, change this too.

export const profile = {
  name: "Suvir Potdar",
  location: "New Jersey",
  email: "hello@suvir.net",
  github: "https://github.com/Suvir0",
  linkedin: "https://www.linkedin.com/in/suvir-p/",
  graduation: "June 2027",
  school: "South Brunswick High School",
};

export type LedState = "ok" | "busy" | "idle" | "dark";

export type Unit = {
  /** Short name on the rack's front-panel label strip. */
  slug: string;
  /** Title on the KVM screen. */
  title: string;
  meta: string;
  /** Rack position, 1 = bottom. */
  u: number;
  leds: [LedState, LedState, LedState];
  /** Two to four lines. The screen is 80 columns wide. */
  body: string[];
  hard: string[];
  stack: string;
  live?: string;
  source?: string;
  /** Hidden until found. Phase 4 wires the discovery; the unit exists now. */
  secret?: boolean;
};

export const units: Unit[] = [
  {
    slug: "njemail",
    title: "NJ EMAIL SECURITY CENSUS",
    meta: "DNS survey, 2026",
    u: 18,
    leds: ["ok", "busy", "idle"],
    body: [
      "Asks DNS what a mail server asks when a message claims to be from a",
      "school district: is there SPF, is there DMARC, does it say to reject.",
      "All 682 NJ public districts. 29% publish no DMARC at all. Charter",
      "schools are about twice as exposed as regular districts.",
      "",
      "Aggregates only. No district is named anywhere public -- findings go",
      "to the districts and NJCCIC first, so a bad grade is a reason to fix",
      "a record instead of a headline.",
    ],
    hard: [
      "Trusting my own numbers. The first run said 28 districts had an SPF",
      "include loop. There were zero. One visited set for the whole walk,",
      "so two vendors both including Google looked like a cycle. 19",
      "districts got capped at a D for a bug in my code. The fix moved 17",
      "grades, and every move is in the changelog.",
    ],
    stack: "Python, dnspython, SQLite. Cloudflare Worker + D1. No build step.",
    live: "https://njemail.suvir.net",
    source: "https://github.com/Suvir0/nj-email-security-census",
  },
  {
    slug: "practice",
    title: "PRACTICE.SUVIR.NET",
    meta: "SAT practice, private, 2026",
    u: 17,
    leds: ["ok", "idle", "idle"],
    body: [
      "A study app over the 3,714-question official SAT bank, plus a rebuild",
      "of Bluebook's testing surface so practicing feels like the real thing",
      "instead of a worksheet.",
      "",
      "I use it myself. It is gated and the repo is private, because the",
      "questions belong to College Board. The software is mine.",
    ],
    hard: [
      "A Python extractor. The source PDFs set every equation as vector art",
      "rather than text, so nothing parsed straight through. It crops each",
      "equation off the page and drops the image back exactly where the math",
      "belongs.",
    ],
    stack: "Vanilla JavaScript, no build step. Two Cloudflare Workers, D1, Python.",
  },
  {
    slug: "roon-rp",
    title: "ROON RICH PRESENCE",
    meta: "desktop app, 2026",
    u: 16,
    leds: ["ok", "ok", "ok"],
    body: [
      "A local app that publishes what Roon is playing to Discord.",
      "",
      "No account, no hosted service, no listening history leaving the",
      "machine. Authorization, settings and diagnostics all stay on your own",
      "device.",
    ],
    hard: [
      "Discord's SDK is native and proprietary, so it sits behind a small C++",
      "bridge with a stub backend for development and CI, while Roon",
      "discovery and playback mapping live in a tested TypeScript core.",
      "Every build ships signed, with checksums, an SBOM, and provenance.",
    ],
    stack: "TypeScript, React, Electron, C++, Roon API, GitHub Actions.",
    live: "https://rrp.suvir.net",
    source: "https://github.com/Suvir0/roon-rich-presence",
  },
  {
    slug: "ripuz",
    title: "RIPUZ",
    meta: "Python automation, 2026 -- ON HOLD",
    u: 15,
    leds: ["dark", "dark", "dark"],
    body: [
      "A containerized workflow that takes a pile of separate command-line",
      "tools with inconsistent output and turns them into one repeatable",
      "pipeline: request in, durable job queue, metadata processing,",
      "verification, cleanup.",
      "",
      "On hold. I am rebranding this one and rewriting most of it. What is",
      "here still runs on my server. It just is not the version I want to",
      "put my name on yet.",
    ],
    hard: [
      "Making long jobs safe to resume. Once jobs can overlap or restart,",
      "idempotency and deduplication stop being nice ideas, and the preflight",
      "checks and disk guards have to run before a big batch instead of",
      "after it falls over.",
    ],
    stack: "Python, FastAPI, Docker, SQLite.",
  },
  {
    slug: "gts",
    title: "GUESSTHATSTAT",
    meta: "study tool, 2025",
    u: 14,
    leds: ["ok", "idle", "idle"],
    body: [
      "An AP Statistics practice app I built for my class. One question, an",
      "answer, an immediate explanation, then forward.",
      "",
      "It started as a way to study and became the first thing I shipped that",
      "other people used without me in the room.",
    ],
    hard: [
      "Not the code, the loop. Classmates found interaction problems in ten",
      "minutes that I had not seen in a week of building it alone, and every",
      "one of them came down to how fast the feedback showed up.",
    ],
    stack: "React, TypeScript, HTML, CSS.",
    live: "https://gts.suvir.net",
    source: "https://github.com/Suvir0/GuessThatStat",
  },
  {
    // The drawer. Unlabeled and dark on the rack until you click it.
    slug: "probook",
    title: "HP PROBOOK, 2015",
    meta: "the first one",
    u: 3,
    leds: ["dark", "dark", "dark"],
    body: [
      "The first server. A laptop my family never used, running Proxmox",
      "because it was the first thing that came up when you searched for",
      "home lab.",
      "",
      "Knowing absolutely nothing about networking, getting the WebUI and the",
      "VMs up was a journey by itself.",
      "",
      "It is in a drawer now. It still works, though.",
    ],
    hard: [],
    stack: "",
    secret: true,
  },
];

export const about = [
  "I am Suvir. I am seventeen, I go to South Brunswick High School, and I",
  "cannot decide on an operating system.",
  "",
  "Most of this rack is about my server, which does not capture my whole",
  "range -- but it is by far my proudest project yet. The rest is code: a",
  "study app my AP Statistics class actually used, a desktop app that puts",
  "Roon on Discord, a downloader built because the existing ones annoyed me,",
  "an SAT question bank my friends use, and a survey of which New Jersey",
  "school districts have told the world's mail servers to reject email",
  "pretending to be them.",
  "",
  "Graduating June 2027. Always looking for more work -- internships,",
  "part-time. I just want people who will let me near real infrastructure.",
];

export type Rebuild = {
  /** Short label for the boot menu. */
  os: string;
  /** Which of the five this was, counting from the first. */
  n: number;
  hardware: string;
  note: string;
  body: string[];
  /** The line the kernel prints when you boot this entry. */
  boot: string;
  /**
   * What the KVM looks like under this rebuild. `mono` collapses the screen
   * to one colour; `glow` is what the panel spills onto the rack below it.
   */
  display: { mono: number; tint: number; glow: number };
};

/** The boot menu offers these. Newest first, so Ubuntu is the default. */
export const rebuilds: Rebuild[] = [
  {
    os: "Ubuntu",
    display: { mono: 0, tint: 0xffffff, glow: 0x8fffc0 },
    n: 5,
    hardware: "the gaming PC, again",
    note: "This might change by next summer.",
    boot: "Booting Ubuntu ...",
    body: [
      "I wanted a GUI, to explore KDE and Hyprland. Up to this point I had",
      "never used a Linux distro with one -- all my work had been in the CLI",
      "or a WebUI.",
      "",
      "The good part is that I can use the machine as my main computer over",
      "Moonlight and still run every service I had on Proxmox.",
    ],
  },
  {
    os: "Proxmox, again",
    display: { mono: 1, tint: 0xffb648, glow: 0xffb648 },
    n: 4,
    hardware: "the gaming PC",
    note: "The problem was not the OS. I just could not make up my mind.",
    boot: "Booting Proxmox VE (4th rebuild) ...",
    body: [
      "The ease of Unraid started to feel underwhelming. This was when I",
      "realised I actually enjoyed the debugging sessions.",
      "",
      "Even though they raised my stress level overall, it was fun learning",
      "how a single capital letter could take down my whole media stack.",
    ],
  },
  {
    os: "Unraid",
    display: { mono: 1, tint: 0xff8c2f, glow: 0xff8c2f },
    n: 3,
    hardware: "the gaming PC",
    note: "Lasted the longest of the five, because of how little it asked.",
    boot: "Booting Unraid ...",
    body: [
      "Unraid was easy. The drives just worked. I could run parity, so data",
      "loss was rarely a worry, and I could do everything with mouse clicks",
      "instead of Linux commands I was praying would work.",
      "",
      "Best thing during the school year: low enough maintenance that I could",
      "start the server and forget about it.",
    ],
  },
  {
    os: "Proxmox, on my gaming PC",
    display: { mono: 1, tint: 0xe39a3c, glow: 0xe39a3c },
    n: 2,
    hardware: "a gaming PC I had stopped using",
    note: "Learned how easy it is to get compromised exposing services.",
    boot: "Booting Proxmox VE (2nd rebuild) ...",
    body: [
      "I stopped playing video games, so the PC had no use. It had a powerful",
      "CPU and plenty of RAM, which I upgraded later.",
      "",
      "Networking did not get easier, but I was getting the hang of it. VM",
      "continuity was bad, and I did not feel like debugging machines at 3am",
      "because I wanted to watch a movie, or because people could not reach",
      "my Minecraft servers.",
    ],
  },
  {
    os: "Proxmox, on a 2015 HP laptop",
    display: { mono: 1, tint: 0xd8e4ec, glow: 0xd8e4ec },
    n: 1,
    hardware: "a laptop my family never used",
    note: "The laptop is in a drawer now. It still works, though.",
    boot: "Booting Proxmox VE (1st rebuild) ...",
    body: [
      "I picked Proxmox because it was the first recommendation that came up",
      "searching for home lab on Reddit. It was a computer my family never",
      "used, so it seemed perfect.",
      "",
      "Knowing absolutely nothing about networking, getting the WebUI and the",
      "VMs set up was a journey by itself.",
    ],
  },
];

/** What the five rebuilds added up to. Shown under the history. */
export const rebuildClose = [
  "I did not come out of these mastering Linux, exactly. I came out knowing",
  "that getting a service running was only a third of the work. After that it",
  "has to be reachable, logged into, backed up, watched, and easy enough that",
  "I can fix it at 11 at night or restore from a backup when it stops.",
  "",
  "Starting from scratch five times was not the best way to learn that,",
  "looking back.",
];

export type Mistake = { lead: string; body: string[] };

export const mistakes: Mistake[] = [
  {
    lead: "I spent hundreds of dollars on AI tools looking for the best one.",
    body: [
      "Different platforms, overlapping subscriptions, months of it. Whichever",
      "one is best changes every few weeks, so I was tuning my tools instead of",
      "finishing my work.",
      "",
      "I still use them every day. I just stopped expecting them to know what I",
      "meant.",
    ],
  },
  {
    lead: "I could not commit to an operating system.",
    body: [
      "Five rebuilds means the server spent more time getting set up than being",
      "used. At least twice I switched because I was bored, not because Proxmox",
      "or Unraid was stopping me doing anything.",
      "",
      "I like the setup part more than I should, and that is a slow way to get",
      "something running.",
    ],
  },
  {
    lead: "Sometimes I quit for a week.",
    body: [
      "When something is broken deep enough -- permissions, DNS, a container",
      "that will not resolve its own hostname -- I stop and come back seven days",
      "later.",
      "",
      "It works more often than sitting there does. I have never once found the",
      "answer on the night I was mad about it.",
    ],
  },
];

export const mistakesNote = "A list of only wins is not believable.";

export const resume = {
  href: "/suvir-potdar-resume.pdf",
  summary: [
    "High school senior who writes software and runs the infrastructure it",
    "lands on. Three years maintaining a self-hosted server rebuilt across",
    "Proxmox, Unraid and Ubuntu, alongside four shipped projects: a Python",
    "extraction pipeline, a desktop app with a C++ native bridge, and two",
    "study tools used by classmates.",
    "",
    "Seeking internships and part-time engineering work.",
  ],
  education: [
    ["school", "South Brunswick High School, Sep 2023 - Jun 2027"],
    ["standing", "Grade 12, class of 2027. Eleven AP courses by graduation."],
  ] as const,
  coursework: {
    inProgress:
      "AP Cybersecurity, College Computer Applications & Systems, AP Macroeconomics, AP Microeconomics, AP Comparative Government & Politics, AP English IV",
    completed:
      "AP Computer Science A, AP Calculus BC, AP Statistics, AP Physics C: Mechanics, AP Physics C: E&M, AP English Language & Composition",
  },
};

export type Change = { date: string; text: string };

export const changelog: Change[] = [
  {
    date: "2026-11-05",
    text: "Built the rack. Same facts as the main site, told by the machine instead of the page.",
  },
  {
    date: "2026-08-21",
    text: "Threw out the old site. It had a grid of eight boxes and a slogan and told you nothing about me. Rewrote the whole thing as sentences.",
  },
  {
    date: "2026-08-21",
    text: "Removed the light and dark toggle. The main site is one colour, on purpose.",
  },
];

export const rightNow = [
  ["server", "Ubuntu, with a desktop for once. Docker for the rest."],
  ["writing", "Python and TypeScript. Java for AP CS, some C++."],
  ["keeping up", "Cloudflare DNS and tunnels, Authentik, Grafana."],
  ["working on", "The SAT app. Cleaning the extractor to open the repo."],
  ["open to", "Internships. Anyone who needs a second pair of hands."],
] as const;
