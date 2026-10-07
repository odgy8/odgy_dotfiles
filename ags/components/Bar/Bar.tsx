// Package imports
import { Astal } from "ags/gtk4";
import { type Setter } from "ags";

// Style imports
import BarCss from "./Bar.css";

import Section from "../../widgets/Section";
import Workspaces from "../Workspaces/Workspaces";
import Clock from "../../widgets/Clock";
import Minimized from "../Minimized/Minimized";
import { sourceMute, toggleDefaultSourceMute } from "../Volume/volumeControl";
import DiskWarning from "./DiskWarning";
import MediaButton from "../Media/MediaButton";
import { DISK_CRITICAL_PERCENT, diskUsedPercent } from "./diskUsage";
import RecordingIndicator from "../Capture/RecordingIndicator";

interface BarProps {
  setIsVolumeOpen: Setter<boolean>;
  setIsConnectivityOpen: Setter<boolean>;
  setIsSystemOpen: Setter<boolean>;
  setIsCalendarOpen: Setter<boolean>;
  setIsCenterTrayOpen: Setter<boolean>;
  setIsMediaOpen: Setter<boolean>;
  setIsCaptureOpen: Setter<boolean>;
  monitor: number;
}

export default function Bar({
  setIsVolumeOpen,
  setIsConnectivityOpen,
  setIsSystemOpen,
  setIsCalendarOpen,
  setIsCenterTrayOpen,
  setIsMediaOpen,
  setIsCaptureOpen,
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

      <button
        class="bar-icon-btn"
        tooltipText={sourceMute.as((m) => (m ? "Unmute mic" : "Mute mic"))}
        onClicked={() => toggleDefaultSourceMute().catch(console.error)}
      >
        <label label={sourceMute.as((m) => (m ? "󰍭" : "󰍬"))} />
      </button>

      <button class="bar-clock-btn" onClicked={() => setIsCalendarOpen(true)}>
        <Clock />
      </button>

      <MediaButton onClicked={() => setIsMediaOpen(true)} />

      <button class="bar-tray-btn" onClicked={() => setIsCenterTrayOpen(true)}>
        <label label="󰀻" />
      </button>
    </box>
  );

  const RightSection = () => (
    <box spacing={8}>
      <DiskWarning />

      <RecordingIndicator />

      <button
        class="bar-icon-btn"
        tooltipText="Screenshot / record"
        onClicked={() => setIsCaptureOpen(true)}
      >
        <label label="󰄀" />
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
        tooltipText="Connectivity"
        onClicked={() => setIsConnectivityOpen(true)}
      >
        <label label="󰤨" />
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
      class={diskUsedPercent.as((p) =>
        p >= DISK_CRITICAL_PERCENT
          ? "bar bar-container disk-critical"
          : "bar bar-container",
      )}
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
