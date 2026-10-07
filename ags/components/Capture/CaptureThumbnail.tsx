import { Astal, Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import Gio from "gi://Gio";

import {
  lastCapture,
  dismissCapture,
  openPath,
  deletePath,
} from "./captureControl";

const THUMB_W = 240;
const THUMB_H = 135;

// Floating preview in the bottom-right after a capture, like macOS.
export default function CaptureThumbnail({ monitor }: { monitor: number }) {
  const picture = new Gtk.Picture({
    contentFit: Gtk.ContentFit.COVER,
    widthRequest: THUMB_W,
    heightRequest: THUMB_H,
    canShrink: true,
  });
  picture.add_css_class("capture-thumb-img");

  const update = () => {
    const c = lastCapture.get();
    picture.set_file(c?.thumb ? Gio.File.new_for_path(c.thumb) : null);
  };
  onCleanup(lastCapture.subscribe(update));
  update();

  // Left click opens the file, right click just dismisses.
  const click = new Gtk.GestureClick({ button: 0 });
  click.connect("pressed", () => {
    const c = lastCapture.get();
    if (c && click.get_current_button() === 1) openPath(c.path);
    dismissCapture();
  });
  picture.add_controller(click);

  const trash = () => {
    const c = lastCapture.get();
    if (c) deletePath(c.path);
    dismissCapture();
  };

  return (
    <window
      class="capture-thumb-outer"
      namespace="capture-thumbnail"
      anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.NONE}
      monitor={monitor}
      visible={lastCapture.as((c) => c !== null && c.monitor === monitor)}
    >
      <overlay class="capture-thumb" marginEnd={16} marginBottom={16}>
        {picture}
        <label
          $type="overlay"
          class="capture-thumb-badge"
          label="󰕧"
          halign={Gtk.Align.START}
          valign={Gtk.Align.END}
          visible={lastCapture.as((c) => c?.isVideo ?? false)}
          canTarget={false}
        />
        <box $type="overlay" halign={Gtk.Align.END} valign={Gtk.Align.START} spacing={4}>
          <button class="capture-thumb-btn" tooltipText="Move to trash" onClicked={trash}>
            <label label="󰆴" />
          </button>
          <button class="capture-thumb-btn" tooltipText="Dismiss" onClicked={dismissCapture}>
            <label label="󰅖" />
          </button>
        </box>
      </overlay>
    </window>
  );
}
