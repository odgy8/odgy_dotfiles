// Package imports
import app from "ags/gtk4/app";
import { createState } from "ags";
import Adw from "gi://Adw";

// Style imports
import style from "./sambar.css";
import BarCss from "./components/Bar/Bar.css";
import PopupCss from "./components/Popup/Popup.css";
import ButtonCss from "./widgets/Button.css";

// Component imports
import Bar from "./components/Bar/Bar";
import Popup from "./components/Popup/Popup";
import Volume from "./components/Volume/Volume";
import CalendarPopup from "./components/Calendar/CalendarPopup";
import Tray from "./components/Tray/Tray";
import NotificationPopup from "./components/Notifications/NotificationPopup";

Adw.StyleManager.get_default().colorScheme = Adw.ColorScheme.PREFER_DARK;

app.start({
  css: style + BarCss + PopupCss + ButtonCss,
  main() {
    const [isOpen0, setIsOpen0] = createState<boolean>(false);
    const [isOpen1, setIsOpen1] = createState<boolean>(false);
    const [isOpen2, setIsOpen2] = createState<boolean>(false);

    const [isCalendarOpen0, setIsCalendarOpen0] = createState<boolean>(false);
    const [isCalendarOpen1, setIsCalendarOpen1] = createState<boolean>(false);
    const [isCalendarOpen2, setIsCalendarOpen2] = createState<boolean>(false);

    const [isTrayOpen0, setIsTrayOpen0] = createState<boolean>(false);
    const [isTrayOpen1, setIsTrayOpen1] = createState<boolean>(false);
    const [isTrayOpen2, setIsTrayOpen2] = createState<boolean>(false);

    Bar({ monitor: 0, setIsOpen: setIsOpen0, setIsCalendarOpen: setIsCalendarOpen0, setIsTrayOpen: setIsTrayOpen0 });
    Popup({ monitor: 0, isOpen: isOpen0, setIsOpen: setIsOpen0, children: <Volume /> });
    Popup({ monitor: 0, isOpen: isTrayOpen0, setIsOpen: setIsTrayOpen0, children: <Tray /> });
    CalendarPopup({ monitor: 0, isOpen: isCalendarOpen0, setIsOpen: setIsCalendarOpen0 });
    NotificationPopup({ monitor: 0 });

    Bar({ monitor: 1, setIsOpen: setIsOpen1, setIsCalendarOpen: setIsCalendarOpen1, setIsTrayOpen: setIsTrayOpen1 });
    Popup({ monitor: 1, isOpen: isOpen1, setIsOpen: setIsOpen1, children: <Volume /> });
    Popup({ monitor: 1, isOpen: isTrayOpen1, setIsOpen: setIsTrayOpen1, children: <Tray /> });
    CalendarPopup({ monitor: 1, isOpen: isCalendarOpen1, setIsOpen: setIsCalendarOpen1 });

    Bar({ monitor: 2, setIsOpen: setIsOpen2, setIsCalendarOpen: setIsCalendarOpen2, setIsTrayOpen: setIsTrayOpen2 });
    Popup({ monitor: 2, isOpen: isOpen2, setIsOpen: setIsOpen2, children: <Volume /> });
    Popup({ monitor: 2, isOpen: isTrayOpen2, setIsOpen: setIsTrayOpen2, children: <Tray /> });
    CalendarPopup({ monitor: 2, isOpen: isCalendarOpen2, setIsOpen: setIsCalendarOpen2 });
  },
});
