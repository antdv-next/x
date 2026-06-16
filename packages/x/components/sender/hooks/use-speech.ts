import { computed, onBeforeUnmount, onMounted, ref } from "vue";

import warning from "../../_utils/warning";

export type ControlledSpeechConfig = {
  recording?: boolean;
  onRecordingChange: (recording: boolean) => void;
};

export type AllowSpeech = boolean | ControlledSpeechConfig;

export default function useSpeech(
  onSpeech: (transcript: string) => void,
  allowSpeech?: () => AllowSpeech | undefined,
) {
  const permissionState = ref<PermissionState | null>(null);
  const recording = ref(false);
  let recognition: any = null;
  let forceBreak = false;

  // Controlled mode
  const speechConfig = computed(() => {
    const val = allowSpeech?.();
    if (typeof val === "object") return val;
    return null;
  });

  const isControlled = computed(
    () => typeof speechConfig.value?.recording === "boolean",
  );

  // Permission check
  let permissionStatus: PermissionStatus | null = null;

  onMounted(() => {
    if (!isControlled.value && "permissions" in navigator) {
      (navigator as any).permissions
        .query({ name: "microphone" })
        .then((status: PermissionStatus) => {
          permissionState.value = status.state;
          status.onchange = function () {
            permissionState.value = this.state;
          };
          permissionStatus = status;
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error ? error.message : String(error);
          warning(
            false,
            "Sender",
            `Browser does not support querying microphone permission. ${message}`,
          );
        });
    }
  });

  onBeforeUnmount(() => {
    if (permissionStatus) {
      permissionStatus.onchange = null;
    }
  });

  // SpeechRecognition API
  const getSpeechRecognition = () => {
    if (typeof window === "undefined") return null;
    return (
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      null
    );
  };

  const mergedAllowSpeech = computed(
    () =>
      !!(
        isControlled.value ||
        (getSpeechRecognition() && permissionState.value !== "denied")
      ),
  );
  const mergedRecording = computed(() =>
    isControlled.value ? !!speechConfig.value?.recording : recording.value,
  );

  const ensureRecognition = () => {
    if (!mergedAllowSpeech.value || recognition) return;

    const SpeechRecognitionCtor = getSpeechRecognition();
    if (!SpeechRecognitionCtor) return;

    recognition = new SpeechRecognitionCtor();
    recognition.onstart = () => {
      recording.value = true;
    };
    recognition.onend = () => {
      recording.value = false;
    };
    recognition.onresult = (event: any) => {
      if (!forceBreak) {
        const transcript = event.results?.[0]?.[0]?.transcript;
        onSpeech(transcript);
      }
      forceBreak = false;
    };
  };

  const triggerSpeech = (doForceBreak: boolean) => {
    const currentRecording = mergedRecording.value;
    if (doForceBreak && !currentRecording) return;

    forceBreak = doForceBreak;

    const config = speechConfig.value;
    if (typeof config?.recording === "boolean") {
      config.onRecordingChange(!config.recording);
      return;
    }

    ensureRecognition();
    if (!recognition) return;

    if (currentRecording) {
      recognition.stop();
      speechConfig.value?.onRecordingChange?.(false);
    } else {
      recognition.start();
      speechConfig.value?.onRecordingChange?.(true);
    }
  };

  return [mergedAllowSpeech, triggerSpeech, mergedRecording] as const;
}
