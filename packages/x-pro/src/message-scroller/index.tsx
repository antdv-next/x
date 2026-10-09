import type { App, CSSProperties, SlotsType } from "vue";

import { clsx } from "@v-c/util";
import { useBaseConfig } from "antdv-next/config-provider/context";
import useCSSVarCls from "antdv-next/config-provider/hooks/useCSSVarCls";
import { useLocaleContext } from "antdv-next/locale/index";
import { computed, defineComponent, ref, shallowRef, Transition } from "vue";

import type { MessageScrollerLocale, XProLocale } from "../locale/types";
import type { MessageScrollerRailEntry } from "./hooks/useMessageScrollerRail";
import type {
  MessageScrollerClassNamesType,
  MessageScrollerEmits,
  MessageScrollerItem,
  MessageScrollerProps,
  MessageScrollerRef,
  MessageScrollerSemanticClassNames,
  MessageScrollerSemanticStyles,
  MessageScrollerSlots,
  MessageScrollerStylesType,
} from "./types";

import {
  omitClassAndStyle,
  resolveAttrClass,
  resolveAttrStyle,
} from "../_util/attrs";
import { useMergeSemantic } from "../_util/semantic";
import { useXProComponentConfig } from "../config-provider";
import enUSLocale from "../locale/en_US";
import { useMessageScrollerFollow } from "./hooks/useMessageScrollerFollow";
import { useMessageScrollerRail } from "./hooks/useMessageScrollerRail";
import useStyle from "./style";
import { resolveRailScaleVar } from "./style/token";
import {
  DEFAULT_FOLLOW_THRESHOLD,
  DEFAULT_ITEM_SELECTOR,
  DEFAULT_SMOOTH,
  formatMessageScrollerTemplate,
  resolveRailScale,
} from "./utils";

export type MessageScrollerSemanticName =
  keyof MessageScrollerSemanticClassNames & keyof MessageScrollerSemanticStyles;

/**
 * Vue 的 `EmitsOptions` 需要隐式索引签名，接口不会提供，因此这里用映射类型桥接。
 */
type MessageScrollerEmitOptions = {
  [K in keyof MessageScrollerEmits]: MessageScrollerEmits[K];
};

/**
 * 刻度缩放通过 CSS 变量下发，自定义插槽内容也能复用同一比例。
 */
function createRailScaleStyle(prefixCls: string, scale: number) {
  return { [resolveRailScaleVar(prefixCls)]: String(scale) } as CSSProperties;
}

const MessageScroller = defineComponent<
  MessageScrollerProps,
  MessageScrollerEmitOptions,
  string,
  SlotsType<MessageScrollerSlots>
