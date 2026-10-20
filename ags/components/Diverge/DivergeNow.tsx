import Pango from "gi://Pango";
import AstalHyprland from "gi://AstalHyprland";
import { execAsync } from "ags/process";
import { timeout } from "ags/time";
import { divergeNow, nowLabel, nowTooltip, SOCKET } from "./nowState";

// Focusing the window also switches to its workspace. Same dispatch format as Taskbar.tsx.
function focusClient() {
  const client = AstalHyprland.get_default()
    .get_clients()
    .find((c) => c.class.toLowerCase().startsWith("diverge"));
  if (!client) return;
  // hyprctl needs the 0x prefix; not sure Astal keeps it.
  const addr = "0x" + client.address.replace(/^0x/, "");
  execAsync(["hyprctl", "dispatch", `hl.dsp.focus({window = hl.get_window('address:${addr}')})`]).catch(
    console.error,
  );
}

// /v1/show brings Diverge back from the tray and opens the tab. The window needs a moment
// to map before Hyprland can focus it.
function openCalendar() {
  execAsync([
    "curl", "-sf", "--max-time", "2", "--unix-socket", SOCKET,
    "-X", "POST", "-d", '{"view":"calendar"}', "http://diverge/v1/show",
  ])
    .catch(console.error)
    .finally(() => timeout(300, focusClient));
}

// Today's timebox from Diverge's plan. Hidden when there's nothing on or Diverge is closed.
export default function DivergeNow() {
  return (
    <button
      class={divergeNow.as((n) => (n?.current?.kind === "break" ? "diverge-now break" : "diverge-now"))}
      visible={divergeNow.as((n) => nowLabel(n) !== "")}
      tooltipText={divergeNow.as(nowTooltip)}
      onClicked={openCalendar}
    >
      <label label={divergeNow.as(nowLabel)} maxWidthChars={40} ellipsize={Pango.EllipsizeMode.END} />
    </button>
  );
}
