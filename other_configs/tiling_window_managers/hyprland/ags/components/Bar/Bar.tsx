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
  setIsVolumeOpen: Setter<boolean>;
  setIsConnectivityOpen: Setter<boolean>;
  setIsSystemOpen: Setter<boolean>;
  setIsCalendarOpen: Setter<boolean>;
  setIsCenterTrayOpen: Setter<boolean>;
  monitor: number;
}

export default function Bar({
  setIsVolumeOpen,
  setIsConnectivityOpen,
  setIsSystemOpen,
  setIsCalendarOpen,
  setIsCenterTrayOpen,
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

      <button class="bar-tray-btn" onClicked={() => setIsCenterTrayOpen(true)}>
        <label label="󰀻" />
      </button>
    </box>
  );

  const RightSection = () => (
    <box spacing={8}>
      <button
        class="bar-icon-btn"
        tooltipText="Connectivity"
        onClicked={() => setIsConnectivityOpen(true)}
      >
        <label label="󰤨" />
      </button>
      <button
        class="bar-icon-btn"
        tooltipText="Volume"
        onClicked={() => setIsVolumeOpen(true)}
      >
        <label label="󰕾" />
      </button>
      <button
        class="bar-icon-btn"
        tooltipText="System"
        onClicked={() => setIsSystemOpen(true)}
      >
        <label label="󰐥" />
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
