import { Gtk } from "ags/gtk4";
import { createMemo, With } from "ags";
import { sinks, defaultSinkName, setDefaultSink } from "./volumeControl";

export default function SinkSelector() {
  const state = createMemo(() => ({
    list: sinks(),
    current: defaultSinkName(),
  }));

  const outputOptionsToHide = [
    "Arctis Pro Wireless Chat",
    "Navi 48 HDMI/DP Audio Controller Digital Stereo (HDMI)",
  ];

  return (
    <With value={state}>
      {({ list, current }) =>
        list.length <= 1 ? (
          <box />
        ) : (
          <box class="card" orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <label class="section-label" xalign={0} label="OUTPUT DEVICE" />
            <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
              {list
                .filter(
                  ({ description }) =>
                    !outputOptionsToHide.includes(description),
                )
                .map((sink) => (
                  <button
                    class={
                      sink.name === current
                        ? "sink-btn sink-btn-active"
                        : "sink-btn"
                    }
                    onClicked={() => setDefaultSink(sink.name)}
                    halign={Gtk.Align.FILL}
                  >
                    <box spacing={8} valign={Gtk.Align.CENTER}>
                      <label
                        class="icon-label"
                        label={sink.name === current ? "󰕾" : "󰖁"}
                      />
                      <label
                        class="primary-label"
                        label={sink.description}
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
        )
      }
    </With>
  );
}
