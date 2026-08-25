// Package imports
import AstalMpris from "gi://AstalMpris";
import { createBinding, createState } from "ags";

const mpris = AstalMpris.get_default();

/** Every MPRIS player currently on the bus. */
export const players = createBinding(mpris, "players");

// Whichever player is actually playing wins, otherwise the first one on the bus -
// a paused Spotify should still be what the bar button opens onto.
export function activePlayer(
  list: AstalMpris.Player[],
): AstalMpris.Player | null {
  return (
    list.find((p) => p.playbackStatus === AstalMpris.PlaybackStatus.PLAYING) ??
    list[0] ??
    null
  );
}

const [trackLabel, setTrackLabel] = createState("");
const [preferredBus, setPreferredBus] = createState<string | null>(null);

export { preferredBus, trackLabel };

let watched: Array<[AstalMpris.Player, number]> = [];

function refresh() {
  const player = activePlayer(mpris.get_players());

  // Empty rather than a placeholder - the bar hides the strip entirely when
  // there is nothing to show.
  const parts = [player?.title, player?.artist].filter(Boolean);
  setTrackLabel(parts.join(" — "));

  // Bus name rather than the player itself, so this only fires when the
  // preferred player really changes and not on every play/pause.
  setPreferredBus(player?.busName ?? null);
}

// Each player carries its own signals, so the whole set gets rewired when the
// list changes rather than trying to diff it.
function rewire() {
  for (const [player, id] of watched) player.disconnect(id);
  watched = [];

  for (const player of mpris.get_players()) {
    for (const signal of [
      "notify::playback-status",
      "notify::title",
      "notify::artist",
    ]) {
      watched.push([player, player.connect(signal, refresh)]);
    }
  }
  refresh();
}

mpris.connect("notify::players", rewire);
rewire();
