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
  sourceHref?: string;
  challenge: string;
  approach: string;
  decisions: string[];
  lessons: string[];
};

export type Experience = {
  period: string;
  title: string;
  context: string;
  summary: string;
  details: string[];
};

export type CapabilityGroup = {
  label: string;
  summary: string;
  items: string[];
};

export const profile = {
  name: "Suvir Potdar",
  initials: "SP",
  location: "South Brunswick, New Jersey",
  graduationYear: 2027,
  email: "hello@suvir.net",
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
    sourceHref: "https://github.com/Suvir0/GuessThatStat",
    challenge:
      "Create an engaging statistics review experience that keeps the reasoning behind each answer visible.",
    approach:
      "I designed a short interaction loop: present a focused question, evaluate the response, explain the result, and move the learner forward while preserving a clear sense of progress.",
    decisions: [
      "Keep feedback immediate so mistakes become part of the learning loop.",
      "Track question progression and scoring in one consistent state model.",
      "Prioritize a fast, browser-based experience that classmates could use without setup.",
    ],
    lessons: [
      "Peer feedback reveals interaction problems that are easy to miss while building alone.",
      "Reliable state transitions matter as much as visual design in an educational tool.",
      "Shipping a focused product for classmates taught me to value completion and direct feedback.",
    ],
  },
  {
    slug: "infrastructure-lab",
    index: "02",
    title: "Infrastructure Lab",
    category: "Infrastructure · Security · Networking",
    status: "Ongoing",
    year: "2023-Present",
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
      "Keep administration surfaces behind private networking and deliberate access controls.",
      "Add monitoring and documentation during deployment.",
    ],
    lessons: [
      "Operating a service requires regular updates, observation, and maintenance.",
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
      "Clear boundaries and explicit failure handling made the integrations easier to test and maintain.",
      "Idempotency and deduplication become essential when jobs can overlap or restart.",
      "Preflight checks, disk guards, and deduplication became essential parts of the workflow.",
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

export const experiences: Experience[] = [
  {
    period: "2023-Present",
    title: "Infrastructure engineering",
    context: "Personal Infrastructure Lab · Self-directed",
    summary:
      "Design and maintain a self-hosted environment for virtualization, containers, identity, networking, monitoring, and secure service deployment.",
    details: [
      "Operate Linux-based virtual machines and containers across self-hosted and cloud-connected environments.",
      "Configure DNS, TLS, reverse proxies, private networking, and remote access.",
      "Build monitoring dashboards and investigate failures involving dependencies, storage, permissions, and configuration.",
    ],
  },
  {
    period: "2025",
    title: "Developer",
    context: "GuessThatStat · Student project",
    summary:
      "Designed and shipped an interactive statistics practice application, then refined the product based on feedback from classmates.",
    details: [
      "Implemented question progression, answer evaluation, score tracking, and immediate feedback.",
      "Structured the frontend in TypeScript and deployed it for use outside a local environment.",
      "Used peer feedback to clarify the interaction and study flow.",
    ],
  },
];

export const coursework = [
  "AP Calculus BC",
  "AP Statistics",
  "AP Physics C: Mechanics",
  "AP Physics C: E&M",
  "AP Computer Science A",
  "AP English Language",
];

export const capabilityGroups: CapabilityGroup[] = [
  {
    label: "Build",
    summary: "Turn a defined problem into a working application or automation workflow.",
    items: ["Python", "TypeScript", "Java", "HTML / CSS", "REST APIs", "Automation", "Git"],
  },
  {
    label: "Deploy",
    summary: "Move software beyond a development machine with repeatable infrastructure.",
    items: ["Linux", "Docker", "Virtual machines", "Containers", "Cloud infrastructure", "Reverse proxies", "DNS", "TLS"],
  },
  {
    label: "Secure",
    summary: "Design access deliberately and minimize unnecessary exposure.",
    items: ["OAuth 2.0", "OpenID Connect", "Single sign-on", "Private networking", "Access control", "Identity management"],
  },
  {
    label: "Operate",
    summary: "Keep systems understandable after deployment and diagnose what changes over time.",
    items: ["Grafana", "Metrics", "Dashboards", "Alerting", "Logs", "Troubleshooting", "Updates", "Documentation"],
  },
];

export const interests = [
  "Aerospace engineering",
  "Physics",
  "Formula 1",
  "Basketball",
  "Soccer",
  "UFC",
];
