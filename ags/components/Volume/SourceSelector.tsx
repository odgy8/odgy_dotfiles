import { Gtk } from "ags/gtk4";
import { createMemo, With } from "ags";
import { sources, defaultSourceName, setDefaultSource } from "./volumeControl";

export default function SourceSelector() {
  const state = createMemo(() => ({
    list: sources(),
    current: defaultSourceName(),
  }));

  const inputOptionsToHide: string[] = [
    "Starship/Matisse HD Audio Controller Analog Stereo",
    "Easy Effects Source",
    "C920 PRO HD Webcam Analog Stereo",
  ];

  const renameMap: Record<string, string> = {
    "USB PnP Audio Device Mono": "Desktop Mic",
    "Arctis Pro Wireless Chat": "Headset Mic",
  };

  return (
    <With value={state}>
      {({ list, current }) => {
        const visible = list.filter(
          ({ description }) => !inputOptionsToHide.includes(description),
        );

        return visible.length <= 1 ? (
          <box />
        ) : (
          <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <label class="section-label" xalign={0} label="INPUT DEVICE" />
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
              {visible.map((source) => (
                <button
                  class={
                    source.name === current
                      ? "sink-btn sink-btn-active"
                      : "sink-btn"
                  }
                  onClicked={() => setDefaultSource(source.name)}
                  halign={Gtk.Align.FILL}
                >
                  <box spacing={8} valign={Gtk.Align.CENTER}>
                    <label
                      class="icon-label"
                      label={source.name === current ? "󰍬" : "󰍭"}
                    />
                    <label
                      class="primary-label"
                      label={
                        renameMap[source.description] || source.description
                      }
                      ellipsize={3}
                      maxWidthChars={28}
                      xalign={0}
                      hexpand
                    />
                  </box>
                </button>
              ))}
            </box>
          </box>
        );
      }}
    </With>
  );
}
