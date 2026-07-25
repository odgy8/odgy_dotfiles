import AstalMpris from "gi://AstalMpris";
import { createState, onCleanup } from "ags";
import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PlayerCard({ player }: { player: AstalMpris.Player }) {
  const [title, setTitle] = createState(player.title ?? "Unknown");
  const [artist, setArtist] = createState(player.artist ?? "");
  const [coverArt, setCoverArt] = createState(player.coverArt ?? "");
  const [status, setStatus] = createState(player.playbackStatus);
  const [length, setLength] = createState(player.length ?? 0);

  const ids = [
    player.connect("notify::title", () => setTitle(player.title ?? "Unknown")),
    player.connect("notify::artist", () => setArtist(player.artist ?? "")),
    player.connect("notify::cover-art", () => setCoverArt(player.coverArt ?? "")),
    player.connect("notify::playback-status", () => setStatus(player.playbackStatus)),
    player.connect("notify::length", () => setLength(player.length ?? 0)),
  ];
  onCleanup(() => ids.forEach((id) => player.disconnect(id)));

  const position = createPoll(0, 500, () => player.position ?? 0);

  const isPlaying = () => status() === AstalMpris.PlaybackStatus.playing;

  const onSeek = (_: unknown, __: unknown, value: number) => {
    player.set_position(value);
    return false;
  };

  return (
    <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      {/* Top row: art + info */}
      <box spacing={12} valign={Gtk.Align.CENTER}>
        <image
          class="cover-art"
          file={coverArt}
          widthRequest={60}
          heightRequest={60}
        />
        <box
          orientation={Gtk.Orientation.VERTICAL}
          vexpand
          valign={Gtk.Align.CENTER}
          hexpand
        >
          <label
            class="track-title"
            xalign={0}
            label={title}
            ellipsize={3}
            maxWidthChars={24}
          />
          <label
            class="track-artist"
            xalign={0}
            label={artist}
            ellipsize={3}
            maxWidthChars={24}
          />
        </box>
      </box>

      {/* Progress slider */}
      <slider
        hexpand
        orientation={Gtk.Orientation.HORIZONTAL}
        drawValue={false}
        roundDigits={0}
        digits={0}
        min={0}
        max={length}
        value={position}
        onChangeValue={onSeek}
      />

      {/* Controls row */}
      <box valign={Gtk.Align.CENTER} spacing={4}>
        <label
          class="time-label"
          xalign={0}
          label={position.as(formatTime)}
        />
        <box hexpand />
        <button class="media-btn" onClicked={() => player.previous()}>
          <label label="󰒮" />
        </button>
        <button
          class="media-btn media-btn-play"
          onClicked={() => player.play_pause()}
        >
          <label label={status.as((s) => (s === AstalMpris.PlaybackStatus.PLAYING ? "󰏤" : "󰐊"))} />
        </button>
        <button class="media-btn" onClicked={() => player.next()}>
          <label label="󰒭" />
        </button>
        <box hexpand />
        <label
          class="time-label"
          xalign={1}
          label={length.as(formatTime)}
        />
      </box>
    </box>
  );
}

export default function MediaPlayer() {
  const mpris = AstalMpris.get_default();

  const [players, setPlayers] = createState(mpris.get_players());
  const id = mpris.connect("notify::players", () =>
    setPlayers(mpris.get_players()),
  );
  onCleanup(() => mpris.disconnect(id));

  let selectedIndex = 0;

  const outer = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  });

  const cardSlot = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });

  const renderCard = (list: AstalMpris.Player[]) => {
    while (cardSlot.get_first_child()) {
      cardSlot.get_first_child()!.unparent();
    }
    if (list.length > 0) {
      cardSlot.append(<PlayerCard player={list[selectedIndex]} />);
    }
  };

  const render = () => {
    const list = players.peek();

    while (outer.get_first_child()) {
      outer.get_first_child()!.unparent();
    }

    if (list.length === 0) return;

    if (list.length > 1) {
      const names = new Gtk.StringList();
      list.forEach((p) => names.append(p.identity || p.busName));

      selectedIndex = Math.min(selectedIndex, list.length - 1);

      const dropdown = new Gtk.DropDown({
        model: names,
        selected: selectedIndex,
        hexpand: true,
      });
      dropdown.add_css_class("player-dropdown");
      dropdown.connect("notify::selected", () => {
        selectedIndex = dropdown.get_selected();
        renderCard(list);
      });
      outer.append(dropdown);
    } else {
      selectedIndex = 0;
    }

    outer.append(cardSlot);
    renderCard(list);
  };

  render();
  const unsub = players.subscribe(render);
  onCleanup(unsub);

  return outer;
}
