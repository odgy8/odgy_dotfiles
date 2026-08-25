import { Gtk } from "ags/gtk4";
import { onCleanup } from "ags";
import { interval } from "ags/time";

import { trackLabel } from "./mediaState";

// Visible width of the title strip. Fixed so the clock beside it never moves.
const STRIP_WIDTH = 170;

// ~25px/s - quick enough to get through a long title, slow enough to read.
const TICK_MS = 40;
const STEP_PX = 1;

// Ticks held still at each end before turning around.
const PAUSE_TICKS = 40;

interface MediaButtonProps {
  onClicked: () => void;
}

export default function MediaButton({ onClicked }: MediaButtonProps) {
  const label = (
    <label class="media-bar-title" xalign={0} label={trackLabel} />
  ) as Gtk.Label;

  // Scrolled rather than ellipsized: the artist sits at the end of the string,
  // which is exactly the half an ellipsis would eat.
  const strip = new Gtk.ScrolledWindow({
    hscrollbarPolicy: Gtk.PolicyType.EXTERNAL,
    vscrollbarPolicy: Gtk.PolicyType.NEVER,
    propagateNaturalHeight: true,
    widthRequest: STRIP_WIDTH,
    // Clicks belong to the button, and the wheel shouldn't nudge the marquee.
    canTarget: false,
  });
  strip.add_css_class("media-bar-strip");
  strip.set_child(label);

  const adjustment = strip.get_hadjustment();
  let direction = 1;
  let held = PAUSE_TICKS;

  const restart = () => {
    adjustment.set_value(0);
    direction = 1;
    held = PAUSE_TICKS;
    strip.set_visible(trackLabel.get().length > 0);
  };

  const tick = interval(TICK_MS, () => {
    const end = adjustment.get_upper() - adjustment.get_page_size();
    if (end <= 1) return; // fits as-is, nothing to scroll
    if (held > 0) {
      held--;
      return;
    }

    const next = adjustment.get_value() + direction * STEP_PX;
    if (next >= end) {
      adjustment.set_value(end);
      direction = -1;
      held = PAUSE_TICKS;
    } else if (next <= 0) {
      adjustment.set_value(0);
      direction = 1;
      held = PAUSE_TICKS;
    } else {
      adjustment.set_value(next);
    }
  });

  restart();
  onCleanup(trackLabel.subscribe(restart));
  onCleanup(() => tick.cancel());

  return (
    <button
      class="bar-icon-btn"
      tooltipText={trackLabel.as((t) => t || "Nothing playing")}
      onClicked={onClicked}
    >
      <box spacing={6}>
        <label label="󰝚" />
        {strip}
      </box>
    </button>
  );
}
