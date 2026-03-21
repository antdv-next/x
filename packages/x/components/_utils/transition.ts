import type { TransitionProps } from "vue";

export interface CollapseTransitionOptions {
  motionDeadline?: number;
}

const DEFAULT_ROOT_PREFIX_CLS = "ant";
const DEFAULT_MOTION_DEADLINE = 500;

const setCollapsedHeight = (node: HTMLElement) => {
  node.style.height = "0px";
  node.style.opacity = "0";
};

const setRealHeight = (node: HTMLElement) => {
  node.style.height = `${node.scrollHeight}px`;
  node.style.opacity = "1";
};

const setCurrentHeight = (node: HTMLElement) => {
  node.style.height = `${node.offsetHeight}px`;
  node.style.opacity = "1";
};

const clearHeightStyle = (node: HTMLElement) => {
  node.style.height = "";
  node.style.opacity = "";
};

const stopTransition = (
  node: HTMLElement,
  done: (() => void) | undefined,
  timeout: number,
) => {
  if (!done) return;

  let called = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clear = () => {
    if (called) return;
    called = true;
    if (timer) clearTimeout(timer);
    node.removeEventListener("transitionend", onTransitionEnd);
    done();
  };

  const onTransitionEnd = (event: Event) => {
    if (event.target !== node) return;
    if ((event as TransitionEvent).propertyName !== "height") return;
    clear();
  };

  node.addEventListener("transitionend", onTransitionEnd);
  timer = setTimeout(clear, timeout);
};

const initCollapseTransition = (
  rootCls = DEFAULT_ROOT_PREFIX_CLS,
  options: CollapseTransitionOptions = {},
): TransitionProps => {
  const motionName = `${rootCls}-motion-collapse`;
  const motionDeadline = options.motionDeadline ?? DEFAULT_MOTION_DEADLINE;

  return {
    onBeforeEnter(el) {
      const node = el as HTMLElement;
      node.classList.remove(motionName);
      node.classList.add(`${motionName}-legacy`);
      setCollapsedHeight(node);
    },
    onEnter(el, done) {
      const node = el as HTMLElement;
      node.classList.add(`${motionName}-legacy-active`);
      void node.offsetHeight;
      setRealHeight(node);
      stopTransition(node, done, motionDeadline);
    },
    onAfterEnter(el) {
      const node = el as HTMLElement;
      node.classList.remove(`${motionName}-legacy`);
      node.classList.remove(`${motionName}-legacy-active`);
      clearHeightStyle(node);
    },
    onBeforeLeave(el) {
      const node = el as HTMLElement;
      node.classList.remove(`${motionName}-legacy`);
      node.classList.remove(`${motionName}-legacy-active`);
      node.classList.add(motionName);
      setCurrentHeight(node);
    },
    onLeave(el, done) {
      const node = el as HTMLElement;
      void node.offsetHeight;
      setCollapsedHeight(node);
      stopTransition(node, done, motionDeadline);
    },
    onAfterLeave(el) {
      const node = el as HTMLElement;
      node.classList.remove(motionName);
      clearHeightStyle(node);
    },
  };
};

export default initCollapseTransition;
