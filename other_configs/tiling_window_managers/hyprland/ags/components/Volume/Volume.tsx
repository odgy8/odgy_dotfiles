import { Gtk } from "ags/gtk4";
import VolumeSliders from "./VolumeSliders";
import SinkSelector from "./SinkSelector";
import AppMixer from "./AppMixer";
import MediaPlayer from "./MediaPlayer";
import Bluetooth from "./Bluetooth";

export default function Volume() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <VolumeSliders />
      <SinkSelector />
      <Bluetooth />
      <AppMixer />
      <MediaPlayer />
    </box>
  );
}
