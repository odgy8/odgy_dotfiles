import { Astal, Gtk, Gdk } from "ags/gtk4";
import { createComputed, createState, type Accessor, type Setter } from "ags";

import {
  type CaptureMode,
  runCapture,
  captureTimer,
  setCaptureTimer,
  captureClipboardOnly,
  setCaptureClipboardOnly,
  captureMic,
  setCaptureMic,
  recordingSince,
} from "./captureControl";

interface CaptureToolbarProps {
  monitor: number;
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
}

const MODES: { mode: CaptureMode; icon: string; tip: string }[] = [
  { mode: "shot-screen", icon: "󰍹", tip: "Capture entire screen" },
  { mode: "shot-window", icon: "󰖯", tip: "Capture selected window" },
  { mode: "shot-region", icon: "󰩭", tip: "Capture selected portion" },
  { mode: "rec-screen", icon: "󰑋", tip: "Record entire screen" },
  { mode: "rec-region", icon: "󰻃", tip: "Record selected portion" },
];

export default function CaptureToolbar({
  monitor,
  isOpen,
  setIsOpen,
}: CaptureToolbarProps) {
  const [mode, setMode] = createState<CaptureMode>("shot-region");
  const [showOptions, setShowOptions] = createState(false);

  // One recording at a time - wf-recorder can't share the output.
  const canCapture = createComputed(
    () => !mode().startsWith("rec") || recordingSince() === 0,
  );

  const capture = () => {
    const m = mode.get();
    if (!canCapture.get()) return;
    setShowOptions(false);
    setIsOpen(false);
    runCapture(m, monitor).catch(console.error);
  };

  const modeButton = ({ mode: m, icon, tip }: (typeof MODES)[number]) => (
    <button
      class={mode.as((cur) => (cur === m ? "capture-mode active" : "capture-mode"))}
      tooltipText={tip}
      onClicked={() => setMode(m)}
    >
      <label label={icon} />
    </button>
  );

  const timerButton = (secs: 0 | 5 | 10) => (
    <button
      class={captureTimer.as((t) => (t === secs ? "capture-chip active" : "capture-chip"))}
      onClicked={() => setCaptureTimer(secs)}
    >
      <label label={secs === 0 ? "None" : `${secs}s`} />
    </button>
  );

  const options = (
    <revealer
      revealChild={showOptions}
      transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
    >
      <box class="capture-options" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        <box spacing={6}>
          <label class="capture-opt-label" label="Timer" hexpand xalign={0} />
          {timerButton(0)}
          {timerButton(5)}
          {timerButton(10)}
        </box>
        <box spacing={6}>
          <label class="capture-opt-label" label="Clipboard only" hexpand xalign={0} />
          <switch
            active={captureClipboardOnly}
            onNotifyActive={(s) => setCaptureClipboardOnly(s.active)}
          />
        </box>
        <box spacing={6}>
          <label class="capture-opt-label" label="Record microphone" hexpand xalign={0} />
          <switch active={captureMic} onNotifyActive={(s) => setCaptureMic(s.active)} />
        </box>
      </box>
    </revealer>
  );

  const toolbar = (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.END}
      marginBottom={40}
    >
      {options}
      <box class="capture-toolbar" spacing={4}>
        <button class="capture-close" tooltipText="Close (Esc)" onClicked={() => setIsOpen(false)}>
          <label label="󰅖" />
        </button>
        <box class="capture-sep" />
        {MODES.slice(0, 3).map(modeButton)}
        <box class="capture-sep" />
        {MODES.slice(3).map(modeButton)}
        <box class="capture-sep" />
        <button class="capture-options-btn" onClicked={() => setShowOptions(!showOptions.get())}>
          <label label={showOptions.as((o) => (o ? "Options 󰅃" : "Options 󰅀"))} />
        </button>
        <button
          class="capture-go"
          sensitive={canCapture}
          onClicked={capture}
        >
          <label label={mode.as((m) => (m.startsWith("rec") ? "Record" : "Capture"))} />
        </button>
      </box>
    </box>
  ) as unknown as Gtk.Widget;

  // Clicking outside the toolbar closes it, like the popups.
  const backdrop = new Gtk.Box({ hexpand: true, vexpand: true });
  const closeGesture = new Gtk.GestureClick();
  closeGesture.connect("pressed", () => setIsOpen(false));
  backdrop.add_controller(closeGesture);

  const overlay = new Gtk.Overlay();
  overlay.set_child(backdrop);
  overlay.add_overlay(toolbar);

  const keys = new Gtk.EventControllerKey();
  keys.connect("key-pressed", (_c, keyval) => {
    if (keyval === Gdk.KEY_Escape) setIsOpen(false);
    else if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) capture();
    else return false;
    return true;
  });

  return (
    <window
      class="capture-outer"
      namespace="capture-toolbar"
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT | Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.LEFT}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      monitor={monitor}
      visible={isOpen}
      $={(self) => self.add_controller(keys)}
    >
      {overlay}
    </window>
  );
}
