import { Gtk } from "ags/gtk4";
import { createBinding, createState, type Accessor } from "ags";
import { execAsync } from "ags/process";
import AstalNetwork from "gi://AstalNetwork";
import AstalNotifd from "gi://AstalNotifd";

import VolumeSliders from "../Volume/VolumeSliders";
import Brightness from "../System/Brightness";
import { sourceMute, toggleDefaultSourceMute } from "../Volume/volumeControl";
import { btStatus, btPowerToggle } from "../Connectivity/bluetoothControl";
import { vpnConnected } from "../Connectivity/vpnControl";

interface TileProps {
  icon: Accessor<string> | string;
  title: string;
  subtitle: Accessor<string> | string;
  active: Accessor<boolean>;
  onClicked: () => void;
}

function Tile({ icon, title, subtitle, active, onClicked }: TileProps) {
  return (
    <button
      class={active.as((a) => (a ? "cc-tile active" : "cc-tile"))}
      hexpand
      onClicked={onClicked}
    >
      <box spacing={10}>
        <label class="cc-tile-icon" label={icon} />
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
          <label class="cc-tile-title" label={title} xalign={0} />
          <label
            class="cc-tile-sub"
            label={subtitle}
            xalign={0}
            maxWidthChars={14}
            ellipsize={3}
          />
        </box>
      </box>
    </button>
  );
}

function NetworkTile() {
  const net = AstalNetwork.get_default();
  const wifi = net.wifi;

  if (wifi) {
    const enabled = createBinding(wifi, "enabled");
    const ssid = createBinding(wifi, "ssid");
    return (
      <Tile
        icon={enabled.as((e) => (e ? "󰤨" : "󰤭"))}
        title="Wi-Fi"
        subtitle={ssid.as((s) => (wifi.enabled ? s || "Not connected" : "Off"))}
        active={enabled}
        onClicked={() => wifi.set_enabled(!wifi.enabled)}
      />
    );
  }

  // Desktop with no wifi card - show wired status, nothing to toggle.
  const up = net.wired
    ? createBinding(net.wired, "state").as((s) => s === 100)
    : createState(false)[0];
  return (
    <Tile
      icon="󰈀"
      title="Ethernet"
      subtitle={up.as((u) => (u ? "Connected" : "Not connected"))}
      active={up}
      onClicked={() => {}}
    />
  );
}

function BluetoothTile() {
  const powered = btStatus.as((s) => s.adapter?.powered ?? false);
  return (
    <Tile
      icon={powered.as((p) => (p ? "󰂯" : "󰂲"))}
      title="Bluetooth"
      subtitle={btStatus.as((s) => {
        if (!s.adapter) return "No adapter";
        if (!s.adapter.powered) return "Off";
        const on = s.devices.filter((d) => d.connected).map((d) => d.name);
        return on.length ? on.join(", ") : "On";
      })}
      active={powered}
      onClicked={() => {
        const a = btStatus.get().adapter;
        if (a) btPowerToggle(a.path).catch(console.error);
      }}
    />
  );
}

function DndTile() {
  const notifd = AstalNotifd.get_default();
  const dnd = createBinding(notifd, "dontDisturb");
  return (
    <Tile
      icon={dnd.as((d) => (d ? "󰂛" : "󰂚"))}
      title="Focus"
      subtitle={dnd.as((d) => (d ? "Do Not Disturb" : "Off"))}
      active={dnd}
      onClicked={() => notifd.set_dont_disturb(!notifd.dontDisturb)}
    />
  );
}

function MicTile() {
  const live = sourceMute.as((m) => !m);
  return (
    <Tile
      icon={sourceMute.as((m) => (m ? "󰍭" : "󰍬"))}
      title="Microphone"
      subtitle={sourceMute.as((m) => (m ? "Muted" : "On"))}
      active={live}
      onClicked={() => toggleDefaultSourceMute().catch(console.error)}
    />
  );
}

function VpnTile() {
  return (
    <Tile
      icon={vpnConnected.as((c) => (c ? "󰌾" : "󰿆"))}
      title="VPN"
      subtitle={vpnConnected.as((c) => (c ? "Connected" : "Off"))}
      active={vpnConnected}
      onClicked={() => execAsync(["surfshark"]).catch(console.error)}
    />
  );
}

export default function ControlCentre() {
  const grid = new Gtk.Grid({
    columnSpacing: 8,
    rowSpacing: 8,
    columnHomogeneous: true,
  });
  const tiles = [NetworkTile(), BluetoothTile(), DndTile(), MicTile(), VpnTile()];
  tiles.forEach((t, i) =>
    grid.attach(t as unknown as Gtk.Widget, i % 2, Math.floor(i / 2), 1, 1),
  );

  return (
    <box class="cc" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <box class="card">{grid}</box>
      <Brightness />
      <VolumeSliders />
    </box>
  );
}
