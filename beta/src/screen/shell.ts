import { profile, units, type Rebuild } from "../content";
import { VIEW_TOP, viewRows, textWidth, type Line } from "./doc";
import { C, TextScreen, wrap } from "./textscreen";

// A real prompt on the KVM, reached with `~`. The commands do what they say;
// none of them are a joke at the reader's expense, and none of them report
// anything about the actual machine -- the site's own content rule says no
// live infrastructure status, and a fake `docker ps` naming real services
// would be exactly that with extra steps.

export type ShellHost = {
  booted: Rebuild;
  /** Seconds since the rack was powered on in this session. */
  uptime: () => number;
  /** Hand back to the menu. */
  exit: () => void;
  /** Open a unit's page, as if it had been chosen from the menu. */
  open: (slug: string) => void;
};

const FILES = [
  ["about", "who is running this"],
  ["server", "five rebuilds, three operating systems"],
  ["mistakes", "three things I got wrong"],
  ["resume", "one page, kept current"],
  ["changelog", "what changed here"],
] as const;

export class Shell {
  readonly lines: Line[] = [];
  input = "";
  private history: string[] = [];
  private historyAt = -1;

  constructor(
    readonly host: ShellHost,
    private width: number,
  ) {
    this.say("suvir.net shell. Nothing here talks to the real server.", C.dim);
    this.say("Type `help` for the list, `exit` to go back.", C.dim);
    this.blank();
  }

  setWidth(width: number) {
    this.width = width;
  }

  private say(text: string, colour: string = C.text, indent = 0) {
    for (const line of wrap(text, this.width - indent)) {
      this.lines.push({ text: line, colour, indent });
    }
  }

  private blank() {
    this.lines.push({ text: "", colour: C.text, indent: 0 });
  }

  /** Arrow keys walk back through what has been typed. */
  recall(direction: -1 | 1) {
    if (!this.history.length) return;
    if (this.historyAt === -1 && direction === -1) this.historyAt = this.history.length - 1;
    else this.historyAt = Math.min(this.history.length - 1, Math.max(0, this.historyAt + direction));
    this.input = this.history[this.historyAt] ?? "";
  }

  /** Completes a command name, or a unit slug after `open` / `cat`. */
  complete() {
    const words = this.input.split(/\s+/);
    const last = words[words.length - 1] ?? "";
    if (!last) return;

    const pool =
      words.length > 1
        ? [...units.filter((u) => !u.secret).map((u) => u.slug), ...FILES.map(([name]) => name)]
        : ["help", "ls", "cat", "open", "units", "whoami", "uname", "uptime", "neofetch", "clear", "exit"];

    const hits = pool.filter((candidate) => candidate.startsWith(last));
    if (hits.length === 1) {
      words[words.length - 1] = hits[0]!;
      this.input = words.join(" ") + " ";
    } else if (hits.length > 1) {
      this.say(hits.join("  "), C.dim);
    }
  }

  submit() {
    const raw = this.input.trim();
    this.say(`${prompt(this.host.booted)}${this.input}`, C.bright);
    this.input = "";
    this.historyAt = -1;
    if (!raw) return;
    this.history.push(raw);
    this.run(raw);
    this.blank();
  }

