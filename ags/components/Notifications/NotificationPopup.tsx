import AstalNotifd from "gi://AstalNotifd";
import GLib from "gi://GLib";
import { Astal, Gtk } from "ags/gtk4";

const TIMEOUT_MS = 5000;

export default function NotificationPopup({ monitor }: { monitor: number }) {
  const notifd = AstalNotifd.get_default();
  const anchor = Astal.WindowAnchor;

  const box = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 8,
    marginTop: 8,
    marginEnd: 8,
    marginBottom: 8,
    halign: Gtk.Align.END,
    valign: Gtk.Align.START,
  });

  const timers = new Map<number, number>();
  let winRef: any = null;

  const dismiss = (id: number, row: Gtk.Widget) => {
    const src = timers.get(id);
    if (src !== undefined) GLib.source_remove(src);
    timers.delete(id);
    row.unparent();
    if (!box.get_first_child()) {
      winRef?.set_visible(false);
    } else {
      winRef?.set_visible(false);
      winRef?.set_visible(true);
    }
  };

  const addToast = (n: any) => {
    let child = box.get_first_child();
    while (child) {
      if ((child as any)._notiId === n.id) { dismiss(n.id, child); break; }
      child = child.get_next_sibling();
    }

    // Outer row is HORIZONTAL so the dismiss button is a sibling of the content
    // box, not nested inside it. Events only bubble up through ancestors — never
    // sideways to siblings — so clicking × cannot trigger the content gesture.
    const row = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });
    row.add_css_class("npopup-toast");
    (row as any)._notiId = n.id;

    const content = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 });
    content.set_hexpand(true);

    const appRow = new Gtk.Box({ spacing: 8 });
    appRow.set_valign(Gtk.Align.CENTER);
    const icon = new Gtk.Image();
    icon.set_from_icon_name(n.appIcon || "dialog-information-symbolic");
    icon.set_pixel_size(16);
    const appLabel = new Gtk.Label({ label: n.appName || "Notification", hexpand: true, xalign: 0 });
    appLabel.set_ellipsize(3);
    appLabel.add_css_class("npopup-app");
    appRow.append(icon);
    appRow.append(appLabel);
    content.append(appRow);

    const summary = new Gtk.Label({ label: n.summary || n.appName || "", xalign: 0, maxWidthChars: 40 });
    summary.set_ellipsize(3);
    summary.add_css_class("npopup-summary");
    content.append(summary);

    if (n.body && n.body.trim().length > 0) {
      const body = new Gtk.Label({ label: n.body, xalign: 0, maxWidthChars: 40 });
      body.set_wrap(true); body.set_ellipsize(3); body.set_lines(3);
      body.add_css_class("npopup-body");
      content.append(body);
    }

    // Left click → invoke default action + dismiss; right click → dismiss only.
    // Gesture is on `content`, dismiss button is a sibling — safe from conflicts.
    const gesture = new Gtk.GestureClick();
    gesture.set_button(0);
    gesture.connect("pressed", () => {
      const btn = gesture.get_current_button();
      if (btn === 1) {
        n.invoke("default");
        dismiss(n.id, row);
      } else if (btn === 3) {
        dismiss(n.id, row);
      }
    });
    content.add_controller(gesture);

    const dismissBtn = new Gtk.Button();
    dismissBtn.add_css_class("npopup-dismiss");
    dismissBtn.set_valign(Gtk.Align.START);
    dismissBtn.set_child(new Gtk.Label({ label: "×" }));
    dismissBtn.connect("clicked", () => dismiss(n.id, row));

    row.append(content);
    row.append(dismissBtn);

    box.prepend(row);
    winRef?.set_visible(true);

    const src = GLib.timeout_add(GLib.PRIORITY_DEFAULT, TIMEOUT_MS, () => {
      dismiss(n.id, row);
      return false;
    });
    timers.set(n.id, src);
  };

  notifd.connect("notified", (_: any, id: number, replaced: boolean) => {
    if (replaced) return;
    const n = notifd.get_notification(id);
    if (n) addToast(n);
  });

  const win = (
    <window
      class="npopup-outer"
      anchor={anchor.TOP | anchor.RIGHT}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.NONE}
      monitor={monitor}
      visible={false}
    >
      {box}
    </window>
  );

  winRef = win;
  return win;
}
