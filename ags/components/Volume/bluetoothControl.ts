import { createPoll } from "ags/time";
import { execAsync } from "ags/process";

const BT_SCRIPT = "/home/sam/.config/ags/scripts/bluetooth.py";
const PYTHON = "/usr/bin/python3";

export interface BtAdapter {
  path: string;
  powered: boolean;
  discovering: boolean;
}

export interface BtDevice {
  path: string;
  address: string;
  name: string;
  paired: boolean;
  bonded: boolean;
  connected: boolean;
  icon: string;
  trusted: boolean;
  rssi: number | null;
}

export interface BtStatus {
  adapter: BtAdapter | null;
  devices: BtDevice[];
}

const empty: BtStatus = { adapter: null, devices: [] };

export const btStatus = createPoll(empty, 2000, async () => {
  try {
    const out = await execAsync([PYTHON, BT_SCRIPT, "status"]);
    return JSON.parse(out) as BtStatus;
  } catch {
    return empty;
  }
});

export async function btPowerToggle(adapterPath: string): Promise<void> {
  await execAsync([PYTHON, BT_SCRIPT, "power", "toggle", adapterPath]);
}

export async function btConnect(devicePath: string): Promise<void> {
  await execAsync([PYTHON, BT_SCRIPT, "connect", devicePath]);
}

export async function btDisconnect(devicePath: string): Promise<void> {
  await execAsync([PYTHON, BT_SCRIPT, "disconnect", devicePath]);
}

export async function btScanStart(adapterPath: string): Promise<void> {
  await execAsync([PYTHON, BT_SCRIPT, "scan", "start", adapterPath]);
}

export async function btScanStop(adapterPath: string): Promise<void> {
  await execAsync([PYTHON, BT_SCRIPT, "scan", "stop", adapterPath]);
}
