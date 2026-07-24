import { Gtk } from "ags/gtk4";
import Network from "./Network";
import Vpn from "./Vpn";
import Bluetooth from "./Bluetooth";

export default function Connectivity() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <Network />
      <Vpn />
      <Bluetooth />
    </box>
  );
}
