import AstalHyprland from "gi://AstalHyprland";
import { createState, createMemo, onCleanup, With } from "ags";

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
    list: workspaces().sort((a, b) => a.id - b.id),
    focused: focusedId(),
  }));

  return (
    <box spacing={4}>
      <With value={state}>
        {({ list, focused }) => (
          <box spacing={4}>
            {list.map((ws) => (
              <button
                class={focused === ws.id ? "workspace active" : "workspace"}
                widthRequest={28}
                heightRequest={28}
                onClicked={() => hypr.dispatch("workspace", String(ws.id))}
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
