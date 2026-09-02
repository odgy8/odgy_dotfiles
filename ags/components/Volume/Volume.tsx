import { Gtk } from "ags/gtk4";
import VolumeSliders from "./VolumeSliders";
import SinkSelector from "./SinkSelector";
import SourceSelector from "./SourceSelector";
import AppMixer from "./AppMixer";

export default function Volume() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <VolumeSliders />
      <AppMixer />
      <box><SinkSelector /></box>
      <box><SourceSelector /></box>
    </box>
  );
}
