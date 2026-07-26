import AstalHyprland from "gi://AstalHyprland";
import { createState, createMemo, onCleanup, With } from "ags";
import { execAsync } from "ags/process";

type INFERRED_WORKSPACE = {
  id: number;
};

export default function Workspaces() {
  let hypr: AstalHyprland.Hyprland;
  try {
    hypr = AstalHyprland.get_default();
  } catch {
    return <box />;
  }

  const [workspaces, setWorkspaces] = createState(hypr.get_workspaces());
  const [focusedId, setFocusedId] = createState(
    hypr.get_focused_workspace()?.id ?? 1,
  );

  const ids = [
    hypr.connect("notify::workspaces", () =>
      setWorkspaces(hypr.get_workspaces()),
    ),
    hypr.connect("notify::focused-workspace", () =>
      setFocusedId(hypr.get_focused_workspace()?.id ?? 1),
    ),
  ];
  onCleanup(() => ids.forEach((id) => hypr.disconnect(id)));

  // createMemo tracks both dependencies so With re-renders on either change
  const state = createMemo(() => ({
    list: workspaces()
      // There is a ws (-98) which is used by the minimise capability which is why why need to explicitly say over 0
      .filter((ws: INFERRED_WORKSPACE) => ws.id > 0)
      .sort((a: INFERRED_WORKSPACE, b: INFERRED_WORKSPACE) => a.id - b.id),

    focused: focusedId(),
  }));

  return (
    <box spacing={4}>
      <With value={state}>
        {({ list, focused }) => (
          <box spacing={4}>
            {list.map((ws: INFERRED_WORKSPACE) => (
              <button
                class={focused === ws.id ? "workspace active" : "workspace"}
                widthRequest={28}
                heightRequest={28}
                onClicked={() =>
                  // hypr.dispatch() sends the classic "dispatch <name> <args>"
                  // format over Hyprland's socket, which Hyprland now
                  // reinterprets as Lua code under lua-config and silently
                  // ignores — shelling out with the new required syntax
                  // instead (same fix as fit-to-monitor.sh).
                  execAsync([
                    "hyprctl",
                    "dispatch",
                    `hl.dsp.focus({workspace='${ws.id}'})`,
                  ])
                }
              >
                <label label={String(ws.id)} />
              </button>
            ))}
          </box>
        )}
      </With>
    </box>
  );
}
