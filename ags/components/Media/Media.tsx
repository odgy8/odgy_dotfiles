// Package imports
import AstalMpris from "gi://AstalMpris";
import GLib from "gi://GLib";
import Pango from "gi://Pango";
import { createBinding, createComputed, createState, onCleanup, With } from "ags";
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";

// Style imports
import MediaCss from "./Media.css";

import { activePlayer, players, preferredBus } from "./mediaState";

const POLL_MS = 500;
const ART_PX = 64;

// Anything the poll writes back inside this window after a seek is ignored -
// otherwise the handle snaps back to the old position mid-drag.
const SEEK_GRACE_MS = 900;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayerCard({ player }: { player: AstalMpris.Player }) {
  const title = createBinding(player, "title");
  const artist = createBinding(player, "artist");
  const album = createBinding(player, "album");
  const coverArt = createBinding(player, "coverArt");
  const status = createBinding(player, "playbackStatus");
  const length = createBinding(player, "length");
  const shuffle = createBinding(player, "shuffleStatus");
  const loop = createBinding(player, "loopStatus");
  const canNext = createBinding(player, "canGoNext");
  const canPrev = createBinding(player, "canGoPrevious");
  const canSeek = createBinding(player, "canSeek");

  let seekTarget = 0;
  let seekingUntil = 0;

  const position = createPoll(Math.max(player.position, 0), POLL_MS, (prev) => {
    if (Date.now() < seekingUntil) return seekTarget;
    const pos = player.position;
    // -1 means the player doesn't report a position at all.
    return pos < 0 ? prev : pos;
  });

  const onSeek = (_: unknown, __: unknown, value: number) => {
    seekTarget = value;
    seekingUntil = Date.now() + SEEK_GRACE_MS;
    player.set_position(value);
    return false;
  };

  // art_url can point at a cache file the player has already cleaned up.
  const art = createComputed(() => {
    const path = coverArt();
    return path && GLib.file_test(path, GLib.FileTest.EXISTS) ? path : "";
  });

  const subtitle = createComputed(() =>
    [artist(), album()].filter(Boolean).join(" • "),
  );

  // One image swapped in place rather than two behind a <With> - a <With> would
  // re-append the widget and the art would jump to the end of the row when a
  // late cover URL arrives.
  const artImage = (
    <image
      class="media-art"
      overflow={Gtk.Overflow.HIDDEN}
      widthRequest={ART_PX}
      heightRequest={ART_PX}
    />
  ) as Gtk.Image;

  const applyArt = (path: string) => {
    if (path) {
      artImage.set_from_file(path);
      artImage.pixelSize = ART_PX;
      artImage.remove_css_class("media-art-blank");
    } else {
      artImage.set_from_icon_name("audio-x-generic-symbolic");
      artImage.pixelSize = 28;
      artImage.add_css_class("media-art-blank");
    }
  };

  applyArt(art.get());
  onCleanup(art.subscribe(() => applyArt(art.get())));

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
      <box spacing={12}>
        {artImage}

        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          hexpand
        >
          <label
            class="media-title"
            xalign={0}
            label={title.as((t) => t || "Unknown track")}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={26}
          />
          <label
            class="media-subtitle"
            xalign={0}
            label={subtitle}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={30}
            visible={subtitle.as((s) => s.length > 0)}
          />
          <label
            class="media-source"
            xalign={0}
            label={player.identity || player.busName}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={30}
          />
        </box>
      </box>

      <box orientation={Gtk.Orientation.VERTICAL} spacing={2}>
        <slider
          class="media-seek"
          hexpand
          orientation={Gtk.Orientation.HORIZONTAL}
          drawValue={false}
          sensitive={canSeek}
          min={0}
          max={length.as((l) => (l > 0 ? l : 1))}
          value={position}
          onChangeValue={onSeek}
        />
        <box>
          <label class="media-time" xalign={0} label={position.as(formatTime)} />
          <box hexpand />
          <label class="media-time" xalign={1} label={length.as(formatTime)} />
        </box>
      </box>

      <box class="media-controls" halign={Gtk.Align.CENTER} spacing={6}>
        <button
          class={shuffle.as((s) =>
            s === AstalMpris.Shuffle.ON ? "media-btn media-btn-on" : "media-btn",
          )}
          tooltipText="Shuffle"
          sensitive={shuffle.as((s) => s !== AstalMpris.Shuffle.UNSUPPORTED)}
          onClicked={() => player.shuffle()}
        >
          <label
            label={shuffle.as((s) =>
              s === AstalMpris.Shuffle.ON ? "󰒝" : "󰒞",
            )}
          />
        </button>

        <button
          class="media-btn"
          tooltipText="Previous"
          sensitive={canPrev}
          onClicked={() => player.previous()}
        >
          <label label="󰒮" />
        </button>

        <button
          class="media-btn media-btn-play"
          tooltipText={status.as((s) =>
            s === AstalMpris.PlaybackStatus.PLAYING ? "Pause" : "Play",
          )}
          onClicked={() => player.play_pause()}
        >
          <label
            label={status.as((s) =>
              s === AstalMpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊",
            )}
          />
        </button>

        <button
          class="media-btn"
          tooltipText="Next"
          sensitive={canNext}
          onClicked={() => player.next()}
        >
          <label label="󰒭" />
        </button>

        <button
          class={loop.as((l) =>
            l === AstalMpris.Loop.NONE || l === AstalMpris.Loop.UNSUPPORTED
              ? "media-btn"
              : "media-btn media-btn-on",
          )}
          tooltipText="Repeat"
          sensitive={loop.as((l) => l !== AstalMpris.Loop.UNSUPPORTED)}
          onClicked={() => player.loop()}
        >
          <label
            label={loop.as((l) => {
              if (l === AstalMpris.Loop.TRACK) return "󰑘";
              if (l === AstalMpris.Loop.PLAYLIST) return "󰑖";
              return "󰑗";
            })}
          />
        </button>
      </box>
    </box>
  );
}

