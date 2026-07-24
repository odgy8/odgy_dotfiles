import { Gtk } from "ags/gtk4";
import VolumeSliders from "./VolumeSliders";
import SinkSelector from "./SinkSelector";
import AppMixer from "./AppMixer";
import MediaPlayer from "./MediaPlayer";

export default function Volume() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <VolumeSliders />
      <AppMixer />
      <MediaPlayer />
      <box><SinkSelector /></box>
    </box>
  );
}
