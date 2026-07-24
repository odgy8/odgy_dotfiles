// Package imports
import { Astal } from "ags/gtk4";
import { type Setter } from "ags";

// Style imports
import BarCss from "./Bar.css";

import Section from "../../widgets/Section";
import Workspaces from "../Workspaces/Workspaces";
import Clock from "../../widgets/Clock";
import Minimized from "../Minimized/Minimized";
import { sourceMute } from "../Volume/volumeControl";

interface BarProps {
  setIsOpen: Setter<boolean>;
  setIsCalendarOpen: Setter<boolean>;
  setIsTrayOpen: Setter<boolean>;
  monitor: number;
}

export default function Bar({
  setIsOpen,
  setIsCalendarOpen,
  setIsTrayOpen,
  monitor = 0,
}: BarProps) {
  const anchor = Astal.WindowAnchor;
  const exlusivity = Astal.Exclusivity;

  const LeftSection = () => (
    <box spacing={8}>
      <Workspaces />
    </box>
  );

  const CenterSection = () => (
    <box spacing={6}>
      <Minimized />

      <label label={sourceMute.as((m) => (m ? "󰍭" : "󰍬"))} />

      <button class="bar-clock-btn" onClicked={() => setIsCalendarOpen(true)}>
        <Clock />
      </button>

      <button class="bar-tray-btn" onClicked={() => setIsTrayOpen(true)}>
        <label label="󰀻" />
      </button>
    </box>
  );

  const RightSection = () => (
    <box spacing={8}>
      <button class="bar-volume-btn" onClicked={() => setIsOpen(true)}>
        <label label="󰒓" />
      </button>
    </box>
  );

  return (
    <window
      css={BarCss}
      visible
      monitor={monitor}
      anchor={anchor.TOP | anchor.LEFT | anchor.RIGHT}
      class="bar bar-container"
      exclusivity={exlusivity.EXCLUSIVE}
    >
      <centerbox
        startWidget={<Section content={<LeftSection />} />}

        centerWidget={<Section content={<CenterSection />} />}

        endWidget={<Section content={<RightSection />} />}
      />
    </window>
  );
}
