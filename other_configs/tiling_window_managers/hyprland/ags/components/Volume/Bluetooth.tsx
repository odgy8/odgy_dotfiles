import { onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import {
  btStatus,
  btPowerToggle,
  btConnect,
  btDisconnect,
  btScanStart,
  btScanStop,
  type BtDevice,
} from "./bluetoothControl";

const ICON_MAP: Record<string, string> = {
  "audio-headphones": "󰋋",
  "audio-headset": "󰋎",
  "audio-speakers": "󰓿",
  "audio-card": "󰕾",
  phone: "󰏲",
  "input-keyboard": "󰌌",
  "input-mouse": "󰍽",
  computer: "󰋊",
  bluetooth: "󰂯",
};

function deviceIcon(icon: string): string {
  return ICON_MAP[icon] ?? "󰂯";
}

function makeDeviceRow(device: BtDevice): Gtk.Widget {
  const icon = deviceIcon(device.icon);
  const isConnected = device.connected;

  const iconLabel = (
    <label
      class={isConnected ? "icon-label bt-icon-active" : "icon-label"}
      label={icon}
    />
  ) as unknown as Gtk.Widget;

  const nameLabel = (
    <label
      class="primary-label"
      label={device.name}
      hexpand
      xalign={0}
      ellipsize={3}
      maxWidthChars={22}
    />
  ) as unknown as Gtk.Widget;

  const actionBtn = (
    <button
      class={isConnected ? "action-btn bt-connected-btn" : "action-btn"}
      tooltipText={isConnected ? "Disconnect" : "Connect"}
      onClicked={() => {
        if (isConnected) {
          btDisconnect(device.path).catch(console.error);
        } else {
          btConnect(device.path).catch(console.error);
        }
      }}
    >
      <label label={isConnected ? "󰂱" : "󰂯"} />
    </button>
  ) as unknown as Gtk.Widget;

  return (
    <box class="bt-device-row" spacing={8} valign={Gtk.Align.CENTER}>
      {iconLabel}
      {nameLabel}
      {actionBtn}
    </box>
  ) as unknown as Gtk.Widget;
}

export default function Bluetooth() {
  const outer = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 0,
  });

  const card = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 6,
  });
  card.add_css_class("card");

  const deviceList = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 4,
  });

  const render = () => {
    const status = btStatus.peek();
    const { adapter, devices } = status;

    // clear card children
    while (card.get_first_child()) {
      card.get_first_child()!.unparent();
    }

    if (!adapter) return;

    const { powered, discovering, path: adapterPath } = adapter;
    const paired = devices.filter((d) => d.paired);
    // unpaired discovered devices (only visible during scan)
    const discovered = discovering
      ? devices.filter((d) => !d.paired)
      : [];

    // ── Header ────────────────────────────────────────────────
    const header = (
      <box spacing={4} valign={Gtk.Align.CENTER}>
        <label class="section-label" xalign={0} hexpand label="BLUETOOTH" />
        <button
          class={powered ? "action-btn bt-power-on" : "action-btn"}
          tooltipText={powered ? "Turn off Bluetooth" : "Turn on Bluetooth"}
          onClicked={() => btPowerToggle(adapterPath).catch(console.error)}
        >
          <label label={powered ? "󰂯" : "󰂲"} />
        </button>
      </box>
    ) as unknown as Gtk.Widget;
    card.append(header);

    if (!powered) {
      card.append(
        (
          <label
            class="secondary-label"
            halign={Gtk.Align.CENTER}
            label="Bluetooth is off"
          />
        ) as unknown as Gtk.Widget,
      );
      outer.append(card);
      return;
    }

    // ── Device list ───────────────────────────────────────────
    while (deviceList.get_first_child()) {
      deviceList.get_first_child()!.unparent();
    }

    if (paired.length === 0 && discovered.length === 0) {
      deviceList.append(
        (
          <label
            class="secondary-label"
            halign={Gtk.Align.CENTER}
            label="No paired devices"
          />
        ) as unknown as Gtk.Widget,
      );
    } else {
      for (const d of paired) {
        deviceList.append(makeDeviceRow(d));
      }
      for (const d of discovered) {
        deviceList.append(makeDiscoveredRow(d));
      }
    }
    card.append(deviceList);

    // ── Footer: scan + manager ────────────────────────────────
    const footer = (
      <box spacing={4} halign={Gtk.Align.END}>
        <button
          class={discovering ? "action-btn bt-scan-active" : "action-btn"}
          tooltipText={discovering ? "Stop scanning" : "Scan for devices"}
          onClicked={() => {
            if (discovering) {
              btScanStop(adapterPath).catch(console.error);
            } else {
              btScanStart(adapterPath).catch(console.error);
            }
          }}
        >
          <label label={discovering ? "󰑪" : "󰂰"} />
        </button>
        <button
          class="action-btn"
          tooltipText="Open Bluetooth Manager"
          onClicked={() => execAsync(["blueman-manager"]).catch(console.error)}
        >
          <label label="↗" />
        </button>
      </box>
    ) as unknown as Gtk.Widget;
    card.append(footer);

    outer.append(card);
  };

  render();
  const unsub = btStatus.subscribe(() => {
    while (outer.get_first_child()) {
      outer.get_first_child()!.unparent();
    }
    render();
  });
  onCleanup(unsub);

  return outer;
}

function makeDiscoveredRow(device: BtDevice): Gtk.Widget {
  return (
    <box class="bt-device-row bt-discovered-row" spacing={8} valign={Gtk.Align.CENTER}>
      <label class="icon-label" label={deviceIcon(device.icon)} />
      <box orientation={Gtk.Orientation.VERTICAL} hexpand>
        <label
          class="primary-label"
          label={device.name}
          xalign={0}
          ellipsize={3}
          maxWidthChars={18}
        />
        <label
          class="secondary-label"
          label={device.rssi !== null ? `RSSI ${device.rssi} dBm` : "Discovered"}
          xalign={0}
        />
      </box>
      <button
        class="action-btn"
        tooltipText="Pair device"
        onClicked={() => {
          import("ags/process").then(({ execAsync }) =>
            execAsync(["blueman-manager"]).catch(console.error),
          );
        }}
      >
        <label label="󰌹" />
      </button>
    </box>
  ) as unknown as Gtk.Widget;
}
