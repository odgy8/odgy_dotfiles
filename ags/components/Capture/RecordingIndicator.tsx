import { createPoll } from "ags/time";
import { createComputed } from "ags";

import { recordingSince, stopRecording } from "./captureControl";

const now = createPoll(0, 1000, () => Math.floor(Date.now() / 1000));

// Red dot + elapsed time while recording. Click to stop.
export default function RecordingIndicator() {
  const elapsed = createComputed(() => {
    const since = recordingSince();
    if (since === 0) return "";
    const secs = Math.max(0, now() - since);
    const m = Math.floor(secs / 60);
    const s = String(secs % 60).padStart(2, "0");
    return `󰑊 ${m}:${s}`;
  });

  return (
    <button
      class="bar-recording-btn"
      visible={recordingSince.as((s) => s > 0)}
      tooltipText="Stop recording"
      onClicked={stopRecording}
    >
      <label label={elapsed} />
    </button>
  );
}
