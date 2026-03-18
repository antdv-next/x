import type {
  ClassValue,
  CSSProperties,
  PropType,
  StyleValue,
  VNodeChild,
} from "vue";

import {
  CloseCircleFilled,
  LeftOutlined,
  RightOutlined,
} from "@antdv-next/icons";
import { useResizeObserver } from "@vueuse/core";
import { Button } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, ref, TransitionGroup, watch } from "vue";

import type {
  FileCardProps,
  SemanticType as CardSemanticType,
} from "./FileCard";

import FileCard from "./FileCard";
import useFileCardStyle from "./style";

export type SemanticType = "root" | "card";

export interface FileCardListProps {
  prefixCls?: string;
  class?: ClassValue;
  classes?: Partial<Record<SemanticType | CardSemanticType, string>>;
  rootClassName?: string;
  style?: StyleValue;
  styles?: Partial<Record<SemanticType | CardSemanticType, CSSProperties>>;
  items: FileCardProps[];
  size?: "small" | "default";
  removable?: boolean | ((item: FileCardProps) => boolean);
  onRemove?: (item: FileCardProps) => void;
  extension?: VNodeChild;
  overflow?: "scrollX" | "scrollY" | "wrap";
}

const List = defineComponent({
  name: "XFileCardList",
  props: {
    prefixCls: {
      type: String,
      default: "antdx-file-card",
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<
        Partial<Record<SemanticType | CardSemanticType, string>>
      >,
      default: () => ({}),
    },
    rootClassName: {
      type: String,
      default: "",
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<
        Partial<Record<SemanticType | CardSemanticType, CSSProperties>>
      >,
      default: () => ({}),
    },
    items: {
      type: Array as PropType<FileCardProps[]>,
      default: () => [],
    },
    size: {
      type: String as PropType<"small" | "default">,
      default: "default",
    },
    removable: {
      type: [Boolean, Function] as PropType<
        boolean | ((item: FileCardProps) => boolean)
      >,
      default: false,
    },
    onRemove: {
      type: Function as PropType<(item: FileCardProps) => void>,
      default: undefined,
    },
    extension: {
      type: [String, Number, Object, Array, Function] as PropType<VNodeChild>,
      default: undefined,
    },
    overflow: {
      type: String as PropType<"scrollX" | "scrollY" | "wrap">,
      default: undefined,
    },
  },
  setup(props, { attrs }) {
    const configCtx = useConfig();
    const [hashId, cssVarCls] = useFileCardStyle(
      computed(() => props.prefixCls),
    );

    const compCls = computed(() => `${props.prefixCls}-list`);

    const list = ref<any[]>([]);

    watch(
      () => props.items,
      items => {
        const nextItems = (items ?? []) as any[];
        const nextList: any[] = [];

        for (let index = 0; index < nextItems.length; index += 1) {
          const typedItem = nextItems[index];
          nextList.push({
            ...typedItem,
            __key: typedItem.key ?? `${typedItem.name}-${index}`,
          } as any);
        }

        list.value = nextList;
      },
      { immediate: true, deep: true },
    );

    const pingStart = ref(false);
    const pingEnd = ref(false);
    const containerRef = ref<HTMLDivElement>();

    const checkPing = () => {
      const node = containerRef.value;
      if (!node) return;

      if (props.overflow === "scrollX") {
        pingStart.value = Math.abs(node.scrollLeft) >= 1;
        pingEnd.value =
          node.scrollWidth - node.clientWidth - Math.abs(node.scrollLeft) >= 1;
        return;
      }

      if (props.overflow === "scrollY") {
        pingStart.value = node.scrollTop !== 0;
        pingEnd.value =
          node.scrollHeight - node.clientHeight !== node.scrollTop;
        return;
      }

      pingStart.value = false;
      pingEnd.value = false;
    };

    useResizeObserver(containerRef, () => {
      checkPing();
    });

    watch(
      () => [props.overflow, list.value.length] as const,
      () => {
        checkPing();
      },
      { immediate: true },
    );

    const onScrollOffset = (offset: -1 | 1) => {
      const node = containerRef.value;
      if (!node) return;

      node.scrollTo({
        left: node.scrollLeft + offset * node.clientWidth,
        behavior: "smooth",
      });
    };

    const handleRemove = (item: FileCardProps, key: string | number) => {
      const nextList: any[] = [];
      for (const current of list.value) {
        if (current.__key !== key) nextList.push(current);
      }
      list.value = nextList;
      props.onRemove?.(item);
      checkPing();
    };

    const splitClasses = computed(() => {
      const classes = props.classes ?? {};
      const { root, card, ...other } = classes;
      return {
        root,
        card,
        other,
      };
    });

    const splitStyles = computed(() => {
      const styles = props.styles ?? {};
      const { root, card, ...other } = styles;
      return {
        root,
        card,
        other,
      };
    });

    return () => (
      <div
        class={[
          compCls.value,
          props.rootClassName,
          splitClasses.value.root,
          hashId.value,
          cssVarCls.value,
          attrs.class,
          props.class,
          {
            [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
          },
        ]}
      >
        <div
          ref={containerRef}
          class={[
            `${compCls.value}-content`,
            {
              [`${compCls.value}-overflow-${props.overflow}`]: !!props.overflow,
              [`${compCls.value}-overflow-ping-start`]: pingStart.value,
              [`${compCls.value}-overflow-ping-end`]: pingEnd.value,
              [`${compCls.value}-small`]: props.size === "small",
            },
          ]}
          dir={configCtx.value.direction}
          style={[props.style, splitStyles.value.root]}
          onScroll={checkPing}
        >
          <TransitionGroup name={`${compCls.value}-motion`}>
            {list.value.map(item => {
              const { __key, ...fileItem } = item;
              return (
                <div key={__key} class={`${compCls.value}-item`}>
                  <FileCard
                    {...fileItem}
                    size={props.size}
                    class={[fileItem.class, splitClasses.value.card]}
                    style={[fileItem.style, splitStyles.value.card]}
                    classes={{
                      ...(splitClasses.value.other as any),
                      ...fileItem.classes,
                    }}
                    styles={{
                      ...(splitStyles.value.other as any),
                      ...fileItem.styles,
                    }}
                  />
                  {(
                    typeof props.removable === "function"
                      ? props.removable(fileItem)
                      : props.removable
                  ) ? (
                    <div
                      class={`${compCls.value}-remove`}
                      onClick={() => handleRemove(fileItem, __key)}
                    >
                      <CloseCircleFilled />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </TransitionGroup>

          {props.overflow === "scrollX" ? (
            <>
              <Button
                size="small"
                shape="circle"
                class={`${compCls.value}-prev-btn`}
                icon={<LeftOutlined />}
                onClick={() => onScrollOffset(-1)}
              />
              <Button
                size="small"
                shape="circle"
                class={`${compCls.value}-next-btn`}
                icon={<RightOutlined />}
                onClick={() => onScrollOffset(1)}
              />
            </>
          ) : null}

          {props.extension}
        </div>
      </div>
    );
  },
});

export default List;
