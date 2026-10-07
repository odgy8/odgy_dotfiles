import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createState, onCleanup, type Accessor, type Setter } from "ags";
import { execAsync } from "ags/process";
import { timeout } from "ags/time";
import GLib from "gi://GLib";
import GdkPixbuf from "gi://GdkPixbuf";

interface HyprMonitor {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  transform: number;
  activeWorkspace: { id: number };
}

interface HyprWorkspace {
  id: number;
  monitorID: number;
}

interface HyprClient {
  address: string;
  at: [number, number];
  size: [number, number];
  workspace: { id: number };
  class: string;
  title: string;
  focusHistoryID: number;
  mapped: boolean;
  hidden: boolean;
}

interface OverviewProps {
  monitor: number;
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
}

const SHOT_DIR = `${GLib.get_user_runtime_dir()}/ags-overview`;
const MAX_COLS = 3;
const GAP = 24;
// Long enough for the first frame to land before the crops block the loop.
const FILL_DELAY_MS = 30;

const hypr = async <T,>(what: string): Promise<T> =>
  JSON.parse(await execAsync(["hyprctl", "-j", what]));

const dispatch = (expr: string) =>
  execAsync(["hyprctl", "dispatch", expr]).catch(console.error);

function appIcon(cls: string): string {
  const theme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!);
  for (const name of [cls, cls.toLowerCase(), cls.split(".").pop()!.toLowerCase()]) {
    if (name && theme.has_icon(name)) return name;
  }
  return "application-x-executable";
}

// Window's area cut out of the monitor screenshot. Coords are logical, the
// screenshot is physical, so everything is multiplied by the monitor scale.
function cropWindow(
  shot: GdkPixbuf.Pixbuf,
  mon: HyprMonitor,
  c: HyprClient,
  w: number,
  h: number,
): Gdk.Texture | null {
  const s = mon.scale;
  const x0 = Math.max(0, Math.round((c.at[0] - mon.x) * s));
  const y0 = Math.max(0, Math.round((c.at[1] - mon.y) * s));
  const x1 = Math.min(shot.width, Math.round((c.at[0] - mon.x + c.size[0]) * s));
  const y1 = Math.min(shot.height, Math.round((c.at[1] - mon.y + c.size[1]) * s));
  if (x1 - x0 < 2 || y1 - y0 < 2) return null;
  const sub = shot.new_subpixbuf(x0, y0, x1 - x0, y1 - y0);
  const scaled = sub.scale_simple(w, h, GdkPixbuf.InterpType.TILES);
  return scaled ? Gdk.Texture.new_for_pixbuf(scaled) : null;
}

