import type { SlotsType } from "vue";

import { defineComponent, Transition } from "vue";

export default defineComponent<
  { prefixCls: string; open: boolean },
  Record<string, never>,
  string,
  SlotsType<{ default?: () => any }>
>((props, { slots }) => {
  function setHeight(el: Element, height: string) {
    (el as HTMLElement).style.height = height;
    (el as HTMLElement).style.opacity = height === "0px" ? "0" : "1";
  }
  return () => (
    <Transition
      name={`${props.prefixCls}-disclosure`}
      onBeforeEnter={el => setHeight(el, "0px")}
      onEnter={el => setHeight(el, `${el.scrollHeight}px`)}
      onAfterEnter={el => setHeight(el, "auto")}
      onBeforeLeave={el => {
        el.setAttribute("inert", "");
        el.setAttribute("aria-hidden", "true");
        setHeight(el, `${el.scrollHeight}px`);
      }}
      onLeave={el => {
        void (el as HTMLElement).offsetHeight;
        setHeight(el, "0px");
      }}
    >
      {props.open ? (
        <div class={`${props.prefixCls}-disclosure`}>{slots.default?.()}</div>
      ) : null}
    </Transition>
  );
});
