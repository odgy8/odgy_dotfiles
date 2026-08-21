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

// Gtk.AlertDialog is a native top-level window and gtk4-layer-shell doesn't
// support proper parenting for those from a layer-shell surface, so it never
// reliably presents. Gtk.Popover is a child surface anchored to the widget
// itself, which layer-shell does support (same mechanism the rest of this
// shell's popups already rely on).
// Cancel is both the default and the escape action (autohide covers Escape
// and click-outside), so an accidental dismiss can never trigger the action.
function confirm(
  anchor: Gtk.Widget,
  message: string,
  actionLabel: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    const popover = new Gtk.Popover({ autohide: true });
    popover.set_parent(anchor);

    const cancelBtn = new Gtk.Button({ label: "Cancel" });
    const confirmBtn = new Gtk.Button({ label: actionLabel });
    confirmBtn.add_css_class("destructive-action");

    let resolved = false;
    const finish = (result: boolean) => {
      if (resolved) return;
      resolved = true;
      resolve(result);
      popover.popdown();
    };

    cancelBtn.connect("clicked", () => finish(false));
    confirmBtn.connect("clicked", () => finish(true));
    // Fires on any dismissal path (autohide, Escape, explicit popdown above)
    // — cleans up the popover exactly once regardless of how it closed.
    popover.connect("closed", () => {
      finish(false);
      popover.unparent();
    });
    popover.connect("show", () => cancelBtn.grab_focus());

    const buttonBox = new Gtk.Box({ spacing: 8, halign: Gtk.Align.END });
    buttonBox.append(cancelBtn);
    buttonBox.append(confirmBtn);

    const box = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 8,
      marginTop: 8,
      marginBottom: 8,
      marginStart: 8,
      marginEnd: 8,
    });
    box.append(new Gtk.Label({ label: message }));
    box.append(buttonBox);

    popover.set_child(box);
    popover.popup();
  });
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
          onClicked={() => execAsync(["hyprlock"]).catch(console.error)}
        >
          <label label="󰌾" />
        </button>
        <button
          class="action-btn"
          tooltipText="Log out"
          onClicked={async (self: Gtk.Button) => {
            if (await confirm(self, "Log out?", "Log Out")) {
              execAsync(["hyprctl", "dispatch", "exit"]).catch(console.error);
            }
          }}
        >
          <label label="󰍃" />
        </button>
        <button
          class="action-btn"
          tooltipText="Restart"
          onClicked={async (self: Gtk.Button) => {
            if (await confirm(self, "Restart the computer?", "Restart")) {
              execAsync(["systemctl", "reboot"]).catch(console.error);
            }
          }}
        >
          <label label="󰜉" />
        </button>
        <button
          class="action-btn action-btn-danger"
          tooltipText="Power off"
          onClicked={async (self: Gtk.Button) => {
            if (await confirm(self, "Power off the computer?", "Power Off")) {
              execAsync(["systemctl", "poweroff"]).catch(console.error);
            }
          }}
        >
          <label label="󰐥" />
        </button>
      </box>
    </box>
  );
}
