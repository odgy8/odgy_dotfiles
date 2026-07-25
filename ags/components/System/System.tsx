import { Gtk } from "ags/gtk4";
import BatteryInfo from "./BatteryInfo";
import Notifications from "./Notifications";

export default function System() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <BatteryInfo />
      <Notifications />
    </box>
  );
}
