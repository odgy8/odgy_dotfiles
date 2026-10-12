import AstalNotifd from "gi://AstalNotifd";
import { execAsync } from "ags/process";

// notifd stores the sound hints but never plays them - do it here, once (not per monitor).
export default function playNotificationSounds() {
  const notifd = AstalNotifd.get_default();
  notifd.connect("notified", (_: any, id: number, replaced: boolean) => {
    const n = notifd.get_notification(id);
    if (!n || replaced || notifd.dontDisturb || n.suppressSound) return;
    const args = n.soundFile ? ["-f", n.soundFile] : n.soundName ? ["-i", n.soundName] : null;
    if (args) execAsync(["canberra-gtk-play", ...args]).catch(console.error);
  });
}
