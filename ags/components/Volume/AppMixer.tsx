import { onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import {
  sinkInputs,
  setSinkInputVolume,
  toggleSinkInputMute,
  type SinkInput,
} from "./volumeControl";

// Add app names or process binaries here to hide them from the mixer
const HIDDEN: string[] = ["pacat", "gjs"];

export default function AppMixer() {
  const listBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
  });

  let dragging = false;
  let dragTimer: ReturnType<typeof setTimeout> | null = null;

  const onInteract = () => {
    dragging = true;
    if (dragTimer) clearTimeout(dragTimer);
    dragTimer = setTimeout(() => {
      dragging = false;
    }, 600);
  };

  const renderRow = (input: SinkInput): Gtk.Widget => {
    const muteIcon = input.mute ? "󰖁" : "󰎈";

    return (
      <box spacing={8} valign={Gtk.Align.CENTER}>
        <button
          class="action-btn mixer-btn"
          tooltipText={input.mute ? "Unmute" : "Mute"}
          onClicked={() => toggleSinkInputMute(input.id).catch(console.error)}
        >
          <label label={muteIcon} />
        </button>
        <image iconName={input.iconName} widthRequest={16} heightRequest={16} />
        <label
          class="secondary-label"
          hexpand={false}
          xalign={0}
          ellipsize={3}
          maxWidthChars={14}
          label={input.name}
        />
        <slider
          hexpand
          orientation={Gtk.Orientation.HORIZONTAL}
          drawValue={false}
          roundDigits={0}
          digits={0}
          min={0}
          max={150}
          value={input.volume}
          onChangeValue={(_: unknown, __: unknown, value: number) => {
            onInteract();
            setSinkInputVolume(input.id, value).catch(console.error);
            return false;
          }}
        />
        <label class="pct-label" xalign={1} label={`${input.volume}%`} />
      </box>
    ) as unknown as Gtk.Widget;
  };

  const render = () => {
    if (dragging) return;
    while (listBox.get_first_child()) {
      listBox.get_first_child()!.unparent();
    }
    const inputs = sinkInputs
      .peek()
      .filter((i) => !HIDDEN.includes(i.name) && !HIDDEN.includes(i.iconName));
    if (inputs.length === 0) {
      listBox.append(
        (
          <label
            class="empty-label"
            halign={Gtk.Align.CENTER}
            label="No apps playing"
          />
        ) as unknown as Gtk.Widget,
      );
      return;
    }
    for (const input of inputs) {
      listBox.append(renderRow(input));
    }
  };

  render();
  const unsub = sinkInputs.subscribe(render);
  onCleanup(unsub);

  return (
    <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <button
        class="mixer-header-btn"
        tooltipText="Open pavucontrol"
        onClicked={() => execAsync(["pavucontrol"]).catch(console.error)}
      >
        <label class="section-label" xalign={0} label="APP MIXER ↗" />
      </button>
      {listBox}
    </box>
  );
}
