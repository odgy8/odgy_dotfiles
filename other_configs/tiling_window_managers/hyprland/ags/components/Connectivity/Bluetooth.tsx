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
  const row = new Gtk.Box({ spacing: 8 });
  row.set_valign(Gtk.Align.CENTER);
  row.add_css_class("bt-device-row");

  const iconLbl = new Gtk.Label({ label: deviceIcon(device.icon) });
  iconLbl.add_css_class("icon-label");
  if (device.connected) iconLbl.add_css_class("bt-icon-active");
  row.append(iconLbl);

  const nameLbl = new Gtk.Label({ label: device.name });
  nameLbl.add_css_class("primary-label");
  nameLbl.set_hexpand(true);
  nameLbl.set_xalign(0);
  nameLbl.set_ellipsize(3); // Pango.EllipsizeMode.END
  nameLbl.set_max_width_chars(22);
  row.append(nameLbl);

  const btn = new Gtk.Button();
  btn.add_css_class("action-btn");
  if (device.connected) btn.add_css_class("bt-connected-btn");
  btn.set_tooltip_text(device.connected ? "Disconnect" : "Connect");
  btn.set_child(new Gtk.Label({ label: device.connected ? "󰂱" : "󰂯" }));
  btn.connect("clicked", () => {
    if (device.connected) btDisconnect(device.path).catch(console.error);
    else btConnect(device.path).catch(console.error);
  });
  row.append(btn);

  return row;
}

function makeDiscoveredRow(device: BtDevice): Gtk.Widget {
  const row = new Gtk.Box({ spacing: 8 });
  row.set_valign(Gtk.Align.CENTER);
  row.add_css_class("bt-device-row");
  row.add_css_class("bt-discovered-row");

  const iconLbl = new Gtk.Label({ label: deviceIcon(device.icon) });
  iconLbl.add_css_class("icon-label");
  row.append(iconLbl);

  const nameBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
  nameBox.set_hexpand(true);

  const nameLbl = new Gtk.Label({ label: device.name });
  nameLbl.add_css_class("primary-label");
  nameLbl.set_xalign(0);
  nameLbl.set_ellipsize(3);
  nameLbl.set_max_width_chars(18);
  nameBox.append(nameLbl);

  const subLbl = new Gtk.Label({
    label: device.rssi !== null ? `RSSI ${device.rssi} dBm` : "Discovered",
  });
  subLbl.add_css_class("secondary-label");
  subLbl.set_xalign(0);
  nameBox.append(subLbl);

  row.append(nameBox);

  const pairBtn = new Gtk.Button();
  pairBtn.add_css_class("action-btn");
  pairBtn.set_tooltip_text("Pair device");
  pairBtn.set_child(new Gtk.Label({ label: "󰌹" }));
  pairBtn.connect("clicked", () => execAsync(["blueman-manager"]).catch(console.error));
  row.append(pairBtn);

  return row;
}

export default function Bluetooth() {
  const outer = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
  const card = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 });
  card.add_css_class("card");
  const deviceList = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 });

  const render = () => {
    const { adapter, devices } = btStatus.peek();

    while (card.get_first_child()) card.get_first_child()!.unparent();
    if (!adapter) return;

    const { powered, discovering, path: adapterPath } = adapter;
    const paired = devices.filter((d) => d.paired);
    const discovered = discovering ? devices.filter((d) => !d.paired) : [];

    // ── Header ────────────────────────────────────────────────
    const header = new Gtk.Box({ spacing: 4 });
    header.set_valign(Gtk.Align.CENTER);

    const managerBtn = new Gtk.Button();
    managerBtn.add_css_class("mixer-header-btn");
    managerBtn.set_hexpand(true);
    managerBtn.set_tooltip_text("Open Bluetooth Manager");
    const managerLbl = new Gtk.Label({ label: "BLUETOOTH ↗" });
    managerLbl.add_css_class("section-label");
    managerLbl.set_xalign(0);
    managerBtn.set_child(managerLbl);
    managerBtn.connect("clicked", () =>
      execAsync(["blueman-manager"]).catch(console.error),
    );
    header.append(managerBtn);

    if (powered) {
      const scanBtn = new Gtk.Button();
      scanBtn.add_css_class("action-btn");
      if (discovering) scanBtn.add_css_class("bt-scan-active");
      scanBtn.set_tooltip_text(discovering ? "Stop scanning" : "Scan for devices");
      scanBtn.set_child(new Gtk.Label({ label: "󰂰" }));
      scanBtn.connect("clicked", () => {
        if (discovering) {
          btScanStop(adapterPath).catch(console.error);
          execAsync(["notify-send", "-i", "bluetooth", "Bluetooth", "Stopped scanning"]).catch(console.error);
        } else {
          btScanStart(adapterPath).catch(console.error);
          execAsync(["notify-send", "-i", "bluetooth", "Bluetooth", "Scanning for devices…"]).catch(console.error);
        }
      });
      header.append(scanBtn);
    }

    const powerBtn = new Gtk.Button();
    powerBtn.add_css_class("action-btn");
    if (powered) powerBtn.add_css_class("bt-power-on");
    powerBtn.set_tooltip_text(powered ? "Turn off Bluetooth" : "Turn on Bluetooth");
    powerBtn.set_child(new Gtk.Label({ label: powered ? "󰂯" : "󰂲" }));
    powerBtn.connect("clicked", () => btPowerToggle(adapterPath).catch(console.error));
    header.append(powerBtn);

    card.append(header);

    if (!powered) {
      outer.append(card);
      return;
    }

    // ── Device list ───────────────────────────────────────────
    while (deviceList.get_first_child()) deviceList.get_first_child()!.unparent();

    if (paired.length === 0 && discovered.length === 0) {
      const emptyLbl = new Gtk.Label({ label: "No paired devices" });
      emptyLbl.add_css_class("secondary-label");
      emptyLbl.set_halign(Gtk.Align.CENTER);
      deviceList.append(emptyLbl);
    } else {
      for (const d of paired) deviceList.append(makeDeviceRow(d));
      for (const d of discovered) deviceList.append(makeDiscoveredRow(d));
    }

    card.append(deviceList);
    outer.append(card);
  };

  render();
  const unsub = btStatus.subscribe(() => {
    while (outer.get_first_child()) outer.get_first_child()!.unparent();
    render();
  });
  onCleanup(unsub);

  return outer;
}
