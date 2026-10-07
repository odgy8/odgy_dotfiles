import { createState } from "ags";
import { execAsync, subprocess, type Process } from "ags/process";
import { timeout } from "ags/time";
import Gdk from "gi://Gdk";
import GLib from "gi://GLib";

export type CaptureMode =
  | "shot-screen"
  | "shot-window"
  | "shot-region"
  | "rec-screen"
  | "rec-region";

const HOME = GLib.get_home_dir();
const SHOT_DIR = `${HOME}/Pictures/Screenshots`;
const REC_DIR = `${HOME}/Videos/Recordings`;
const THUMB_DIR = `${GLib.get_user_cache_dir()}/ags-capture`;

// Time for the toolbar to actually leave the screen before grim/slurp run.
const HIDE_DELAY_MS = 200;

export const [captureTimer, setCaptureTimer] = createState<0 | 5 | 10>(0);
export const [captureClipboardOnly, setCaptureClipboardOnly] =
  createState(false);
export const [captureMic, setCaptureMic] = createState(false);

// Start time in unix seconds, or 0 when not recording.
export const [recordingSince, setRecordingSince] = createState(0);

export interface LastCapture {
  path: string;
  thumb: string;
  isVideo: boolean;
  monitor: number;
}
export const [lastCapture, setLastCapture] = createState<LastCapture | null>(
  null,
);

const THUMB_MS = 6000;
let thumbTimer: ReturnType<typeof timeout> | null = null;

function showCapture(c: LastCapture) {
  thumbTimer?.cancel();
  setLastCapture(c);
  thumbTimer = timeout(THUMB_MS, () => setLastCapture(null));
}

export function dismissCapture() {
  thumbTimer?.cancel();
  thumbTimer = null;
  setLastCapture(null);
}

let recorder: Process | null = null;

function connectorFor(monitor: number): string {
  const mons = Gdk.Display.get_default()?.get_monitors();
  const mon = mons?.get_item(monitor) as Gdk.Monitor | null;
  return mon?.get_connector() ?? "";
}

function stamp(): string {
  return GLib.DateTime.new_now_local().format("%Y-%m-%d_%H-%M-%S")!;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => timeout(ms, resolve));

async function screenshot(mode: CaptureMode, monitor: number) {
  const name = `${stamp()}.png`;
  const args = ["hyprshot", "-s", "-o", SHOT_DIR, "-f", name];
  if (mode === "shot-screen") args.push("-m", "output", "-m", connectorFor(monitor));
  else if (mode === "shot-window") args.push("-m", "window");
  else args.push("-m", "region");
  if (captureClipboardOnly.get()) args.push("--clipboard-only");

  GLib.mkdir_with_parents(SHOT_DIR, 0o755);
  // Cancelling the selection with Esc is not an error, just no file.
  await execAsync(args).catch(() => {});

  const path = `${SHOT_DIR}/${name}`;
  if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
    showCapture({ path, thumb: path, isVideo: false, monitor });
  }
}

async function startRecording(mode: CaptureMode, monitor: number) {
  if (recorder) return;

  const path = `${REC_DIR}/${stamp()}.mp4`;
  const args = ["wf-recorder", "-f", path];
  if (mode === "rec-region") {
    const geom = await execAsync("slurp").catch(() => "");
    if (!geom) return;
    args.push("-g", geom);
  } else {
    args.push("-o", connectorFor(monitor));
  }
  if (captureMic.get()) args.push("--audio");

  GLib.mkdir_with_parents(REC_DIR, 0o755);
  // wf-recorder logs every frame to stderr - drop it.
  const proc = subprocess(args, () => {}, () => {});
  recorder = proc;
  setRecordingSince(Math.floor(Date.now() / 1000));

  proc.connect("exit", () => {
    recorder = null;
    setRecordingSince(0);
    if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
      videoThumb(path).then((thumb) =>
        showCapture({ path, thumb, isVideo: true, monitor }),
      );
    }
  });
}

// First frame as a png, or "" if ffmpeg fails.
async function videoThumb(video: string): Promise<string> {
  GLib.mkdir_with_parents(THUMB_DIR, 0o755);
  const out = `${THUMB_DIR}/${GLib.path_get_basename(video)}.png`;
  try {
    await execAsync([
      "ffmpeg", "-y", "-loglevel", "error", "-i", video,
      "-frames:v", "1", "-vf", "scale=480:-1", out,
    ]);
    return out;
  } catch {
    return "";
  }
}

export function stopRecording() {
  // SIGINT so wf-recorder finishes writing the mp4.
  recorder?.signal(2);
}

// Caller must hide the toolbar first.
export async function runCapture(mode: CaptureMode, monitor: number) {
  await wait(HIDE_DELAY_MS + captureTimer.get() * 1000);
  if (mode.startsWith("shot")) await screenshot(mode, monitor);
  else await startRecording(mode, monitor);
}

export function openPath(path: string) {
  execAsync(["xdg-open", path]).catch(console.error);
}

export function deletePath(path: string) {
  execAsync(["gio", "trash", path]).catch(console.error);
}
