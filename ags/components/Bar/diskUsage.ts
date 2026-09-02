import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { createState } from "ags";

// Bar turns red at or above this. 90% of 598G still leaves ~60G, which is enough
// warning to act before apps start writing truncated files.
export const DISK_CRITICAL_PERCENT = 92;

const WATCHED_PATH = "/";

// Deliberately used/(used+free) rather than used/size: the filesystem's reserved
// blocks are neither, so dividing by size reads ~4% lower than df does.
function readUsedPercent(path: string): number {
  try {
    const info = Gio.File.new_for_path(path).query_filesystem_info(
      "filesystem::used,filesystem::free",
      null,
    );
    const used = info.get_attribute_uint64("filesystem::used");
    const free = info.get_attribute_uint64("filesystem::free");
    const total = used + free;
    return total ? Math.round((used / total) * 100) : 0;
  } catch {
    return 0;
  }
}

const [diskUsedPercent, setDiskUsedPercent] = createState(
  readUsedPercent(WATCHED_PATH),
);

export { diskUsedPercent };

export function refreshDiskUsage(): number {
  const pct = readUsedPercent(WATCHED_PATH);
  setDiskUsedPercent(pct);
  return pct;
}

// No onCleanup: this lives at module scope and the bar runs for the whole session.
GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 60, () => {
  refreshDiskUsage();
  return GLib.SOURCE_CONTINUE;
});
