import AstalNetwork from "gi://AstalNetwork";
import { createState, onCleanup } from "ags";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

function WiredRow({ wired }: { wired: AstalNetwork.Wired }) {
  const [iconName, setIconName] = createState(wired.iconName ?? "");
  const [internet, setInternet] = createState(wired.internet);
  const [speed, setSpeed] = createState(wired.speed);

  const ids = [
    wired.connect("notify::icon-name", () => setIconName(wired.iconName ?? "")),
    wired.connect("notify::internet", () => setInternet(wired.internet)),
    wired.connect("notify::speed", () => setSpeed(wired.speed)),
  ];
  onCleanup(() => ids.forEach((id) => wired.disconnect(id)));

  const statusLabel = () => {
    const s = speed();
    if (internet() === AstalNetwork.Internet.connected) {
      return s > 0 ? `Connected · ${s} Mbps` : "Connected";
    }
    if (internet() === AstalNetwork.Internet.connecting) return "Connecting…";
    return "Not connected";
  };

  return (
    <box spacing={8} valign={Gtk.Align.CENTER}>
      <image iconName={iconName} pixelSize={18} />
      <label
        class="primary-label"
        hexpand
        xalign={0}
        label={internet.as(statusLabel)}
      />
    </box>
  );
}

function makeAccessPointRow(
  ap: AstalNetwork.AccessPoint,
  active: boolean,
): Gtk.Widget {
  const row = new Gtk.Box({ spacing: 8 });
  row.set_valign(Gtk.Align.CENTER);
  row.add_css_class("bt-device-row");

  const icon = new Gtk.Image({ iconName: ap.iconName, pixelSize: 18 });
  row.append(icon);

  const nameLbl = new Gtk.Label({ label: ap.ssid || "(hidden network)" });
  nameLbl.add_css_class("primary-label");
  if (active) nameLbl.add_css_class("bt-icon-active");
  nameLbl.set_hexpand(true);
  nameLbl.set_xalign(0);
  nameLbl.set_ellipsize(3);
  nameLbl.set_max_width_chars(20);
  row.append(nameLbl);

  const strengthLbl = new Gtk.Label({ label: `${ap.strength}%` });
  strengthLbl.add_css_class("secondary-label");
  row.append(strengthLbl);

  if (!active) {
    const connectBtn = new Gtk.Button();
    connectBtn.add_css_class("action-btn");
    connectBtn.set_tooltip_text(
      ap.requiresPassword ? "Connect (needs password — opens editor)" : "Connect",
    );
    connectBtn.set_child(new Gtk.Label({ label: "󰁔" }));
    connectBtn.connect("clicked", () => {
      if (ap.requiresPassword) {
        execAsync(["nm-connection-editor"]).catch(console.error);
        return;
      }
      ap.activate(null, (_source, res) => {
        try {
          ap.activate_finish(res);
        } catch (e) {
          console.error(e);
          execAsync(["nm-connection-editor"]).catch(console.error);
        }
      });
    });
    row.append(connectBtn);
  }

  return row;
}

function WifiCard({ wifi }: { wifi: AstalNetwork.Wifi }) {
  const [enabled, setEnabled] = createState(wifi.enabled);
  const [scanning, setScanning] = createState(wifi.scanning);
  const [aps, setAps] = createState(wifi.accessPoints ?? []);
  const [activeAp, setActiveAp] = createState(wifi.activeAccessPoint);

  const ids = [
    wifi.connect("notify::enabled", () => setEnabled(wifi.enabled)),
    wifi.connect("notify::scanning", () => setScanning(wifi.scanning)),
    wifi.connect("notify::access-points", () => setAps(wifi.accessPoints ?? [])),
    wifi.connect("notify::active-access-point", () =>
      setActiveAp(wifi.activeAccessPoint),
    ),
  ];
  onCleanup(() => ids.forEach((id) => wifi.disconnect(id)));

  const listBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 4,
  });

  const renderList = () => {
    while (listBox.get_first_child()) listBox.get_first_child()!.unparent();
    if (!enabled.peek()) return;
    const sorted = [...aps.peek()].sort((a, b) => b.strength - a.strength);
    const active = activeAp.peek();
    if (sorted.length === 0) {
      const empty = new Gtk.Label({ label: "No networks found" });
      empty.add_css_class("secondary-label");
      empty.set_halign(Gtk.Align.CENTER);
      listBox.append(empty);
      return;
    }
    for (const ap of sorted.slice(0, 8)) {
      listBox.append(makeAccessPointRow(ap, active?.bssid === ap.bssid));
    }
  };

  renderList();
  const unsubs = [aps.subscribe(renderList), enabled.subscribe(renderList), activeAp.subscribe(renderList)];
  onCleanup(() => unsubs.forEach((u) => u()));

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
      <box spacing={4} valign={Gtk.Align.CENTER}>
        <label
          class="section-label"
          hexpand
          xalign={0}
          label="WI-FI"
        />
        <button
          class="action-btn"
          visible={enabled}
          tooltipText={scanning.as((s) => (s ? "Scanning…" : "Scan"))}
          onClicked={() => wifi.scan()}
        >
          <label label="󰑐" />
        </button>
        <button
          class={enabled.as((e) => (e ? "action-btn bt-power-on" : "action-btn"))}
          tooltipText={enabled.as((e) => (e ? "Turn off Wi-Fi" : "Turn on Wi-Fi"))}
          onClicked={() => wifi.set_enabled(!wifi.enabled)}
        >
          <label label={enabled.as((e) => (e ? "󰤨" : "󰤭"))} />
        </button>
      </box>
      {listBox}
    </box>
  );
}

export default function Network() {
  const network = AstalNetwork.get_default();
  if (!network) return <box />;

  const wifi = network.wifi;
  const wired = network.wired;

  if (!wifi && !wired) return <box />;

  return (
    <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <button
        class="mixer-header-btn"
        tooltipText="Open Network Manager"
        onClicked={() => execAsync(["nm-connection-editor"]).catch(console.error)}
      >
        <label class="section-label" xalign={0} label="NETWORK ↗" />
      </button>
      {wired ? <WiredRow wired={wired} /> : null}
      {wifi ? <WifiCard wifi={wifi} /> : null}
    </box>
  );
}
