import { createPoll } from "ags/time";
import { execAsync } from "ags/process";

// NetworkManager has no VPN connection to query here — Surfshark runs its own
// tunnel outside nmcli. Detecting a tun/wg interface is the closest we get to
// a real "connected" signal without Surfshark's own CLI.
export const vpnConnected = createPoll(false, 3000, async () => {
  try {
    const out = await execAsync(["ip", "-o", "link", "show"]);
    return /\b(tun|wg)\d+[:@]/.test(out);
  } catch {
    return false;
  }
});
