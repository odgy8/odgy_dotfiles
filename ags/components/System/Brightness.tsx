import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { createState, onCleanup } from "ags";
import { execAsync } from "ags/process";
import { Gtk } from "ags/gtk4";

function findBacklightDir(): string | null {
  for (const dev of ["intel_backlight", "amdgpu_bl0", "acpi_video0", "acpi_video1"]) {
    const path = `/sys/class/backlight/${dev}`;
    if (Gio.File.new_for_path(`${path}/max_brightness`).query_exists(null)) return path;
  }
  return null;
}

function readInt(path: string): number {
  try {
    const [, data] = Gio.File.new_for_path(path).load_contents(null);
    return parseInt(new TextDecoder().decode(data).trim()) || 0;
  } catch {
    return 0;
  }
}

export default function Brightness() {
  const dir = findBacklightDir();
  if (!dir) return <box />;

  const max = readInt(`${dir}/max_brightness`);
  if (!max) return <box />;

  const getPct = () => Math.max(1, Math.round((readInt(`${dir}/brightness`) / max) * 100));

  const [pct, setPct] = createState(getPct());
  let dragging = false;
  let dragTimer: ReturnType<typeof setTimeout> | null = null;

  const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 2000, () => {
    if (!dragging) setPct(getPct());
    return GLib.SOURCE_CONTINUE;
  });
  onCleanup(() => GLib.source_remove(timer));

  return (
    <box class="card" spacing={8} valign={Gtk.Align.CENTER}>
      <label
        class="icon-label"
        label={pct.as((p) => p > 66 ? "󰃠" : p > 33 ? "󰃟" : "󰃞")}
      />
      <slider
        hexpand
        orientation={Gtk.Orientation.HORIZONTAL}
        drawValue={false}
        roundDigits={0}
        digits={0}
        min={1}
        max={100}
        value={pct}
        onChangeValue={(_: unknown, __: unknown, value: number) => {
          dragging = true;
          if (dragTimer) clearTimeout(dragTimer);
          dragTimer = setTimeout(() => { dragging = false; }, 600);
          const v = Math.max(1, Math.round(value));
          setPct(v);
          execAsync(["brightnessctl", "set", `${v}%`]).catch(console.error);
          return false;
        }}
      />
      <label class="pct-label" xalign={1} label={pct.as((p) => `${p}%`)} />
    </box>
  );
}
