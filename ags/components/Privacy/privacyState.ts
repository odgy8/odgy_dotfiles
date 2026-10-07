import { createPoll } from "ags/time";
import { execAsync } from "ags/process";
import GLib from "gi://GLib";

export interface PrivacyState {
  mic: string[];
  camera: string[];
}

const POLL_MS = 2000;

// App names with an uncorked capture stream on a real mic. Monitor sources
// (recording what's playing) are not the mic, so they don't count.
async function micUsers(): Promise<string[]> {
  const [outsRaw, srcRaw] = await Promise.all([
    execAsync(["pactl", "-f", "json", "list", "source-outputs"]),
    execAsync(["pactl", "-f", "json", "list", "sources"]),
  ]);
  const monitors = new Set<number>(
    JSON.parse(srcRaw)
      .filter((s: any) => s.monitor_source)
      .map((s: any) => s.index),
  );
  const names = JSON.parse(outsRaw)
    .filter((o: any) => !o.corked && !monitors.has(o.source))
    .map(
      (o: any) =>
        o.properties?.["application.name"] ??
        o.properties?.["application.process.binary"] ??
        "Unknown",
    );
  return [...new Set<string>(names)];
}

// Process names holding a /dev/video* node open. When an app goes through
// PipeWire this is "pipewire", not the app.
async function cameraUsers(): Promise<string[]> {
  const out = await execAsync([
    "bash", "-c", "fuser /dev/video* 2>/dev/null || true",
  ]);
  const pids = [...new Set(out.split(/\s+/).filter((p) => /^\d+$/.test(p)))];
  const names = pids.map((pid) => {
    try {
      const [, data] = GLib.file_get_contents(`/proc/${pid}/comm`);
      return new TextDecoder().decode(data).trim();
    } catch {
      return pid;
    }
  });
  return [...new Set(names)];
}

const same = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

let last: PrivacyState = { mic: [], camera: [] };

export const privacy = createPoll<PrivacyState>(last, POLL_MS, async () => {
  const [mic, camera] = await Promise.all([
    micUsers().catch(() => []),
    cameraUsers().catch(() => []),
  ]);
  // Same object back when nothing changed, so the bar doesn't redraw every poll.
  if (same(mic, last.mic) && same(camera, last.camera)) return last;
  last = { mic, camera };
  return last;
});
