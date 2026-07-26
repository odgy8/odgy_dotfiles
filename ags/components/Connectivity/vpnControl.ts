import { createPoll } from "ags/time";
import { execAsync } from "ags/process";

// NetworkManager has no VPN connection to query here — Surfshark runs its own
// tunnel outside nmcli. Detecting a tun/wg interface is the closest we get to
// a real "connected" signal without Surfshark's own CLI.
export const vpnConnected = createPoll(false, 3000, async () => {
  try {
    const out = await execAsync(["ip", "-o", "link", "show"]);
    // Widened from requiring an exact "tun0"/"wg0"-style digit suffix —
    // Surfshark's own client may name its tunnel differently, and that
    // stricter pattern couldn't be verified against a live connection
    // (Surfshark's GUI currently fails to render at all — separate bug).
    return /\b(tun|wg|surfshark)\w*[:@]/.test(out);
  } catch {
    return false;
  }
});
