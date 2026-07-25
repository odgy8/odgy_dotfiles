import { createPoll } from "ags/time";
import { execAsync } from "ags/process";

function parseBraveStreamIdAndVolume(
  stdout: string,
): { id: number; volume: number } | null {
  const blocks = stdout.split(/\n(?=Sink Input #\d+)/g);
  for (const block of blocks) {
    const idMatch = block.match(/Sink Input #(\d+)/);
    if (!idMatch) continue;

    const isBrave =
      /application\.process\.binary = "(brave|brave-browser)"/.test(block) ||
      /application\.name = "Brave[^"]*"/.test(block);
    if (!isBrave) continue;

    const volumeMatch = block.match(/Volume:[^\n]*?(\d+)%/);
    const id = Number(idMatch[1]);
    const volume = Number(volumeMatch?.[1] ?? 0);
    return { id, volume: Number.isFinite(volume) ? volume : 0 };
  }
  return null;
}

async function getBraveStreamInfo() {
  try {
    const stdout = await execAsync(["pactl", "list", "sink-inputs"]);
    return parseBraveStreamIdAndVolume(stdout);
  } catch {
    return null;
  }
}

async function setBraveVolumePercent(percent: number): Promise<void> {
  const info = await getBraveStreamInfo();
  if (!info) return;
  const pct = Math.max(0, Math.min(150, Math.round(percent)));
  await execAsync([
    "pactl",
    "set-sink-input-volume",
    String(info.id),
    `${pct}%`,
  ]);
}

const sinkVolumePercent = createPoll(0, 1000, async () => {
  try {
    const stdout = await execAsync([
      "pactl",
      "get-sink-volume",
      "@DEFAULT_SINK@",
    ]);
    const match = stdout.match(/(\d+)%/);
    return Number(match?.[1] ?? 0);
  } catch {
    return 0;
  }
});

const sinkMute = createPoll(false, 1000, async () => {
  try {
    const stdout = await execAsync([
      "pactl",
      "get-sink-mute",
      "@DEFAULT_SINK@",
    ]);
    return stdout.includes("yes");
  } catch {
    return false;
  }
});

const sourceVolumePercent = createPoll(0, 1000, async () => {
  try {
    const stdout = await execAsync([
      "pactl",
      "get-source-volume",
      "@DEFAULT_SOURCE@",
    ]);
    const match = stdout.match(/(\d+)%/);
    return Number(match?.[1] ?? 0);
  } catch {
    return 0;
  }
});

const sourceMute = createPoll(false, 1000, async () => {
  try {
    const stdout = await execAsync([
      "pactl",
      "get-source-mute",
      "@DEFAULT_SOURCE@",
    ]);
    return stdout.includes("yes");
  } catch {
    return false;
  }
});

const braveNowPlaying = createPoll("Brave not playing", 1500, async () => {
  try {
    const stdout = await execAsync([
      "playerctl",
      "--player=brave",
      "metadata",
      "--format",
      "{{ artist }} - {{ title }}",
    ]);
    const value = stdout.trim().replace(/^-\s*/, "");
    return value.length > 0 ? value : "Brave is playing";
  } catch {
    return "Brave not playing";
  }
});

const braveStatus = createPoll("Stopped", 1500, async () => {
  try {
    const stdout = await execAsync(["playerctl", "--player=brave", "status"]);
    return stdout.trim();
  } catch {
    return "Stopped";
  }
});

const braveVolumePercent = createPoll(0, 1200, async () => {
  const info = await getBraveStreamInfo();
  return info ? info.volume : 0;
});

const braveStreamDetected = createPoll(
  false,
  1200,
  async () => (await getBraveStreamInfo()) !== null,
);

export interface Sink {
  id: number;
  name: string;
  description: string;
}

function parseSinks(stdout: string): Sink[] {
  const sinks: Sink[] = [];
  for (const block of stdout.split(/\n(?=Sink #\d+)/g)) {
    const idMatch = block.match(/Sink #(\d+)/);
    if (!idMatch) continue;
    const nameMatch = block.match(/Name: (.+)/);
    const descMatch = block.match(/Description: (.+)/);
    if (!nameMatch) continue;
    sinks.push({
      id: Number(idMatch[1]),
      name: nameMatch[1].trim(),
      description: descMatch?.[1].trim() ?? nameMatch[1].trim(),
    });
  }
  return sinks;
}

export const sinks = createPoll([] as Sink[], 2000, async () => {
  try {
    const stdout = await execAsync(["pactl", "list", "sinks"]);
    return parseSinks(stdout);
  } catch {
    return [];
  }
});

export const defaultSinkName = createPoll("", 1000, async () => {
  try {
    const stdout = await execAsync(["pactl", "get-default-sink"]);
    return stdout.trim();
  } catch {
    return "";
  }
});

export async function setDefaultSink(name: string): Promise<void> {
  await execAsync(["pactl", "set-default-sink", name]);
}

export interface SinkInput {
  id: number;
  name: string;
  iconName: string;
  volume: number;
  mute: boolean;
}

function parseSinkInputs(stdout: string): SinkInput[] {
  const results: SinkInput[] = [];
  for (const block of stdout.split(/\n(?=Sink Input #\d+)/g)) {
    const idMatch = block.match(/Sink Input #(\d+)/);
    if (!idMatch) continue;
    const nameMatch = block.match(/application\.name = "([^"]+)"/);
    if (!nameMatch) continue;
    const iconMatch = block.match(/application\.icon_name = "([^"]+)"/);
    const binaryMatch = block.match(/application\.process\.binary = "([^"]+)"/);
    const volumeMatch = block.match(/Volume:[^\n]*?(\d+)%/);
    const muteMatch = block.match(/Mute: (yes|no)/);
    results.push({
      id: Number(idMatch[1]),
      name: nameMatch[1],
      iconName: iconMatch?.[1] ?? binaryMatch?.[1] ?? "audio-card",
      volume: Number(volumeMatch?.[1] ?? 0),
      mute: muteMatch?.[1] === "yes",
    });
  }
  return results;
}

export const sinkInputs = createPoll([] as SinkInput[], 1500, async () => {
  try {
    const stdout = await execAsync(["pactl", "list", "sink-inputs"]);
    return parseSinkInputs(stdout);
  } catch {
    return [];
  }
});

export async function setSinkInputVolume(
  id: number,
  percent: number,
): Promise<void> {
  await execAsync([
    "pactl",
    "set-sink-input-volume",
    String(id),
    `${Math.max(0, Math.min(150, Math.round(percent)))}%`,
  ]);
}

export async function toggleSinkInputMute(id: number): Promise<void> {
  await execAsync(["pactl", "set-sink-input-mute", String(id), "toggle"]);
}

export {
  sinkVolumePercent,
  sinkMute,
  sourceVolumePercent,
  sourceMute,
  braveNowPlaying,
  braveStatus,
  braveVolumePercent,
  setBraveVolumePercent,
  braveStreamDetected,
};
