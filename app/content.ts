export type ProjectStatus = "Live" | "Maintained" | "Ongoing";

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  status: ProjectStatus;
  year: string;
  summary: string;
  description: string;
  technologies: string[];
  href?: string;
  hrefLabel?: string;
  challenge: string;
  approach: string;
  decisions: string[];
  lessons: string[];
};

export const profile = {
  name: "Suvir Potdar",
  initials: "SP",
  location: "South Brunswick, New Jersey",
  graduationYear: 2027,
  email: "suvir@suvir.net",
  github: "https://github.com/Suvir0",
  linkedin: "https://www.linkedin.com/in/suvir-p/",
  availability: {
    enabled: true,
    label: "Open to internships, mentorship, and collaborative projects",
  },
};

export const projects: Project[] = [
  {
    slug: "guess-that-stat",
    index: "01",
    title: "GuessThatStat",
    category: "Educational web application",
    status: "Live",
    year: "2025",
    summary:
      "An interactive statistics practice app built to make AP Statistics review more immediate and engaging.",
    description:
      "GuessThatStat turns practice questions into a focused game loop with answer evaluation, immediate feedback, score tracking, and question progression. It began as a practical study tool for classmates and became an exercise in shipping a real product for real users.",
    technologies: ["React", "TypeScript", "HTML", "CSS"],
    href: "https://gts.suvir.net",
    hrefLabel: "Open live application",
    challenge:
      "Make statistics review feel less like a worksheet without hiding the reasoning that makes each answer useful.",
    approach:
      "I designed a short interaction loop: present a focused question, evaluate the response, explain the result, and move the learner forward while preserving a clear sense of progress.",
    decisions: [
      "Keep feedback immediate so mistakes become part of the learning loop.",
      "Use explicit progression and scoring state rather than disconnected question screens.",
      "Prioritize a fast, browser-based experience that classmates could use without setup.",
    ],
    lessons: [
      "Peer feedback reveals interaction problems that are easy to miss while building alone.",
      "Reliable state transitions matter as much as visual design in an educational tool.",
      "A small, deployed product can be more valuable than a larger unfinished idea.",
    ],
  },
  {
    slug: "infrastructure-lab",
    index: "02",
    title: "Infrastructure Lab",
    category: "Infrastructure · Security · Networking",
    status: "Ongoing",
    year: "2023—Present",
    summary:
      "A maintained environment for learning virtualization, containers, identity, networking, monitoring, and secure service operation.",
    description:
      "My self-hosted environment is a practical laboratory for the work that begins after an application leaves a development machine. I plan deployments, manage access, investigate failures, monitor services, and document changes across virtualized, containerized, and cloud-connected systems.",
    technologies: [
      "Linux",
      "Proxmox",
      "Docker",
      "Cloudflare",
      "Authentik",
      "Grafana",
      "Networking",
      "OAuth 2.0 / OIDC",
    ],
    challenge:
      "Understand how software behaves as a maintained system, including the dependencies, permissions, networks, certificates, and operational failures that local development rarely exposes.",
    approach:
      "I treat the environment as a continuously evolving lab: isolate workloads, document access paths, centralize identity where appropriate, monitor health, and make changes with recovery in mind.",
    decisions: [
      "Separate services into virtualized or containerized workloads according to their operational needs.",
      "Use private networking and centralized identity concepts instead of exposing administration surfaces.",
      "Build monitoring and documentation alongside deployment rather than after problems appear.",
    ],
    lessons: [
      "Deployment is an ongoing engineering responsibility, not a final button press.",
      "Most failures cross boundaries between configuration, networking, storage, and permissions.",
      "Simple diagrams and accurate runbooks reduce the cost of future troubleshooting.",
    ],
  },
  {
    slug: "ripuz",
    index: "03",
    title: "Ripuz",
    category: "Python automation and metadata workflow",
    status: "Maintained",
    year: "2026",
    summary:
      "A containerized Python workflow that coordinates external tools, metadata, files, and long-running jobs into consistent output.",
    description:
      "Ripuz explores how independent utilities and data sources can become one repeatable system. The project combines a FastAPI service, a persistent job queue, metadata processing, subprocess coordination, a browser interface, and containerized deployment.",
    technologies: [
      "Python",
      "FastAPI",
      "Docker",
      "SQLite",
      "Metadata processing",
      "Automated testing",
    ],
    challenge:
      "Coordinate tools with inconsistent output and failure behavior while keeping long-running work observable, repeatable, and safe to resume.",
    approach:
      "I separated request handling, job state, external integrations, file movement, verification, and cleanup into explicit stages backed by persistent state and tests around failure-prone boundaries.",
    decisions: [
      "Use a durable job model so progress and failures remain visible across a long workflow.",
      "Add preflight planning and confirmation before large batches begin.",
      "Verify output before cleanup and isolate external systems behind testable adapters.",
    ],
    lessons: [
      "Integration work is mostly about defining failure behavior and trustworthy boundaries.",
      "Idempotency and deduplication become essential when jobs can overlap or restart.",
      "Operational safeguards are product features, even when users rarely notice them.",
    ],
  },
];

export const skillGroups = [
  {
    label: "Primary",
    items: ["Python", "TypeScript", "Linux", "Docker", "Networking", "Git / GitHub"],
  },
  {
    label: "Working knowledge",
    items: ["Java", "Proxmox", "Unraid", "Cloudflare", "Grafana", "OAuth / OIDC"],
  },
  {
    label: "Currently exploring",
    items: ["Cybersecurity engineering", "Agentic AI systems", "Scalable architecture", "Aerospace simulation"],
  },
];

