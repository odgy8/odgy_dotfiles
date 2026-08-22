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

// Confirmation happens in the row itself rather than a dialog or popover.
// Gtk.AlertDialog is a top-level window and gtk4-layer-shell can't parent one
// from a layer surface, so it never presents; a Popover works but is still a
// separate surface to manage. Swapping the row's children sidesteps both.
const ACTIONS = {
  // Confirmed like the rest: hyprlock tears down network connections, which
  // is not something to trigger by accident with long-running work attached.
  lock: {
    icon: "󰌾",
    tooltip: "Lock",
    danger: true,
    run: () => execAsync(["hyprlock"]),
  },
  logout: {
    icon: "󰍃",
    tooltip: "Log out",
    danger: true,
    // "exit" needs to be a Lua dispatcher expression, not a bare dispatcher
    // name, now that hyprland.lua is in use.
    run: () => execAsync(["hyprctl", "dispatch", "hl.dsp.exit()"]),
  },
  reboot: {
    icon: "󰜉",
    tooltip: "Restart",
    danger: true,
    run: () => execAsync(["systemctl", "reboot"]),
  },
  poweroff: {
    icon: "󰐥",
    tooltip: "Power off",
    danger: true,
    run: () => execAsync(["systemctl", "poweroff"]),
  },
} as const;

type ActionKey = keyof typeof ACTIONS;

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

  const [pending, setPending] = createState<ActionKey | null>(null);
  let revertTimer: ReturnType<typeof setTimeout> | null = null;

  const clearRevert = () => {
    if (revertTimer) clearTimeout(revertTimer);
    revertTimer = null;
  };

  const cancel = () => {
    clearRevert();
    setPending(null);
  };

  // Arming is never sticky -- an armed action the user walks away from drops
  // back to the normal row instead of sitting there waiting to be hit.
  const arm = (key: ActionKey) => {
    clearRevert();
    setPending(key);
    revertTimer = setTimeout(() => setPending(null), 5000);
  };

  const commit = () => {
    const key = pending();
    if (!key) return;
    clearRevert();
    setPending(null);
    ACTIONS[key].run().catch(console.error);
  };

  onCleanup(clearRevert);

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

      {/* Both rows are always built; only one is ever visible, so the card
          keeps its height and nothing shifts when an action is armed. */}
      <box
        spacing={4}
        valign={Gtk.Align.CENTER}
        visible={pending.as((p) => p === null)}
      >
        <button
          class="action-btn"
          tooltipText={ACTIONS.lock.tooltip}
          onClicked={() => arm("lock")}
        >
          <label label={ACTIONS.lock.icon} />
        </button>
        <button
          class="action-btn"
          tooltipText={ACTIONS.logout.tooltip}
          onClicked={() => arm("logout")}
        >
          <label label={ACTIONS.logout.icon} />
        </button>
        <button
          class="action-btn"
          tooltipText={ACTIONS.reboot.tooltip}
          onClicked={() => arm("reboot")}
        >
          <label label={ACTIONS.reboot.icon} />
        </button>
        <button
          class="action-btn action-btn-danger"
          tooltipText={ACTIONS.poweroff.tooltip}
          onClicked={() => arm("poweroff")}
        >
          <label label={ACTIONS.poweroff.icon} />
        </button>
      </box>

      <box
        spacing={4}
        valign={Gtk.Align.CENTER}
        visible={pending.as((p) => p !== null)}
      >
        <label
          class="confirm-prompt"
          label={pending.as((p) => (p ? `${ACTIONS[p].icon}?` : ""))}
        />
        <button
          class={pending.as((p) =>
            p && ACTIONS[p].danger
              ? "action-btn action-btn-confirm-danger"
              : "action-btn action-btn-confirm",
          )}
          tooltipText={pending.as((p) => (p ? ACTIONS[p].tooltip : ""))}
          onClicked={commit}
        >
          <label label="󰄬" />
        </button>
        <button class="action-btn" tooltipText="Cancel" onClicked={cancel}>
          <label label="󰅖" />
        </button>
      </box>
    </box>
  );
}
