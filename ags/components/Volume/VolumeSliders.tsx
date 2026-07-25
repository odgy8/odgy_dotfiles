import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import {
  sinkVolumePercent,
  sourceVolumePercent,
  sinkMute,
  sourceMute,
} from "./volumeControl";

const changePercent =
  (kind: "sink" | "source") =>
  (_: unknown, __: unknown, value: number) => {
    const target =
      kind === "sink" ? "@DEFAULT_SINK@" : "@DEFAULT_SOURCE@";
    execAsync([
      "pactl",
      `set-${kind}-volume`,
      target,
      `${Math.round(value)}%`,
    ]).catch(console.error);
    return false;
  };

const toggleMute = (kind: "sink" | "source") => () => {
  const target =
    kind === "sink" ? "@DEFAULT_SINK@" : "@DEFAULT_SOURCE@";
  execAsync(["pactl", `set-${kind}-mute`, target, "toggle"]).catch(
    console.error,
  );
};

export default function VolumeSliders() {
  const speakerIcon = sinkMute.as((m) => (m ? "󰖁" : "󰕾"));
  const micIcon = sourceMute.as((m) => (m ? "󰍭" : "󰍬"));

  return (
    <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      <box spacing={8} valign={Gtk.Align.CENTER}>
        <button
          class="action-btn"
          onClicked={toggleMute("sink")}
          tooltipText="Toggle mute"
        >
          <label label={speakerIcon} />
        </button>
        <slider
          hexpand
          orientation={Gtk.Orientation.HORIZONTAL}
          drawValue={false}
          roundDigits={0}
          digits={0}
          min={0}
          max={100}
          value={sinkVolumePercent}
          onChangeValue={changePercent("sink")}
        />
        <label
          class="pct-label"
          xalign={1}
          label={sinkVolumePercent.as((v) => `${Math.round(v)}%`)}
        />
      </box>

      <box spacing={8} valign={Gtk.Align.CENTER}>
        <button
          class="action-btn"
          onClicked={toggleMute("source")}
          tooltipText="Toggle mic mute"
        >
          <label label={micIcon} />
        </button>
        <slider
          hexpand
          orientation={Gtk.Orientation.HORIZONTAL}
          drawValue={false}
          roundDigits={0}
          digits={0}
          min={0}
          max={100}
          value={sourceVolumePercent}
          onChangeValue={changePercent("source")}
        />
        <label
          class="pct-label"
          xalign={1}
          label={sourceVolumePercent.as((v) => `${Math.round(v)}%`)}
        />
      </box>
    </box>
  );
}
