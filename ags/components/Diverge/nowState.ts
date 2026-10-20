import GLib from "gi://GLib";
import { createState } from "ags";
import { execAsync } from "ags/process";
import { interval } from "ags/time";

// What Diverge says is on now. Read over its local socket; null when Diverge isn't running.
interface Block {
  title: string;
  kind: string;
  identifier?: string;
  start: string;
  end: string;
}
interface Now {
  current: Block | null;
  next: Block | null;
}

export const SOCKET = GLib.build_filenamev([GLib.get_home_dir(), ".local", "share", "diverge", "api.sock"]);

const [divergeNow, setDivergeNow] = createState<Now | null>(null);
export { divergeNow };

function refresh() {
  execAsync(["curl", "-sf", "--max-time", "2", "--unix-socket", SOCKET, "http://diverge/v1/now"])
    .then((out) => setDivergeNow(JSON.parse(out) as Now))
    .catch(() => setDivergeNow(null));
}

// No onCleanup: module scope, lives for the whole session.
interval(20_000, refresh);

const hm = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const minsUntil = (iso: string) => Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60_000));
const name = (b: Block) => (b.identifier ? `${b.identifier} ${b.title}` : b.title);

// Only a next block within the hour is worth bar space.
const NEXT_WITHIN = 60;

export function nowLabel(n: Now | null): string {
  if (n?.current) {
    const icon = n.current.kind === "break" ? "󰅶" : "󰔟";
    return `${icon} ${name(n.current)} · ${minsUntil(n.current.end)}m left`;
  }
  if (n?.next && minsUntil(n.next.start) <= NEXT_WITHIN) return `󰔛 ${hm(n.next.start)} ${name(n.next)}`;
  return "";
}

export function nowTooltip(n: Now | null): string {
  const lines: string[] = [];
  if (n?.current) lines.push(`Now: ${name(n.current)} until ${hm(n.current.end)}`);
  if (n?.next) lines.push(`Next: ${name(n.next)} at ${hm(n.next.start)}`);
  return lines.join("\n");
}
