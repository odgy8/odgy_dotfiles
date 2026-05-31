import AstalHyprland from "gi://AstalHyprland";
import { createState, createMemo, onCleanup, With } from "ags";
import { Gtk } from "ags/gtk4";

export default function Taskbar() {
  const hypr = AstalHyprland.get_default();

  const [clients, setClients] = createState(hypr.get_clients());
  const [focusedAddr, setFocusedAddr] = createState(
    hypr.get_focused_client()?.address ?? "",
  );

  const ids = [
    hypr.connect("notify::clients", () => setClients(hypr.get_clients())),
    hypr.connect("notify::focused-client", () =>
      setFocusedAddr(hypr.get_focused_client()?.address ?? ""),
    ),
  ];
  onCleanup(() => ids.forEach((id) => hypr.disconnect(id)));

  const state = createMemo(() => ({
    list: clients(),
    focused: focusedAddr(),
  }));

  return (
    <With value={state}>
      {({ list, focused }) => (
        <box spacing={2}>
          {list.map((client) => (
            <button
              class={`task-btn${focused === client.address ? " task-focused" : ""}`}
              onClicked={() =>
                hypr.dispatch("focuswindow", `address:${client.address}`)
              }
              tooltipText={client.title}
            >
              <box spacing={5} valign={Gtk.Align.CENTER}>
                <image iconName={client.class.toLowerCase()} pixelSize={16} />
                <label label={client.class} ellipsize={3} maxWidthChars={10} />
              </box>
            </button>
          ))}
        </box>
      )}
    </With>
  );
}
