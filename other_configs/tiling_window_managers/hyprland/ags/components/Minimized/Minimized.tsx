import AstalHyprland from "gi://AstalHyprland";
import GLib from "gi://GLib";
import { createState, createMemo, onCleanup, With } from "ags";

export default function Minimized() {
  let hypr: AstalHyprland.Hyprland;
  try {
    hypr = AstalHyprland.get_default();
  } catch {
    return <box />;
  }

  const getCount = () =>
    hypr.get_clients().filter(
      (c) => c.workspace?.name === "special:minimized"
    ).length;

  const [count, setCount] = createState(getCount());

  const timer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
    setCount(getCount());
    return GLib.SOURCE_CONTINUE;
  });

  onCleanup(() => GLib.source_remove(timer));

  const state = createMemo(() => count());

  return (
    <With value={state}>
      {(n: number) => (
        <button
          visible={n > 0}
          class="minimized-btn"
          onClicked={() => hypr.dispatch("togglespecialworkspace", "minimized")}
        >
          <label label={`󰖰 ${n}`} />
        </button>
      )}
    </With>
  );
}
