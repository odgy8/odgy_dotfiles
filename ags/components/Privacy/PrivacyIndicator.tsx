import { privacy } from "./privacyState";

// Orange mic / green camera, only while something is capturing.
export default function PrivacyIndicator() {
  return (
    <box
      class="privacy-indicator"
      spacing={2}
      visible={privacy.as((p) => p.mic.length > 0 || p.camera.length > 0)}
    >
      <label
        class="privacy-mic"
        label="󰍬"
        visible={privacy.as((p) => p.mic.length > 0)}
        tooltipText={privacy.as((p) => `Microphone: ${p.mic.join(", ")}`)}
      />
      <label
        class="privacy-camera"
        label="󰖠"
        visible={privacy.as((p) => p.camera.length > 0)}
        tooltipText={privacy.as((p) => `Camera: ${p.camera.join(", ")}`)}
      />
    </box>
  );
}