// Mission Control: every workspace on this monitor drawn to scale. The active
// workspace uses a real screenshot; hidden ones aren't rendered by Hyprland,
// so they get icon + title placeholders.
export default function Overview({ monitor, isOpen, setIsOpen }: OverviewProps) {
  const [shown, setShown] = createState(false);
  const content = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    halign: Gtk.Align.CENTER,
    valign: Gtk.Align.CENTER,
  });

  const connector =
    (Gdk.Display.get_default()?.get_monitors().get_item(monitor) as Gdk.Monitor | null)
      ?.get_connector() ?? "";

  const close = () => setIsOpen(false);

  const windowWidget = (c: HyprClient, w: number, h: number): Gtk.Button => {
    const btn = new Gtk.Button({ tooltipText: c.title || c.class });
    btn.add_css_class("ov-window");
    btn.set_size_request(w, h);

    const box = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 4,
      halign: Gtk.Align.CENTER,
      valign: Gtk.Align.CENTER,
    });
    box.append(new Gtk.Image({ iconName: appIcon(c.class), pixelSize: Math.min(48, h / 2) }));
    if (h > 60) {
      const title = new Gtk.Label({ label: c.title || c.class, maxWidthChars: 18, ellipsize: 3 });
      title.add_css_class("ov-window-title");
      box.append(title);
    }
    btn.set_child(box);

    btn.connect("clicked", () => {
      dispatch(`hl.dsp.focus({window = hl.get_window('address:${c.address}')})`);
      close();
    });
    return btn;
  };

  // Shows the overview with placeholders first and returns a function that
  // swaps in the screenshot crops, so decoding never delays the open.
  const build = async (): Promise<(() => void) | null> => {
    const [mons, wss, clients] = await Promise.all([
      hypr<HyprMonitor[]>("monitors"),
      hypr<HyprWorkspace[]>("workspaces"),
      hypr<HyprClient[]>("clients"),
    ]);
    const mon = mons.find((m) => m.name === connector);
    if (!mon) return null;

    // Taken before the overlay shows, so it isn't in the shot.
    GLib.mkdir_with_parents(SHOT_DIR, 0o755);
    const shotPath = `${SHOT_DIR}/${mon.name}.ppm`;
    // ppm, not png - png compression of a 4K frame takes ~2s.
    const shotOk = await execAsync([
      "grim", "-s", String(mon.scale), "-t", "ppm", "-o", mon.name, shotPath,
    ]).then(() => true, (e) => (console.error(e), false));
    const live: { btn: Gtk.Button; c: HyprClient; w: number; h: number }[] = [];

    const rotated = mon.transform % 2 === 1;
    const logicalW = (rotated ? mon.height : mon.width) / mon.scale;
    const logicalH = (rotated ? mon.width : mon.height) / mon.scale;

    // Workspace -98 etc. are the minimise trick / specials - skip them.
    const ids = wss
      .filter((w) => w.monitorID === mon.id && w.id > 0)
      .map((w) => w.id)
      .sort((a, b) => a - b);
    if (!ids.includes(mon.activeWorkspace.id)) ids.push(mon.activeWorkspace.id);

    const cols = Math.min(ids.length, MAX_COLS);
    const tileW = Math.min(logicalW * 0.4, (logicalW * 0.85 - (cols - 1) * GAP) / cols);
    const k = tileW / logicalW;
    const tileH = Math.round(logicalH * k);

    const grid = new Gtk.Grid({ columnSpacing: GAP, rowSpacing: GAP });

    ids.forEach((id, i) => {
      const fixed = new Gtk.Fixed();
      fixed.set_size_request(Math.round(tileW), tileH);
      fixed.set_overflow(Gtk.Overflow.HIDDEN);

      // Oldest first so the most recently focused window ends up on top.
      clients
        .filter((c) => c.workspace.id === id && c.mapped && !c.hidden)
        .sort((a, b) => b.focusHistoryID - a.focusHistoryID)
        .forEach((c) => {
          const w = Math.max(8, Math.round(c.size[0] * k));
          const h = Math.max(8, Math.round(c.size[1] * k));
          const btn = windowWidget(c, w, h);
          if (id === mon.activeWorkspace.id) live.push({ btn, c, w, h });
          fixed.put(
            btn,
            Math.round((c.at[0] - mon.x) * k),
            Math.round((c.at[1] - mon.y) * k),
          );
        });

      // Empty space on a desktop switches to it.
      const desk = new Gtk.Button({ child: fixed });
      desk.add_css_class("ov-desktop");
      if (id === mon.activeWorkspace.id) desk.add_css_class("active");
      desk.connect("clicked", () => {
        dispatch(`hl.dsp.focus({workspace='${id}'})`);
        close();
      });

      const label = new Gtk.Label({ label: `Desktop ${id}` });
      label.add_css_class("ov-desktop-label");

      const cell = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, spacing: 6 });
      cell.append(desk);
      cell.append(label);
      grid.attach(cell, i % cols, Math.floor(i / cols), 1, 1);
    });

    while (content.get_first_child()) content.get_first_child()!.unparent();
    content.append(grid);

    return () => {
      if (!shotOk || live.length === 0) return;
      try {
        const shot = GdkPixbuf.Pixbuf.new_from_file(shotPath);
        for (const { btn, c, w, h } of live) {
          const tex = cropWindow(shot, mon, c, w, h);
          if (!tex) continue;
          btn.add_css_class("ov-window-live");
          btn.set_child(new Gtk.Picture({ paintable: tex, canShrink: true }));
        }
      } catch (e) {
        console.error(e);
      }
    };
  };

  const unsub = isOpen.subscribe(() => {
    if (!isOpen.get()) {
      setShown(false);
      return;
    }
    build()
      .then((fill) => {
        if (!isOpen.get()) return;
        setShown(true);
        if (fill) timeout(FILL_DELAY_MS, fill);
      })
      .catch((e) => {
        console.error(e);
        setIsOpen(false);
      });
  });
  onCleanup(unsub);

  const backdrop = new Gtk.Box({ hexpand: true, vexpand: true });
  backdrop.add_css_class("ov-backdrop");
  const backClick = new Gtk.GestureClick();
  backClick.connect("pressed", close);
  backdrop.add_controller(backClick);

  const overlay = new Gtk.Overlay();
  overlay.set_child(backdrop);
  overlay.add_overlay(content);

  const keys = new Gtk.EventControllerKey();
  keys.connect("key-pressed", (_c, keyval) => {
    if (keyval !== Gdk.KEY_Escape) return false;
    close();
    return true;
  });

  return (
    <window
      class="ov-outer"
      namespace="overview"
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      monitor={monitor}
      visible={shown}
      $={(self) => self.add_controller(keys)}
    >
      {overlay}
    </window>
  );
}
