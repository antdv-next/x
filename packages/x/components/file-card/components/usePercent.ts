import { computed, onBeforeUnmount, ref, watch } from "vue";

const AUTO_INTERVAL = 200;
const STEP_BUCKETS: [limit: number, stepPtg: number][] = [
  [30, 0.05],
  [70, 0.03],
  [96, 0.01],
];

export default function usePercent(
  spinning: boolean,
  percent?: number | "auto",
) {
  const mockPercent = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  watch(
    () => [spinning, percent] as const,
    () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }

      if (percent === "auto" && spinning) {
        mockPercent.value = 0;
        timer = setInterval(() => {
          const restPercent = 100 - mockPercent.value;

          for (const [limit, stepPtg] of STEP_BUCKETS) {
            if (mockPercent.value <= limit) {
              mockPercent.value += restPercent * stepPtg;
              break;
            }
          }
        }, AUTO_INTERVAL);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
  });

  const mergedPercent = computed(() =>
    percent === "auto" ? mockPercent.value : percent,
  );
  const percentText = computed(() =>
    percent === "auto"
      ? `${mockPercent.value.toFixed(0)}%`
      : `${percent ?? 0}%`,
  );

  return [mergedPercent, percentText] as const;
}
