// Package imports
import { Astal, Gtk } from "ags/gtk4";

// Style imports
import FootingCss from "./Footing.css";

interface FootingProps {
  monitor: number;
}

export default function Footing({ monitor = 0 }: FootingProps) {
  return (
    <window
      css={FootingCss}
      visible
      monitor={monitor}
      class="pill-window"
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={Astal.WindowAnchor.BOTTOM}
      layer={Astal.Layer.TOP}
    >
      <box
        class="pill-bar"
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      />
    </window>
  );
}