  private run(raw: string) {
    const [command, ...rest] = raw.split(/\s+/);
    const argument = rest.join(" ");

    switch (command) {
      case "help":
        this.say("ls              what is on this machine", C.text);
        this.say("cat <name>      read one of them", C.text);
        this.say("open <unit>     open a project's page", C.text);
        this.say("units           list the units in the rack", C.text);
        this.say("whoami          the operator", C.text);
        this.say("uname           what booted", C.text);
        this.say("uptime          how long this page has been up", C.text);
        this.say("neofetch        the usual", C.text);
        this.say("clear           wipe the scrollback", C.text);
        this.say("exit            back to the menu", C.text);
        return;

      case "ls":
        for (const [name, note] of FILES) this.say(`${name.padEnd(12)}${note}`, C.text);
        this.say(`${"work/".padEnd(12)}${units.filter((u) => !u.secret).length} units`, C.link);
        return;

      case "units":
        for (const unit of units.filter((u) => !u.secret)) {
          this.say(`u${unit.u}  ${unit.slug.padEnd(10)} ${unit.meta}`, C.text);
        }
        return;

      case "cat": {
        if (!argument) return this.say("cat: needs a name. Try `ls`.", C.warn);
        const file = FILES.find(([name]) => name === argument.replace(/\/$/, ""));
        if (!file) {
          const unit = units.find((u) => u.slug === argument && !u.secret);
          if (unit) {
            this.say(unit.title, C.bright);
            for (const line of unit.body) line ? this.say(line, C.text) : this.blank();
            return;
          }
          return this.say(`cat: ${argument}: no such thing`, C.warn);
        }
        this.say(`Use \`open\` or the menu -- ${file[0]} is a page, not a file.`, C.dim);
        return;
      }

      case "open": {
        const unit = units.find((u) => u.slug === argument);
        if (!unit) return this.say(`open: ${argument || "?"}: not a unit. Try \`units\`.`, C.warn);
        this.say(`opening u${unit.u} ${unit.slug} ...`, C.dim);
        this.host.open(unit.slug);
        return;
      }

      case "whoami":
        this.say(`${profile.name}, ${profile.location}. ${profile.school}.`, C.text);
        this.say(`Graduating ${profile.graduation}. ${profile.email}`, C.dim);
        return;

      case "uname":
        this.say(
          `suvir.net ${this.host.booted.os} rebuild-${this.host.booted.n} (${this.host.booted.hardware})`,
          C.text,
        );
        return;

      case "uptime": {
        const seconds = Math.floor(this.host.uptime());
        const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
        const ss = String(seconds % 60).padStart(2, "0");
        this.say(`up ${mm}:${ss}. This page only -- the real one is elsewhere.`, C.text);
        return;
      }

      case "neofetch":
        this.neofetch();
        return;

      case "clear":
        this.lines.length = 0;
        return;

      case "exit":
      case "quit":
        this.host.exit();
        return;

      case "sudo":
        this.say("suvir is not in the sudoers file. This incident has been logged.", C.warn);
        return;

      default:
        this.say(`${command}: command not found. Try \`help\`.`, C.warn);
    }
  }

  private neofetch() {
    const art = [
      "┌──────────┐",
      "│ ▓▓▓▓▓▓▓▓ │",
      "├──────────┤",
      "│ ●●○  ━━━ │",
      "│ ●○○  ━━━ │",
      "│ ●●●  ━━━ │",
      "│ ○○○  ━━━ │",
      "├──────────┤",
      "│ ░░░░░░░░ │",
      "└──────────┘",
    ];
    const facts: Array<[string, string]> = [
      ["operator", `${profile.name}`],
      ["location", profile.location],
      ["os", this.host.booted.os],
      ["rebuilds", "5 (3 operating systems)"],
      ["units", `${units.filter((u) => !u.secret).length} occupied of 24U`],
      ["writes", "Python, TypeScript, some C++"],
      ["contact", profile.email],
    ];

    // Side by side when there is room; stacked when there is not.
    if (this.width >= 56) {
      const rows = Math.max(art.length, facts.length);
      for (let i = 0; i < rows; i++) {
        const left = (art[i] ?? "").padEnd(14);
        const fact = facts[i];
        this.lines.push({ text: left, colour: C.dim, indent: 0 });
        if (fact) {
          this.lines[this.lines.length - 1]!.text = left + fact[0].padEnd(11) + fact[1];
        }
      }
      return;
    }
    for (const line of art) this.lines.push({ text: line, colour: C.dim, indent: 0 });
    this.blank();
    for (const [term, value] of facts) this.say(`${term.padEnd(10)}${value}`, C.text);
  }
}

const prompt = (booted: Rebuild) =>
  `suvir@${booted.os.split(",")[0]!.toLowerCase().replace(/\s+/g, "-")}:~$ `;

export function drawShell(s: TextScreen, shell: Shell, caret: boolean) {
  s.clear();

  s.fill(0, 0, s.cols, 1, C.dim);
  s.write(1, 0, " SHELL", C.bg);
  const right = s.narrow ? "EXIT" : "TYPE EXIT TO LEAVE";
  s.write(s.cols - right.length - 1, 0, right, C.bg);

  const view = viewRows(s.rows) + 3; // the shell has no title block to keep
  const top = VIEW_TOP - 3;

  const line = `${prompt(shell.host.booted)}${shell.input}`;
  const typed = wrap(line, textWidth(s.cols) + 4);
  const body = shell.lines.slice(-(view - typed.length));

  let row = top;
  for (const entry of body) {
    if (row >= top + view) break;
    if (entry.text) s.write(2 + entry.indent, row, entry.text, entry.colour);
    row += 1;
  }
  typed.forEach((text, i) => {
    if (row + i >= top + view) return;
    s.write(2, row + i, text, C.bright);
    if (caret && i === typed.length - 1) s.write(2 + text.length, row + i, "█", C.text);
  });

  s.rule(s.rows - 2, C.dim);
  s.write(1, s.rows - 1, "ESC back   ↑↓ history   TAB complete", C.dim);
}
