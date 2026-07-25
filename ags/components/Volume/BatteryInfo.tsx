import AstalBattery from "gi://AstalBattery";
import { createState, createMemo, onCleanup } from "ags";
import { execAsync } from "ags/process";
import { Gtk } from "ags/gtk4";

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function BatteryInfo() {
  const battery = AstalBattery.Device.get_default();
  if (!battery) return <box />;

  const [pct, setPct] = createState(Math.round(battery.percentage * 100));
  const [state, setState] = createState(battery.state);
  const [timeToEmpty, setTimeToEmpty] = createState(battery.timeToEmpty);
  const [timeToFull, setTimeToFull] = createState(battery.timeToFull);

  const ids = [
    battery.connect("notify::percentage", () =>
      setPct(Math.round(battery.percentage * 100)),
    ),
    battery.connect("notify::state", () => setState(battery.state)),
    battery.connect("notify::time-to-empty", () =>
      setTimeToEmpty(battery.timeToEmpty),
    ),
    battery.connect("notify::time-to-full", () =>
      setTimeToFull(battery.timeToFull),
    ),
  ];
  onCleanup(() => ids.forEach((id) => battery.disconnect(id)));

  const batteryIcon = createMemo(() => {
    const p = pct();
    const s = state();
    if (s === AstalBattery.State.charging) return "󰂄";
    if (s === AstalBattery.State.fully_charged) return "󰁹";
    if (p > 80) return "󰁹";
    if (p > 60) return "󰂀";
    if (p > 40) return "󰁾";
    if (p > 20) return "󰁼";
    return "󰁺";
  });

  const timeLabel = createMemo(() => {
    const s = state();
    if (s === AstalBattery.State.charging) return formatTime(timeToFull());
    if (s === AstalBattery.State.discharging) return formatTime(timeToEmpty());
    return "";
  });

  return (
    <box class="card" spacing={10} valign={Gtk.Align.CENTER}>
      <image
        iconName="avatar-default-symbolic"
        widthRequest={38}
        heightRequest={38}
      />
      <box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        hexpand
      >
        <box spacing={4} valign={Gtk.Align.CENTER}>
          <label class="icon-label" label={batteryIcon} />
          <label class="battery-pct" label={pct.as((p) => `${p}%`)} />
        </box>
        <label
          class="battery-time"
          xalign={0}
          label={timeLabel}
          visible={timeLabel.as((t) => t.length > 0)}
        />
      </box>

      <box spacing={4} valign={Gtk.Align.CENTER}>
        <button
          class="action-btn"
          tooltipText="Lock"
          onClicked={() =>
            execAsync(["loginctl", "lock-session"]).catch(console.error)
          }
        >
          <label label="󰌾" />
        </button>
        <button
          class="action-btn"
          tooltipText="Log out"
          onClicked={() =>
            execAsync(["hyprctl", "dispatch", "exit"]).catch(console.error)
          }
        >
          <label label="󰍃" />
        </button>
        <button
          class="action-btn action-btn-danger"
          tooltipText="Power off"
          onClicked={() =>
            execAsync(["systemctl", "poweroff"]).catch(console.error)
          }
        >
          <label label="󰐥" />
        </button>
      </box>
    </box>
  );
}
