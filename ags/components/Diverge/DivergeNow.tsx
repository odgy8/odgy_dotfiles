import Pango from "gi://Pango";
import { divergeNow, nowLabel, nowTooltip } from "./nowState";

// Today's timebox from Diverge's plan. Hidden when there's nothing on or Diverge is closed.
export default function DivergeNow() {
  return (
    <box
      class={divergeNow.as((n) => (n?.current?.kind === "break" ? "diverge-now break" : "diverge-now"))}
      visible={divergeNow.as((n) => nowLabel(n) !== "")}
      tooltipText={divergeNow.as(nowTooltip)}
    >
      <label label={divergeNow.as(nowLabel)} maxWidthChars={40} ellipsize={Pango.EllipsizeMode.END} />
    </box>
  );
}