function PlayerTabs({
  list,
  chosen,
  onPick,
}: {
  list: AstalMpris.Player[];
  chosen: AstalMpris.Player;
  onPick: (bus: string) => void;
}) {
  return (
    <box class="media-tabs" spacing={4}>
      {list.map((player) => (
        <button
          class={
            player.busName === chosen.busName
              ? "media-tab media-tab-active"
              : "media-tab"
          }
          hexpand
          onClicked={() => onPick(player.busName)}
        >
          <label
            label={player.identity || player.busName}
            ellipsize={Pango.EllipsizeMode.END}
            maxWidthChars={12}
          />
        </button>
      ))}
    </box>
  );
}

export default function Media() {
  // Selection is by bus name, not index - players come and go, and an index
  // would quietly start pointing at a different player after one quits.
  const [pickedBus, setPickedBus] = createState<string | null>(null);

  const view = createComputed(() => {
    const list = players();
    const picked = pickedBus();
    const preferred = preferredBus();
    const chosen =
      list.find((p) => p.busName === picked) ??
      list.find((p) => p.busName === preferred) ??
      activePlayer(list);
    return { list, chosen };
  });

  return (
    <box css={MediaCss} class="card media-card">
      <With value={view}>
        {({ list, chosen }) =>
          chosen === null ? (
            <box
              class="media-empty"
              orientation={Gtk.Orientation.VERTICAL}
              spacing={6}
              halign={Gtk.Align.CENTER}
            >
              <label class="media-empty-icon" label="󰝛" />
              <label class="secondary-label" label="Nothing playing" />
            </box>
          ) : (
            <box orientation={Gtk.Orientation.VERTICAL} spacing={10} hexpand>
              {list.length > 1 && (
                <PlayerTabs list={list} chosen={chosen} onPick={setPickedBus} />
              )}
              <PlayerCard player={chosen} />
            </box>
          )
        }
      </With>
    </box>
  );
}
