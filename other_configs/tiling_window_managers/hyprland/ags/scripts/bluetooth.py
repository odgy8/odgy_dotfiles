#!/usr/bin/env python3
"""BlueZ D-Bus helper for AGS bluetooth control."""
import sys
import json
from gi.repository import Gio, GLib

BLUEZ = "org.bluez"
ADAPTER_IFACE = "org.bluez.Adapter1"
DEVICE_IFACE = "org.bluez.Device1"
PROPS_IFACE = "org.freedesktop.DBus.Properties"
OBJMGR_IFACE = "org.freedesktop.DBus.ObjectManager"

bus = Gio.bus_get_sync(Gio.BusType.SYSTEM, None)


def _call(path, iface, method, args=None, reply_type=None, timeout=30000):
    return bus.call_sync(
        BLUEZ, path, iface, method, args, reply_type,
        Gio.DBusCallFlags.NONE, timeout, None
    )


def _get_objects():
    return _call(
        "/", OBJMGR_IFACE, "GetManagedObjects", None,
        GLib.VariantType("(a{oa{sa{sv}}})")
    )[0]


def _unpack(v, default=None):
    if v is None:
        return default
    if hasattr(v, "unpack"):
        return v.unpack()
    return v


def cmd_status():
    objects = _get_objects()
    adapter = None
    devices = []

    for path, ifaces in objects.items():
        if ADAPTER_IFACE in ifaces:
            p = ifaces[ADAPTER_IFACE]
            adapter = {
                "path": path,
                "powered": bool(_unpack(p.get("Powered"), False)),
                "discovering": bool(_unpack(p.get("Discovering"), False)),
            }

        if DEVICE_IFACE in ifaces:
            p = ifaces[DEVICE_IFACE]
            name_v = p.get("Name") or p.get("Alias")
            name = _unpack(name_v, "Unknown")
            devices.append({
                "path": path,
                "address": _unpack(p.get("Address"), ""),
                "name": name,
                "paired": bool(_unpack(p.get("Paired"), False)),
                "bonded": bool(_unpack(p.get("Bonded"), False)),
                "connected": bool(_unpack(p.get("Connected"), False)),
                "icon": _unpack(p.get("Icon"), "bluetooth"),
                "trusted": bool(_unpack(p.get("Trusted"), False)),
                "rssi": _unpack(p.get("RSSI"), None),
            })

    print(json.dumps({"adapter": adapter, "devices": devices}))


def cmd_power(arg, adapter_path="/org/bluez/hci0"):
    if arg == "on":
        val = True
    elif arg == "off":
        val = False
    else:
        current = _call(
            adapter_path, PROPS_IFACE, "Get",
            GLib.Variant("(ss)", (ADAPTER_IFACE, "Powered")),
            GLib.VariantType("(v)")
        )[0]
        val = not bool(_unpack(current))
    _call(
        adapter_path, PROPS_IFACE, "Set",
        GLib.Variant("(ssv)", (ADAPTER_IFACE, "Powered", GLib.Variant("b", val))),
    )
    print("ok")


def cmd_connect(device_path):
    _call(device_path, DEVICE_IFACE, "Connect", timeout=30000)
    print("ok")


def cmd_disconnect(device_path):
    _call(device_path, DEVICE_IFACE, "Disconnect")
    print("ok")


def cmd_scan(arg, adapter_path="/org/bluez/hci0"):
    method = "StartDiscovery" if arg == "start" else "StopDiscovery"
    _call(adapter_path, ADAPTER_IFACE, method)
    print("ok")


def cmd_pair(device_path):
    _call(device_path, DEVICE_IFACE, "Pair", timeout=60000)
    print("ok")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    try:
        if cmd == "status":
            cmd_status()
        elif cmd == "power":
            arg = sys.argv[2] if len(sys.argv) > 2 else "toggle"
            path = sys.argv[3] if len(sys.argv) > 3 else "/org/bluez/hci0"
            cmd_power(arg, path)
        elif cmd == "connect":
            cmd_connect(sys.argv[2])
        elif cmd == "disconnect":
            cmd_disconnect(sys.argv[2])
        elif cmd == "scan":
            arg = sys.argv[2] if len(sys.argv) > 2 else "start"
            path = sys.argv[3] if len(sys.argv) > 3 else "/org/bluez/hci0"
            cmd_scan(arg, path)
        elif cmd == "pair":
            cmd_pair(sys.argv[2])
        else:
            print(json.dumps({"error": f"unknown command: {cmd}"}), file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
