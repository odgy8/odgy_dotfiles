// Package imports
import app from "ags/gtk4/app";
import { createState } from "ags";
import Adw from "gi://Adw";

// Style imports
import style from "./sambar.css";
import BarCss from "./components/Bar/Bar.css";
import PopupCss from "./components/Popup/Popup.css";
import ButtonCss from "./widgets/Button.css";
import FootingCss from "./components/Footing/Footing.css";

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

Adw.StyleManager.get_default().colorScheme = Adw.ColorScheme.PREFER_DARK;

app.start({
  css: style + BarCss + PopupCss + ButtonCss + FootingCss,
  main() {
    const [isVolumeOpen0, setIsVolumeOpen0] = createState<boolean>(false);
    const [isVolumeOpen1, setIsVolumeOpen1] = createState<boolean>(false);
    const [isVolumeOpen2, setIsVolumeOpen2] = createState<boolean>(false);

    const [isConnectivityOpen0, setIsConnectivityOpen0] =
      createState<boolean>(false);
    const [isConnectivityOpen1, setIsConnectivityOpen1] =
      createState<boolean>(false);
    const [isConnectivityOpen2, setIsConnectivityOpen2] =
      createState<boolean>(false);

    const [isSystemOpen0, setIsSystemOpen0] = createState<boolean>(false);
    const [isSystemOpen1, setIsSystemOpen1] = createState<boolean>(false);
    const [isSystemOpen2, setIsSystemOpen2] = createState<boolean>(false);

    const [isCalendarOpen0, setIsCalendarOpen0] = createState<boolean>(false);
    const [isCalendarOpen1, setIsCalendarOpen1] = createState<boolean>(false);
    const [isCalendarOpen2, setIsCalendarOpen2] = createState<boolean>(false);

    const [isCenterTrayOpen0, setIsCenterTrayOpen0] =
      createState<boolean>(false);
    const [isCenterTrayOpen1, setIsCenterTrayOpen1] =
      createState<boolean>(false);
    const [isCenterTrayOpen2, setIsCenterTrayOpen2] =
      createState<boolean>(false);

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~ Monitor 1 ~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Bar({
      monitor: 0,
      setIsVolumeOpen: setIsVolumeOpen0,
      setIsConnectivityOpen: setIsConnectivityOpen0,
      setIsSystemOpen: setIsSystemOpen0,
      setIsCalendarOpen: setIsCalendarOpen0,
      setIsCenterTrayOpen: setIsCenterTrayOpen0,
    });
    Popup({
      monitor: 0,
      isOpen: isVolumeOpen0,
      setIsOpen: setIsVolumeOpen0,
      children: <Volume />,
    });
    Popup({
      monitor: 0,
      isOpen: isConnectivityOpen0,
      setIsOpen: setIsConnectivityOpen0,
      children: <Connectivity />,
    });
    Popup({
      monitor: 0,
      isOpen: isSystemOpen0,
      setIsOpen: setIsSystemOpen0,
      children: <System />,
    });
    Popup({
      monitor: 0,
      isOpen: isCenterTrayOpen0,
      setIsOpen: setIsCenterTrayOpen0,
      children: <Tray />,
      halign: "center",
    });
    CalendarPopup({
      monitor: 0,
      isOpen: isCalendarOpen0,
      setIsOpen: setIsCalendarOpen0,
    });
    NotificationPopup({ monitor: 0 });
    Footing({ monitor: 0 });

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~ Monitor 2 ~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Bar({
      monitor: 1,
      setIsVolumeOpen: setIsVolumeOpen1,
      setIsConnectivityOpen: setIsConnectivityOpen1,
      setIsSystemOpen: setIsSystemOpen1,
      setIsCalendarOpen: setIsCalendarOpen1,
      setIsCenterTrayOpen: setIsCenterTrayOpen1,
    });
    Popup({
      monitor: 1,
      isOpen: isVolumeOpen1,
      setIsOpen: setIsVolumeOpen1,
      children: <Volume />,
    });
    Popup({
      monitor: 1,
      isOpen: isConnectivityOpen1,
      setIsOpen: setIsConnectivityOpen1,
      children: <Connectivity />,
    });
    Popup({
      monitor: 1,
      isOpen: isSystemOpen1,
      setIsOpen: setIsSystemOpen1,
      children: <System />,
    });
    Popup({
      monitor: 1,
      isOpen: isCenterTrayOpen1,
      setIsOpen: setIsCenterTrayOpen1,
      children: <Tray />,
      halign: "center",
    });
    CalendarPopup({
      monitor: 1,
      isOpen: isCalendarOpen1,
      setIsOpen: setIsCalendarOpen1,
    });
    Footing({ monitor: 1 });

    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~ Monitor 3 ~~~~~~~~~~~~~~~
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Bar({
      monitor: 2,
      setIsVolumeOpen: setIsVolumeOpen2,
      setIsConnectivityOpen: setIsConnectivityOpen2,
      setIsSystemOpen: setIsSystemOpen2,
      setIsCalendarOpen: setIsCalendarOpen2,
      setIsCenterTrayOpen: setIsCenterTrayOpen2,
    });
    Popup({
      monitor: 2,
      isOpen: isVolumeOpen2,
      setIsOpen: setIsVolumeOpen2,
      children: <Volume />,
    });
    Popup({
      monitor: 2,
      isOpen: isConnectivityOpen2,
      setIsOpen: setIsConnectivityOpen2,
      children: <Connectivity />,
    });
    Popup({
      monitor: 2,
      isOpen: isSystemOpen2,
      setIsOpen: setIsSystemOpen2,
      children: <System />,
    });
    Popup({
      monitor: 2,
      isOpen: isCenterTrayOpen2,
      setIsOpen: setIsCenterTrayOpen2,
      children: <Tray />,
      halign: "center",
    });
    CalendarPopup({
      monitor: 2,
      isOpen: isCalendarOpen2,
      setIsOpen: setIsCalendarOpen2,
    });
    Footing({ monitor: 2 });
  },
});
