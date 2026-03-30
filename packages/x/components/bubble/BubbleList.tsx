import type { PropType, Ref, StyleValue } from "vue";

import { computed, defineComponent, ref } from "vue";

import type {
  BubbleItemType,
  BubbleListProps,
  BubbleListRef,
  FuncRoleProps,
  RoleProps,
} from "./interface";

import Bubble from "./Bubble";
import DividerBubble from "./Divider";
import { useCompatibleScroll } from "./hooks/useCompatibleScroll";
import useBubbleStyle from "./style";
import SystemBubble from "./System";

function roleCfgIsFunction(
  roleCfg: RoleProps | FuncRoleProps,
): roleCfg is FuncRoleProps {
  return typeof roleCfg === "function";
}

function pickBubbleRef(instance: any) {
  if (!instance) return null;

  if ("nativeElement" in instance) return instance.nativeElement ?? null;

  return instance as Element;
}

const bubbleSlotNames = [
  "contentRender",
  "loadingRender",
  "avatar",
  "header",
  "footer",
  "extra",
] as const;

type BubbleSlotName = (typeof bubbleSlotNames)[number];

export const XBubbleList = defineComponent({
  name: "XBubbleList",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-bubble",
    },
    styles: {
      type: Object as PropType<BubbleListProps["styles"]>,
      default: () => ({}),
    },
    classes: {
      type: Object as PropType<BubbleListProps["classes"]>,
      default: () => ({}),
    },
    rootClass: {
      type: String,
      default: "",
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    class: {
      type: [String, Array, Object] as PropType<BubbleListProps["class"]>,
      default: undefined,
    },
    items: {
      type: Array as PropType<BubbleItemType[]>,
      required: true,
    },
    autoScroll: {
      type: Boolean,
      default: true,
    },
    role: {
      type: Object as PropType<BubbleListProps["role"]>,
      default: undefined,
    },
    onScroll: {
      type: Function as PropType<BubbleListProps["onScroll"]>,
      default: undefined,
    },
  },
  setup(props, { expose, attrs, slots }) {
    const rootRef = ref<HTMLDivElement>();
    const scrollBoxRef = ref<HTMLDivElement>();
    const scrollContentRef = ref<HTMLDivElement>();
    const bubbleRefs = new Map<string | number, HTMLElement>();
    const [hashId, cssVarCls] = useBubbleStyle(computed(() => props.prefixCls));
    const { scrollTo: compatibleScrollTo } = useCompatibleScroll(
      scrollBoxRef as Ref<HTMLElement | undefined>,
      scrollContentRef as Ref<HTMLElement | undefined>,
    );

    const listPrefixCls = computed(() => `${props.prefixCls}-list`);

    const handleScroll = (event: Event) => {
      props.onScroll?.(event);
    };

    const mergedItems = computed(() => {
      return props.items.map(item => {
        if (item.role && props.role) {
          const cfg = props.role[item.role];
          if (cfg)
            return { ...(roleCfgIsFunction(cfg) ? cfg(item) : cfg), ...item };
        }
        return item;
      });
    });

    const bubbleClassNames = computed(() => {
      const {
        root: _root,
        scroll: _scroll,
        bubble,
        system,
        divider,
        ...rest
      } = props.classes || {};

      return {
        bubble,
        system,
        divider,
        rest,
      };
    });

    const bubbleStyles = computed(() => {
      const {
        root: _root,
        scroll: _scroll,
        bubble,
        system,
        divider,
        ...rest
      } = props.styles || {};

      return {
        bubble,
        system,
        divider,
        rest,
      };
    });

    const setBubbleRef = (key: string | number) => (instance: any) => {
      const element = pickBubbleRef(instance);
      if (element) bubbleRefs.set(key, element as HTMLElement);
      else bubbleRefs.delete(key);
    };

    const scrollTo: BubbleListRef["scrollTo"] = ({
      key,
      top,
      behavior = "smooth",
      block,
    }) => {
      const scrollBox = scrollBoxRef.value;
      if (!scrollBox) return;

      const { scrollHeight, clientHeight } = scrollBox;

      if (typeof top === "number") {
        compatibleScrollTo({
          top: props.autoScroll ? -scrollHeight + clientHeight + top : top,
          behavior,
        });
        return;
      }

      if (top === "bottom") {
        compatibleScrollTo({
          top: props.autoScroll ? 0 : scrollHeight,
          behavior,
        });
        return;
      }

      if (top === "top") {
        compatibleScrollTo({
          top: props.autoScroll ? -scrollHeight : 0,
          behavior,
        });
        return;
      }

      if (key !== undefined) {
        const target = bubbleRefs.get(key);
        if (!target) return;
        compatibleScrollTo({
          intoView: { behavior, block: block ?? "nearest" },
          intoViewDom: target,
        });
      }
    };

    expose<BubbleListRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
      get scrollBoxNativeElement() {
        return scrollBoxRef.value as HTMLDivElement;
      },
      scrollTo,
    });

    return () => (
      <div
        ref={rootRef}
        {...attrs}
        class={[
          listPrefixCls.value,
          props.rootClass,
          props.classes?.root,
          hashId.value,
          cssVarCls.value,
          props.class,
          attrs.class,
        ]}
        style={[props.styles?.root, props.style, attrs.style as StyleValue]}
      >
        <div
          ref={scrollBoxRef}
          class={[
            `${listPrefixCls.value}-scroll-box`,
            props.classes?.scroll,
            { [`${listPrefixCls.value}-autoscroll`]: props.autoScroll },
          ]}
          style={props.styles?.scroll}
          onScroll={handleScroll}
        >
          <div
            ref={scrollContentRef}
            class={`${listPrefixCls.value}-scroll-content`}
          >
            {mergedItems.value.map((item, index) => {
              const {
                key,
                role,
                status,
                extraInfo,
                contentRender,
                loadingRender,
                styles,
                classes,
                rootClass,
                class: itemClass,
                style: itemStyle,
                ...rest
              } = item;

              const roleRootClassName =
                role === "divider"
                  ? bubbleClassNames.value.divider
                  : role === "system"
                    ? bubbleClassNames.value.system
                    : bubbleClassNames.value.bubble;

              const roleRootStyle =
                role === "divider"
                  ? bubbleStyles.value.divider
                  : role === "system"
                    ? bubbleStyles.value.system
                    : bubbleStyles.value.bubble;

              const mergedClassNames = {
                ...bubbleClassNames.value.rest,
                ...classes,
              };

              const mergedStyles = {
                ...bubbleStyles.value.rest,
                ...styles,
              };

              const info = { key, status, extraInfo };
              const hasListContentRenderSlot = Boolean(slots.contentRender);
              const hasListLoadingRenderSlot = Boolean(slots.loadingRender);

              const commonProps = {
                key,
                ref: setBubbleRef(key),
                prefixCls: props.prefixCls,
                content: (item as Record<string, any>).content,
                rootClass: rootClass || roleRootClassName,
                style: itemStyle || roleRootStyle,
                class: itemClass,
                classes: mergedClassNames,
                styles: mergedStyles,
                ...(hasListContentRenderSlot && contentRender
                  ? { contentRender }
                  : {}),
                ...(hasListLoadingRenderSlot && loadingRender
                  ? { loadingRender }
                  : {}),
                ...(rest as object),
              };

              if (role === "divider") return <DividerBubble {...commonProps} />;

              if (role === "system") return <SystemBubble {...commonProps} />;

              const bubbleSlots: Record<string, any> = {};
              const bindListSlot = (name: BubbleSlotName) => {
                const slot = slots[name];
                if (!slot) return undefined;

                return ({ content, info: bubbleInfo }: any) =>
                  slot({
                    content,
                    info: bubbleInfo,
                    item,
                    index,
                    role,
                  });
              };

              if (slots.contentRender) {
                bubbleSlots.contentRender = bindListSlot("contentRender");
              } else if (contentRender) {
                bubbleSlots.contentRender = ({
                  content,
                  info: bubbleInfo,
                }: any) => contentRender(content, bubbleInfo);
              }

              if (slots.loadingRender) {
                bubbleSlots.loadingRender = bindListSlot("loadingRender");
              } else if (loadingRender) {
                bubbleSlots.loadingRender = ({
                  content,
                  info: bubbleInfo,
                }: any) => loadingRender(content, bubbleInfo);
              }

              for (const name of bubbleSlotNames) {
                if (name === "contentRender" || name === "loadingRender")
                  continue;
                const slot = bindListSlot(name);
                if (slot) bubbleSlots[name] = slot;
              }

              return (
                <Bubble {...commonProps} info={info} v-slots={bubbleSlots} />
              );
            })}
          </div>
        </div>
      </div>
    );
  },
});

export default XBubbleList;
