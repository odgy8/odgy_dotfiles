import AstalNotifd from "gi://AstalNotifd";
import { onCleanup } from "ags";
import { Gtk } from "ags/gtk4";

function formatTime(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000);
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export default function Notifications() {
  const notifd = AstalNotifd.get_default();

  const clearAll = () => {
    notifd.get_notifications().forEach((n) => n.dismiss());
  };

  const listBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    spacing: 2,
  });

  const renderList = () => {
    const list = notifd.get_notifications();
    while (listBox.get_first_child()) {
      listBox.get_first_child()!.unparent();
    }
    if (list.length === 0) {
      listBox.append(
        <label
          class="empty-label"
          halign={Gtk.Align.CENTER}
          label="No notifications"
        />,
      );
      return;
    }
    for (const n of list) {
      listBox.append(
        <box class="notif-row" spacing={8} valign={Gtk.Align.CENTER}>
          <image
            iconName={n.appIcon || "dialog-information-symbolic"}
            widthRequest={16}
            heightRequest={16}
          />
          <label
            class="notif-app"
            hexpand
            xalign={0}
            ellipsize={3}
            maxWidthChars={20}
            label={n.summary || n.appName}
          />
          <label class="notif-time" xalign={1} label={formatTime(n.time)} />
          <button class="notif-dismiss" onClicked={() => n.dismiss()}>
            <label label="×" />
          </button>
        </box>,
      );
    }
  };

  renderList();

  const ids = [
    notifd.connect("notified", renderList),
    notifd.connect("resolved", renderList),
  ];
  onCleanup(() => ids.forEach((id) => notifd.disconnect(id)));

  return (
    <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <box valign={Gtk.Align.CENTER}>
        <label class="section-label" xalign={0} hexpand label="NOTIFICATIONS" />
        <button class="clear-btn" onClicked={clearAll}>
          <label label="󰆴  Clear" />
        </button>
      </box>
      {listBox}
    </box>
  );
}
