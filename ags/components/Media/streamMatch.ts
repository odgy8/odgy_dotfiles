import AstalMpris from "gi://AstalMpris";

import { type SinkInput } from "../Volume/volumeControl";

// Shortest prefix we'll accept as a match, so "vlc" counts but stray two-letter
// fragments don't pair a player with the wrong app.
const MIN_KEY_LENGTH = 3;

function normalise(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// MPRIS and PulseAudio share no id. Pids look like the obvious answer but
// aren't: Brave's audio comes out of a child process, so its stream pid never
// matches the pid in its bus name. Names are what's left.
function playerKeys(player: AstalMpris.Player): string[] {
  const busSuffix = player.busName
    .replace(/^org\.mpris\.MediaPlayer2\./, "")
    .split(".")[0];

  return [player.identity, player.entry, busSuffix]
    .filter(Boolean)
    .map(normalise);
}

/** The PulseAudio stream this player is most likely coming out of, if any. */
export function matchStream(
  player: AstalMpris.Player,
  inputs: SinkInput[],
): SinkInput | null {
  const wanted = playerKeys(player);

  for (const input of inputs) {
    const candidates = [input.name, input.binary].filter(Boolean).map(normalise);

    for (const a of wanted) {
      for (const b of candidates) {
        if (a.length < MIN_KEY_LENGTH || b.length < MIN_KEY_LENGTH) continue;
        if (a.startsWith(b) || b.startsWith(a)) return input;
      }
    }
  }
  return null;
}
