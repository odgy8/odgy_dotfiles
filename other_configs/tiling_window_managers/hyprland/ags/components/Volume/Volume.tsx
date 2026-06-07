import { Gtk } from "ags/gtk4";
import VolumeSliders from "./VolumeSliders";
import SinkSelector from "./SinkSelector";
import AppMixer from "./AppMixer";
import MediaPlayer from "./MediaPlayer";
import Bluetooth from "./Bluetooth";
import Notifications from "./Notifications";

export default function Volume() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <VolumeSliders />
      <AppMixer />
      <MediaPlayer />
      <Bluetooth />
      <box><SinkSelector /></box>
      <Notifications />
    </box>
  );
}
