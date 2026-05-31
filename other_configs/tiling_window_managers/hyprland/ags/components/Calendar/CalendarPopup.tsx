import WebKit from "gi://WebKit";
import GLib from "gi://GLib";
import { Astal, Gtk } from "ags/gtk4";
import { type Accessor, type Setter } from "ags";

import PopupCss from "../Popup/Popup.css";

const CHROME_UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const persistentSession = new WebKit.NetworkSession({
  dataDirectory: GLib.get_user_data_dir() + "/ags-calendar",
  cacheDirectory: GLib.get_user_cache_dir() + "/ags-calendar",
});

persistentSession
  .get_cookie_manager()
  .set_persistent_storage(
    GLib.get_user_data_dir() + "/ags-calendar/cookies.sqlite",
    WebKit.CookiePersistentStorage.SQLITE,
  );

function makeWebView(related?: WebKit.WebView): WebKit.WebView {
  const view = related
    ? new WebKit.WebView({
        relatedView: related,
        networkSession: persistentSession,
      })
    : new WebKit.WebView({ networkSession: persistentSession });

  const settings = view.get_settings();
  settings.set_user_agent(CHROME_UA);
  settings.set_enable_javascript(true);
  settings.set_enable_javascript_markup(true);

  return view;
}

// Opens OAuth popup windows in a plain Gtk.Window that closes itself when done
function handleCreate(mainView: WebKit.WebView) {
  mainView.connect("create", (_view: WebKit.WebView) => {
    const authView = makeWebView(mainView);

    const win = new Gtk.Window({
      title: "Sign in",
      defaultWidth: 800,
      defaultHeight: 800,
    });
    win.set_child(authView);
    win.present();

    // Once the auth flow redirects back to Google Calendar, close the popup
    authView.connect("notify::uri", () => {
      const uri = authView.get_uri() ?? "";
      if (uri.startsWith("https://calendar.google.com")) {
        win.close();
        mainView.load_uri(uri);
      }
    });

    return authView;
  });
}

interface CalendarPopupProps {
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
  monitor: number;
}

export default function CalendarPopup({
  isOpen,
  setIsOpen,
  monitor = 0,
}: CalendarPopupProps) {
  const anchor = Astal.WindowAnchor;

  const webView = makeWebView();
  webView.set_size_request(1200, 800);
  webView.set_hexpand(false);
  webView.set_vexpand(false);
  webView.load_uri("https://calendar.google.com/calendar/r");
  handleCreate(webView);

  const card = (
    <box
      css={PopupCss}
      class="popup calendar-card"
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
      hexpand={false}
      vexpand={false}
    >
      <box halign={Gtk.Align.END}>
        <button class="calendar-close-btn" onClicked={() => setIsOpen(false)}>
          <label label="×" />
        </button>
      </box>
      {webView as unknown as JSX.Element}
    </box>
  ) as unknown as Gtk.Widget;

  const backdrop = new Gtk.Box({ hexpand: true, vexpand: true });
  const closeGesture = new Gtk.GestureClick();
  closeGesture.connect("pressed", () => setIsOpen(false));
  backdrop.add_controller(closeGesture);

  const overlay = new Gtk.Overlay();
  overlay.set_child(backdrop);
  overlay.add_overlay(card);
  overlay.set_hexpand(true);
  overlay.set_vexpand(true);

  return (
    <window
      class="popup-outer"
      anchor={anchor.TOP | anchor.RIGHT | anchor.BOTTOM | anchor.LEFT}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.ON_DEMAND}
      monitor={monitor}
      visible={isOpen}
    >
      {overlay}
    </window>
  );
}