>(
  (props, { attrs, emit, expose, slots }) => {
    const { prefixCls, direction } = useBaseConfig("message-scroller", props);
    const xProConfig = useXProComponentConfig("messageScroller");
    const localeContext = useLocaleContext();
    const rootRef = shallowRef<HTMLElement>();
    const viewportRef = shallowRef<HTMLElement>();
    const contentRef = shallowRef<HTMLElement>();
    const railRef = shallowRef<HTMLElement>();
    const rootCls = useCSSVarCls(prefixCls);
    const [hashId, cssVarCls] = useStyle(prefixCls, rootCls);

    const localeText = computed<MessageScrollerLocale>(() => ({
      ...enUSLocale.MessageScroller,
      ...(localeContext.locale.value as XProLocale | undefined)
        ?.MessageScroller,
    }));

    const mergedFollowThreshold = computed(() => {
      return (
        props.followThreshold ??
        xProConfig.value.followThreshold ??
        DEFAULT_FOLLOW_THRESHOLD
      );
    });
    const mergedSmooth = computed(
      () => props.smooth ?? xProConfig.value.smooth ?? DEFAULT_SMOOTH,
    );
    const mergedNavigation = computed(
      () => props.navigation ?? xProConfig.value.navigation,
    );
    const mergedItemSelector = computed(
      () =>
        props.itemSelector ??
        xProConfig.value.itemSelector ??
        DEFAULT_ITEM_SELECTOR,
    );
    const mergedBackToBottom = computed(
      () => props.backToBottom ?? xProConfig.value.backToBottom ?? false,
    );
    const mergedItems = computed<MessageScrollerItem[]>(
      () => props.items ?? [],
    );
    const railEnabled = computed(() => mergedNavigation.value === "rail");

    const innerFollowing = ref(true);
    const following = computed(() => props.follow ?? innerFollowing.value);

    /**
     * 跟随状态是受控 / 非受控共用的唯一入口：状态变化同时对外广播 `update:follow` 与 `followChange`。
     */
    function updateFollowing(next: boolean) {
      if (following.value === next) {
        return;
      }

      innerFollowing.value = next;
      emit("update:follow", next);
      emit("followChange", next);
    }

    const follow = useMessageScrollerFollow({
      viewport: viewportRef,
      content: contentRef,
      itemSelector: mergedItemSelector,
      threshold: mergedFollowThreshold,
      smooth: mergedSmooth,
      following,
      setFollowing: updateFollowing,
    });

    const rail = useMessageScrollerRail({
      rail: railRef,
      viewport: viewportRef,
      content: contentRef,
      enabled: railEnabled,
      items: mergedItems,
      itemSelector: mergedItemSelector,
      threshold: mergedFollowThreshold,
    });

    function handleScroll(event: Event) {
      follow.handleScroll();
      rail.updateActive();
      emit("scroll", event);
    }

    function scrollToLatest() {
      follow.scrollToEnd();
      updateFollowing(true);
    }

    function handleRailItemClick(entry: MessageScrollerRailEntry) {
      rail.handleItemClick(entry.id);
      emit("railItemSelect", entry.item.id, entry.item);

      if (entry.index === rail.entries.value.length - 1) {
        scrollToLatest();
        return;
      }

      updateFollowing(false);
      follow.scrollToElement(entry.element);
    }

    const mergedSemanticProps = computed<MessageScrollerProps>(() => ({
      ...props,
      followThreshold: mergedFollowThreshold.value,
      smooth: mergedSmooth.value,
      navigation: mergedNavigation.value,
      itemSelector: mergedItemSelector.value,
      backToBottom: mergedBackToBottom.value,
    }));

    const [mergedClassNames, mergedStyles] = useMergeSemantic<
      MessageScrollerSemanticClassNames,
      MessageScrollerSemanticStyles,
      MessageScrollerProps
    >(
      computed(() => [
        xProConfig.value.classes as MessageScrollerClassNamesType | undefined,
        props.classes,
      ]),
      computed(() => [
        xProConfig.value.styles as MessageScrollerStylesType | undefined,
        props.styles,
      ]),
      computed(() => ({ props: mergedSemanticProps.value })),
    );

    const mergedClassName = computed(() =>
      clsx(
        prefixCls.value,
        hashId.value,
        cssVarCls.value,
        rootCls.value,
        {
          [`${prefixCls.value}-rtl`]: direction.value === "rtl",
          [`${prefixCls.value}-rail-enabled`]: railEnabled.value,
          [`${prefixCls.value}-rail-visible`]: rail.visible.value,
        },
        xProConfig.value.class,
        props.rootClass,
        mergedClassNames.value.root,
        resolveAttrClass((attrs as Record<string, unknown>).class),
      ),
    );

    const mergedStyle = computed(() => [
      mergedStyles.value.root,
      xProConfig.value.style,
      resolveAttrStyle((attrs as Record<string, unknown>).style),
    ]);

    const previewEntry = computed(() => {
      const index = rail.cardIndex.value;
      return index >= 0 ? rail.entries.value[index] : undefined;
    });

    /**
     * 单例卡片在导轨内的偏移：行中心减去导轨整体高度的一半。
     *
     * 预览层用 flex 居中承载轨道，所以这里只补行偏移，不再叠加 `-50%`。
     */
    const previewTransform = computed(() => {
      const index = rail.cardIndex.value;
      const count = rail.entries.value.length;
      const height = rail.itemHeight.value;
      if (index < 0 || !count) {
        return "translateY(0)";
      }

      const offset = (index + 0.5) * height - (count * height) / 2;
      return `translateY(${offset}px)`;
    });

    const api: MessageScrollerRef = {
      get nativeElement() {
        return rootRef.value ?? null;
      },
      get viewportElement() {
        return viewportRef.value ?? null;
      },
      get contentElement() {
        return contentRef.value ?? null;
      },
      get following() {
        return following.value;
      },
      scrollToEnd: options => follow.scrollToEnd(options),
      scrollToItem: (target, options) => follow.scrollToItem(target, options),
      setFollowing: next => {
        updateFollowing(next);
        if (next) {
          follow.scrollToEnd();
        }
      },
    };

    expose(api);

    return () => (
      <div
        ref={rootRef}
        class={mergedClassName.value}
        style={mergedStyle.value}
        {...omitClassAndStyle(attrs as Record<string, unknown>)}
      >
        <section
          ref={viewportRef}
          class={clsx(
            `${prefixCls.value}-viewport`,
            mergedClassNames.value.viewport,
          )}
          style={mergedStyles.value.viewport}
          tabindex={0}
          aria-label={localeText.value.viewportLabel}
          onScroll={handleScroll}
          onWheel={follow.handleWheel}
          onTouchstart={follow.handleTouchStart}
          onKeydown={follow.handleKeyDown}
        >
          <div
            ref={contentRef}
            class={clsx(
              `${prefixCls.value}-content`,
              mergedClassNames.value.content,
            )}
            style={mergedStyles.value.content}
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-busy={props.busy ? "true" : undefined}
          >
            {slots.default?.()}
          </div>
        </section>

        {railEnabled.value && rail.visible.value && (
          <nav
            ref={railRef}
            class={clsx(`${prefixCls.value}-rail`, mergedClassNames.value.rail)}
            style={mergedStyles.value.rail}
            aria-label={localeText.value.navigationLabel}
            onPointerleave={rail.handlePointerLeave}
            onBlur={rail.handleBlur}
          >
            {rail.entries.value.map((entry, index) => {
              const active = entry.id === rail.activeId.value;
              const highlighted = entry.id === rail.highlightedId.value;
              const distance =
                rail.highlightedIndex.value < 0
                  ? Number.POSITIVE_INFINITY
                  : Math.abs(index - rail.highlightedIndex.value);
              const scale = resolveRailScale(distance);

              return (
                <button
                  key={entry.id}
                  type="button"
                  class={clsx(
                    `${prefixCls.value}-rail-item`,
                    mergedClassNames.value.railItem,
                  )}
                  style={[
                    mergedStyles.value.railItem,
                    createRailScaleStyle(prefixCls.value, scale),
                    { height: `${rail.itemHeight.value}px` },
                  ]}
                  data-active={active ? "" : undefined}
                  data-highlighted={highlighted ? "" : undefined}
                  aria-current={active ? "location" : undefined}
                  aria-label={formatMessageScrollerTemplate(
                    localeText.value.railItemLabel,
                    {
                      index: index + 1,
                      total: rail.entries.value.length,
                    },
                  )}
                  onPointerenter={(event: PointerEvent) =>
                    rail.handleItemPointerEnter(entry.id, event)
                  }
                  onPointerdown={(event: PointerEvent) =>
                    rail.handleItemPointerDown(entry.id, event)
                  }
                  onFocus={(event: FocusEvent) =>
                    rail.handleItemFocus(entry.id, event)
                  }
                  onClick={() => handleRailItemClick(entry)}
                >
                  {slots.railItem?.({
                    item: entry.item,
                    active,
                    index,
                    scale,
                  }) ?? (
                    <span
                      class={clsx(
                        `${prefixCls.value}-rail-tick`,
                        mergedClassNames.value.railTick,
                      )}
                      style={mergedStyles.value.railTick}
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {railEnabled.value && rail.visible.value && (
          <div class={`${prefixCls.value}-preview-layer`} aria-hidden="true">
            <div
              class={`${prefixCls.value}-preview-track`}
              style={{ transform: previewTransform.value }}
            >
              <Transition name={`${prefixCls.value}-preview-motion`}>
                {previewEntry.value ? (
                  <div
                    key={previewEntry.value.id}
                    class={clsx(
                      `${prefixCls.value}-preview`,
                      mergedClassNames.value.preview,
                    )}
                    style={mergedStyles.value.preview}
                  >
                    {slots.preview?.({
                      item: previewEntry.value.item,
                      index: previewEntry.value.index,
                    }) ?? (
                      <>
                        <div class={`${prefixCls.value}-preview-title`}>
                          {previewEntry.value.item.title}
                        </div>
                        {previewEntry.value.item.description ? (
                          <div class={`${prefixCls.value}-preview-description`}>
                            {previewEntry.value.item.description}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                ) : null}
              </Transition>
            </div>
          </div>
        )}

        <Transition name={`${prefixCls.value}-back-to-bottom-motion`}>
          {mergedBackToBottom.value && !following.value ? (
            <div
              class={clsx(
                `${prefixCls.value}-back-to-bottom`,
                mergedClassNames.value.backToBottom,
              )}
              style={mergedStyles.value.backToBottom}
            >
              {slots.backToBottom?.({
                scrollToEnd: scrollToLatest,
                following: following.value,
              }) ?? (
                <button
                  type="button"
                  class={`${prefixCls.value}-back-to-bottom-button`}
                  onClick={scrollToLatest}
                >
                  <span
                    class={`${prefixCls.value}-back-to-bottom-icon`}
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 1024 1024"
                      width="1em"
                      height="1em"
                      fill="currentColor"
                    >
                      <path d="M512 710.6 148.6 347.2l60.4-60.4L512 589.8l303-303 60.4 60.4z" />
                    </svg>
                  </span>
                  <span>{localeText.value.backToLatest}</span>
                </button>
              )}
            </div>
          ) : null}
        </Transition>
      </div>
    );
  },
  {
    name: "AMessageScroller",
    inheritAttrs: false,
  },
);

(
  MessageScroller as typeof MessageScroller & { install?: (app: App) => void }
).install = (app: App) => {
  app.component(MessageScroller.name ?? "AMessageScroller", MessageScroller);
};

export type {
  MessageScrollerClassNamesType,
  MessageScrollerEmits,
  MessageScrollerItem,
  MessageScrollerNavigation,
  MessageScrollerProps,
  MessageScrollerRef,
  MessageScrollerSemanticClassNames,
  MessageScrollerSemanticStyles,
  MessageScrollerSlots,
  MessageScrollerStylesType,
} from "./types";
export default MessageScroller;
export { MessageScroller };
