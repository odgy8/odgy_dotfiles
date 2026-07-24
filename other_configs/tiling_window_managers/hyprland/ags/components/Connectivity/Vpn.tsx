import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { vpnConnected } from "./vpnControl";

export default function Vpn() {
  return (
    <box class="card" spacing={8} valign={Gtk.Align.CENTER}>
      <label
        class="icon-label"
        label={vpnConnected.as((c) => (c ? "󰌾" : "󰿆"))}
      />
      <label
        class="primary-label"
        hexpand
        xalign={0}
        label={vpnConnected.as((c) => (c ? "VPN connected (Surfshark)" : "VPN not connected"))}
      />
      <button
        class="action-btn"
        tooltipText="Open Surfshark"
        onClicked={() => execAsync(["surfshark"]).catch(console.error)}
      >
        <label label="󰀈" />
      </button>
    </box>
  );
}
