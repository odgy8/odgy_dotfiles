// Package imports
import app from "ags/gtk4/app";
import { createState, type Setter } from "ags";
import AstalHyprland from "gi://AstalHyprland";
import Adw from "gi://Adw";
import Gdk from "gi://Gdk";

// Style imports
import style from "./sambar.css";
import BarCss from "./components/Bar/Bar.css";
import PopupCss from "./components/Popup/Popup.css";
import ButtonCss from "./widgets/Button.css";
import FootingCss from "./components/Footing/Footing.css";
import MediaCss from "./components/Media/Media.css";
import CaptureCss from "./components/Capture/Capture.css";
import ControlCentreCss from "./components/ControlCentre/ControlCentre.css";
import OverviewCss from "./components/Overview/Overview.css";

// Component imports
import Bar from "./components/Bar/Bar";
import Popup from "./components/Popup/Popup";
import Volume from "./components/Volume/Volume";
import Connectivity from "./components/Connectivity/Connectivity";
import System from "./components/System/System";
import CalendarPopup from "./components/Calendar/CalendarPopup";
import Tray from "./components/Tray/Tray";
import NotificationPopup from "./components/Notifications/NotificationPopup";
import Footing from "./components/Footing/Footing";
import Media from "./components/Media/Media";
import CaptureToolbar from "./components/Capture/CaptureToolbar";
import CaptureThumbnail from "./components/Capture/CaptureThumbnail";
import ControlCentre from "./components/ControlCentre/ControlCentre";
import Overview from "./components/Overview/Overview";

Adw.StyleManager.get_default().colorScheme = Adw.ColorScheme.PREFER_DARK;

// One setter per monitor, so `ags request overview` opens it on the focused one.
const overviewSetters = new Map<string, Setter<boolean>>();

app.start({
  requestHandler(argv, res) {
    if (argv[0] !== "overview") return res(`unknown request: ${argv.join(" ")}`);
    const name = AstalHyprland.get_default().get_focused_monitor()?.name ?? "";
    const open = overviewSetters.get(name);
    if (!open) return res(`no overview for monitor ${name}`);
    open(true);
    res("ok");
  },
  css: style + BarCss + PopupCss + ButtonCss + FootingCss + MediaCss + CaptureCss + ControlCentreCss + OverviewCss,
  main() {
    // Build one Bar + set of popups per connected monitor, rather than a
    // fixed count — this file is shared between a 3-monitor desktop and a
    // single-monitor laptop, and monitors can also change at runtime (docking).
    const monitorCount =
      Gdk.Display.get_default()?.get_monitors().get_n_items() ?? 1;

    for (let monitor = 0; monitor < monitorCount; monitor++) {
      const [isVolumeOpen, setIsVolumeOpen] = createState<boolean>(false);
      const [isConnectivityOpen, setIsConnectivityOpen] =
        createState<boolean>(false);
      const [isSystemOpen, setIsSystemOpen] = createState<boolean>(false);
      const [isCalendarOpen, setIsCalendarOpen] = createState<boolean>(false);
      const [isCenterTrayOpen, setIsCenterTrayOpen] =
        createState<boolean>(false);
      const [isMediaOpen, setIsMediaOpen] = createState<boolean>(false);
      const [isCaptureOpen, setIsCaptureOpen] = createState<boolean>(false);
      const [isControlCentreOpen, setIsControlCentreOpen] =
        createState<boolean>(false);
      const [isOverviewOpen, setIsOverviewOpen] = createState<boolean>(false);

      const connector = (
        Gdk.Display.get_default()?.get_monitors().get_item(monitor) as Gdk.Monitor | null
      )?.get_connector();
      if (connector) overviewSetters.set(connector, setIsOverviewOpen);

      Bar({
        monitor,
        setIsVolumeOpen,
        setIsConnectivityOpen,
        setIsSystemOpen,
        setIsCalendarOpen,
        setIsCenterTrayOpen,
        setIsMediaOpen,
        setIsCaptureOpen,
        setIsControlCentreOpen,
        setIsOverviewOpen,
      });
      Popup({
        monitor,
        isOpen: isVolumeOpen,
        setIsOpen: setIsVolumeOpen,
        children: <Volume />,
      });
      Popup({
        monitor,
        isOpen: isConnectivityOpen,
        setIsOpen: setIsConnectivityOpen,
        children: <Connectivity />,
      });
      Popup({
        monitor,
        isOpen: isSystemOpen,
        setIsOpen: setIsSystemOpen,
        children: <System />,
      });
      Popup({
        monitor,
        isOpen: isCenterTrayOpen,
        setIsOpen: setIsCenterTrayOpen,
        children: <Tray />,
        halign: "center",
      });
      Popup({
        monitor,
        isOpen: isMediaOpen,
        setIsOpen: setIsMediaOpen,
        children: <Media />,
        halign: "center",
      });
      CalendarPopup({
        monitor,
        isOpen: isCalendarOpen,
        setIsOpen: setIsCalendarOpen,
      });
      Footing({ monitor });
      CaptureToolbar({
        monitor,
        isOpen: isCaptureOpen,
        setIsOpen: setIsCaptureOpen,
      });
      CaptureThumbnail({ monitor });
      Popup({
        monitor,
        isOpen: isControlCentreOpen,
        setIsOpen: setIsControlCentreOpen,
        children: <ControlCentre />,
      });
      Overview({
        monitor,
        isOpen: isOverviewOpen,
        setIsOpen: setIsOverviewOpen,
      });

      // Notifications only need to render once, on the primary monitor.
      if (monitor === 0) NotificationPopup({ monitor });
    }
  },
});
