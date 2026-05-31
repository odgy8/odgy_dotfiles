import { onCleanup } from "ags";
import { Gtk } from "ags/gtk4";

// AstalTray is an optional dependency — import fails gracefully if not installed
let AstalTray: any = null;
try {
  AstalTray = (await import("gi://AstalTray")).default;
} catch {
  // libastal-tray-git not installed — tray will render empty
}

function TrayItemWidget(item: any): Gtk.Widget {
  const button = new Gtk.Button();
  button.add_css_class("tray-item");

  const icon = new Gtk.Image({ pixelSize: 18 });
  if (item.gicon) icon.set_from_gicon(item.gicon);
  button.set_child(icon);
  button.set_tooltip_markup(item.tooltip_markup || item.title || "");

  const changedId = item.connect("changed", () => {
    if (item.gicon) icon.set_from_gicon(item.gicon);
    button.set_tooltip_markup(item.tooltip_markup || item.title || "");
  });
  onCleanup(() => item.disconnect(changedId));

  let popover: Gtk.PopoverMenu | null = null;

  const showMenu = () => {
    if (!item.menu_model) return;
    if (popover) popover.unparent();
    item.about_to_show();
    popover = new Gtk.PopoverMenu({ menuModel: item.menu_model, hasArrow: false });
    popover.set_parent(button);
    button.insert_action_group("dbusmenu", item.action_group);
    popover.popup();
  };

  button.connect("clicked", () => {
    if (item.is_menu || item.menu_model) {
      showMenu();
    } else {
      item.activate(0, 0);
    }
  });

  const rightClick = new Gtk.GestureClick();
  rightClick.set_button(3);
  rightClick.connect("pressed", showMenu);
  button.add_controller(rightClick);

  onCleanup(() => { if (popover) popover.unparent(); });

  return button;
}

export default function Tray() {
  const box = new Gtk.Box({ spacing: 4 });
  if (!AstalTray) return box;

  const tray = AstalTray.get_default();
  const widgets = new Map<string, Gtk.Widget>();

  const addItem = (itemId: string) => {
    if (widgets.has(itemId)) return;
    const item = tray.get_item(itemId);
    if (!item) return;
    const widget = TrayItemWidget(item);
    widgets.set(itemId, widget);
    box.append(widget);
  };

  const removeItem = (itemId: string) => {
    const widget = widgets.get(itemId);
    if (widget) {
      widget.unparent();
      widgets.delete(itemId);
    }
  };

  for (const item of tray.items) {
    addItem(item.item_id);
  }

  const addId = tray.connect("item-added", (_: unknown, itemId: string) => addItem(itemId));
  const rmId = tray.connect("item-removed", (_: unknown, itemId: string) => removeItem(itemId));
  onCleanup(() => {
    tray.disconnect(addId);
    tray.disconnect(rmId);
  });

  return box;
}
