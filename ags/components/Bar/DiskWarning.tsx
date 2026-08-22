import {
  DISK_CRITICAL_PERCENT,
  diskUsedPercent,
  refreshDiskUsage,
} from "./diskUsage";

// Hidden entirely until the disk is critical, so the bar looks unchanged day to day.
// Clicking re-reads the filesystem, which is how you clear the red border once
// you've freed space rather than waiting out the 60s poll.
export default function DiskWarning() {
  return (
    <button
      class="disk-warning-btn"
      visible={diskUsedPercent.as((p) => p >= DISK_CRITICAL_PERCENT)}
      tooltipText={diskUsedPercent.as(
        (p) => `Disk ${p}% full — click to re-check`,
      )}
      onClicked={() => refreshDiskUsage()}
    >
      <label label={diskUsedPercent.as((p) => `󰋊 ${p}%`)} />
    </button>
  );
}
