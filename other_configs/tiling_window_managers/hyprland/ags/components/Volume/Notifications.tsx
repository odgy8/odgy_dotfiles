import AstalNotifd from "gi://AstalNotifd";
import { Gtk } from "ags/gtk4";

function formatTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatTimeFull(unixSeconds: number): string {
  if (!unixSeconds) return "Unknown";
  const d = new Date(unixSeconds * 1000);
  const now = new Date();
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const time = `${h}:${m}`;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dDay.getTime() === today.getTime()) return `Today at ${time}`;
  if (dDay.getTime() === yesterday.getTime()) return `Yesterday at ${time}`;
  const dd = d.getDate().toString().padStart(2, "0");
  const mm = (d.getMonth() + 1).toString().padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()} at ${time}`;
}

export default function Notifications() {
  const notifd = AstalNotifd.get_default();
  let expandedId: number | null = null;

  const clearAll = () => {
    notifd.get_notifications().forEach((n: any) => n.dismiss());
  };

  const listBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 2,
  });

  const renderList = () => {
    while (listBox.get_first_child()) {
      listBox.get_first_child()!.unparent();
    }

    const list = [...notifd.get_notifications()].sort((a: any, b: any) => (b.time ?? 0) - (a.time ?? 0));

    if (list.length === 0) {
      const empty = new Gtk.Label({ label: "No notifications" });
      empty.set_halign(Gtk.Align.CENTER);
      empty.add_css_class("empty-label");
      listBox.append(empty);
      return;
    }

    for (const n of list) {
      const id = (n as any).id;
      const isExpanded = id === expandedId;

      // outerRow: vertical container for the class/background
      const outerRow = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 0 });
      outerRow.add_css_class("notif-row");
      if (isExpanded) outerRow.add_css_class("notif-row-expanded");

      // innerRow: horizontal so dismiss button is a sibling of content, not nested.
      // Clicks on × do NOT bubble sideways into the content gesture.
      const innerRow = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 0 });

      const contentBox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 4 });
      contentBox.set_hexpand(true);

      // Compact header (no dismiss button in here)
      const header = new Gtk.Box({ spacing: 8 });
      header.set_valign(Gtk.Align.CENTER);

      const icon = new Gtk.Image();
      icon.set_from_icon_name((n as any).appIcon || "dialog-information-symbolic");
      icon.set_pixel_size(16);

      const nameLabel = new Gtk.Label({
        label: (n as any).summary || (n as any).appName,
        hexpand: true,
        xalign: 0,
        maxWidthChars: 20,
      });
      nameLabel.set_ellipsize(3);
      nameLabel.add_css_class("notif-app");

      const timeLabel = new Gtk.Label({ label: formatTime((n as any).time), xalign: 1 });
      timeLabel.add_css_class("notif-time");

      header.append(icon);
      header.append(nameLabel);
      header.append(timeLabel);
      contentBox.append(header);

      // Expanded detail section
      if (isExpanded) {
        const detail = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 3 });
        detail.add_css_class("notif-detail");

        const addRow = (key: string, value: string, wrap = false) => {
          const r = new Gtk.Box({ spacing: 8 });
          const k = new Gtk.Label({ label: key, xalign: 0, widthChars: 5 });
          k.add_css_class("notif-detail-key");
          const v = new Gtk.Label({ label: value, xalign: 0, hexpand: true });
          if (wrap) v.set_wrap(true); else v.set_ellipsize(3);
          v.add_css_class("notif-detail-val");
          r.append(k); r.append(v);
          detail.append(r);
        };

        addRow("From", (n as any).appName || "Unknown");
        if ((n as any).summary) addRow("Title", (n as any).summary);
        if ((n as any).body?.trim()) addRow("Body", (n as any).body, true);
        addRow("Sent", formatTimeFull((n as any).time));

        contentBox.append(detail);
      }

      // Left click: toggle expand; right click: dismiss
      const gesture = new Gtk.GestureClick();
      gesture.set_button(0);
      gesture.connect("pressed", () => {
        const b = gesture.get_current_button();
        if (b === 1) {
          expandedId = expandedId === id ? null : id;
          renderList();
        } else if (b === 3) {
          if (expandedId === id) expandedId = null;
          (n as any).dismiss();
          renderList();
        }
      });
      contentBox.add_controller(gesture);

      // Dismiss button: sibling of contentBox (NOT nested), stays at top
      const btn = new Gtk.Button();
      btn.add_css_class("notif-dismiss");
      btn.set_valign(Gtk.Align.START);
      btn.set_child(new Gtk.Label({ label: "×" }));
      btn.connect("clicked", () => {
        if (expandedId === id) expandedId = null;
        (n as any).dismiss();
        renderList();
      });

      innerRow.append(contentBox);
      innerRow.append(btn);
      outerRow.append(innerRow);
      listBox.append(outerRow);
    }
  };

  renderList();

  notifd.connect("notified", renderList);
  notifd.connect("resolved", (_: any, id: number) => {
    if (expandedId === id) expandedId = null;
    renderList();
  });

  const clearBtn = new Gtk.Button();
  clearBtn.add_css_class("clear-btn");
  clearBtn.set_child(new Gtk.Label({ label: "󰆴  Clear" }));
  clearBtn.connect("clicked", clearAll);

  const header = new Gtk.Box({ spacing: 0 });
  header.set_valign(Gtk.Align.CENTER);
  const headerLabel = new Gtk.Label({ label: "NOTIFICATIONS", hexpand: true, xalign: 0 });
  headerLabel.add_css_class("section-label");
  header.append(headerLabel);
  header.append(clearBtn);

  const card = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 8 });
  card.add_css_class("card");
  card.append(header);
  card.append(listBox);

  return card;
}
