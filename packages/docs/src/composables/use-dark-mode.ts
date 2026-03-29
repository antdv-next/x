export type DarkMode = "light" | "dark" | "auto";

type ViewTransitionLike = {
  ready: Promise<unknown>;
  finished: Promise<unknown>;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    callback: () => void | Promise<void>,
  ) => ViewTransitionLike;
};

export const useDarkMode = createGlobalState(() => {
  const { system, store } = useColorMode({
    storageKey: "antdv-color-scheme",
    initialValue: "auto" as DarkMode,
    onChanged: () => {},
  });

  function getIsDark(mode: DarkMode) {
    return mode === "auto" ? system.value === "dark" : mode === "dark";
  }

  const isDark = computed(() => getIsDark(store.value as DarkMode));

  function disableTransitions() {
    if (typeof document === "undefined") return;
    if (document.getElementById("disable-transitions")) return;

    const style = document.createElement("style");
    style.id = "disable-transitions";
    style.textContent =
      "*, *::before, *::after { transition: none !important; }";
    document.head.appendChild(style);
  }

  function enableTransitions() {
    if (typeof document === "undefined") return;
    document.getElementById("disable-transitions")?.remove();
  }

  async function executeThemeTransition(
    event: MouseEvent | undefined,
    updateState: () => void | Promise<void>,
  ) {
    if (typeof document === "undefined" || typeof window === "undefined") {
      await updateState();
      return;
    }

    const viewTransitionDocument = document as ViewTransitionDocument;
    const canUseTransition =
      typeof viewTransitionDocument.startViewTransition === "function" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canUseTransition || !event) {
      await updateState();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const startRadius = Math.min(8, endRadius);
    const holdRadius = Math.min(40, endRadius);

    disableTransitions();

    const transition = viewTransitionDocument.startViewTransition!(async () => {
      await updateState();
      await nextTick();
    });

    transition.ready
      .then(() => {
        document.documentElement.animate(
          [
            {
              clipPath: `circle(${startRadius}px at ${x}px ${y}px)`,
              opacity: 0.6,
              offset: 0,
            },
            {
              clipPath: `circle(${holdRadius}px at ${x}px ${y}px)`,
              opacity: 0.82,
              offset: 0.38,
            },
            {
              clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
              opacity: 1,
              offset: 1,
            },
          ],
          {
            duration: 760,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});

    transition.finished
      .catch(() => {})
      .finally(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            enableTransitions();
          });
        });
      });
  }

  function setDarkMode(mode: DarkMode, event?: MouseEvent) {
    if (mode === store.value) return;
    if (getIsDark(mode) === isDark.value) {
      store.value = mode;
      return;
    }

    void executeThemeTransition(event, () => {
      store.value = mode;
    });
  }

  function toggleDark(value?: boolean, event?: MouseEvent) {
    const mode = (value ?? !isDark.value) ? "dark" : "light";
    setDarkMode(mode, event);
  }

  return {
    darkMode: store as Ref<DarkMode>,
    isDark,
    setDarkMode,
    toggleDark,
  };
});
