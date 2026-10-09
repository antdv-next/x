import type { CSSProperties, Ref, SlotsType } from "vue";

import { clsx } from "@v-c/util";
import { computed, defineComponent, Transition } from "vue";

export interface TodoDisclosureProps {
  prefixCls: string;
  open: boolean;
  /** 滚动容器的最大高度，单位 px。 */
  maxHeight: number;
  /** 内容层的 id，供头部的 `aria-controls` 指向。 */
  id?: string;
  class?: string;
  style?: CSSProperties;
  /**
   * 滚动容器元素的下发口。
   *
   * 真正滚动的是这里渲染的内容层（`overflow-y: auto` + `maxHeight`），而它只在展开时
   * 存在，所以由宿主传一个 ref 进来接收，而不是让宿主去猜 DOM 结构。
   */
  contentRef?: Ref<HTMLElement | undefined>;
}

export interface TodoDisclosureSlots {
  default?: () => any;
}

/**
 * 折叠容器：高度 + 透明度一起过渡，展开后同时是滚动容器。
 *
 * 折叠时内容整段卸载——任务列表没有值得跨折叠保留的内部状态，卸载换来更干净的 DOM，
 * 也避免折叠后仍被读屏遍历。
 *
 * 展开后高度交还给内容（`height: auto`），列表增长时不会把内容裁掉。
 */
export default defineComponent<
  TodoDisclosureProps,
  Record<string, never>,
  string,
  SlotsType<TodoDisclosureSlots>
>((props, { slots }) => {
  const contentCls = computed(() => `${props.prefixCls}-content`);
  /**
   * 过渡类名必须与 `style/index.ts` 里生成的选择器逐字对应：Vue 会把它拼成
   * `${motionCls}-enter-active` 这类类名加到内容层上，而样式表是按
   * `${contentCls}-motion-enter-active` 写的，少一段就会静默失效——元素照常挂载卸载，
   * 但 `transition-duration` 恒为 0。
   */
  const motionCls = computed(() => `${contentCls.value}-motion`);

  function setHeight(node: Element, value: string) {
    const element = node as HTMLElement;
    element.style.height = value;
    element.style.opacity = value === "0px" ? "0" : "1";
  }

  /**
   * 过渡的目标高度。
   *
   * 内容层同时受 `max-height` 约束，直接拿 `scrollHeight` 会在内容超长时给出一个永远
   * 到不了的高度——渲染高度早早撞上 `max-height`，剩下的时长里什么都不会动。钳到
   * `maxHeight` 后，动画正好在可见高度走完。
   */
  function targetHeight(element: HTMLElement) {
    return `${Math.min(element.scrollHeight, props.maxHeight)}px`;
  }

  function bindContent(node: unknown) {
    if (props.contentRef) {
      props.contentRef.value = (node as HTMLElement | null) ?? undefined;
    }
  }

  return () => {
    const content = props.open ? (
      <div
        ref={bindContent}
        id={props.id}
        class={clsx(contentCls.value, props.class)}
        style={[props.style, { maxHeight: `${props.maxHeight}px` }]}
      >
        {slots.default?.()}
      </div>
    ) : null;

    return (
      <Transition
        name={motionCls.value}
        onBeforeEnter={el => setHeight(el, "0px")}
        onEnter={el => setHeight(el, targetHeight(el as HTMLElement))}
        onAfterEnter={el => setHeight(el, "auto")}
        onBeforeLeave={el => setHeight(el, targetHeight(el as HTMLElement))}
        onLeave={el => {
          // 先落一次布局，确保浏览器从当前高度开始过渡而不是直接跳到 0。
          void (el as HTMLElement).offsetHeight;
          setHeight(el, "0px");
        }}
        onAfterLeave={el => {
          const element = el as HTMLElement;
          element.style.height = "";
          element.style.opacity = "";
        }}
      >
        {content}
      </Transition>
    );
  };
});
