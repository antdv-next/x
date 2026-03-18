import type { CSSProperties, PropType, VNodeChild } from "vue";

import { Flex, Skeleton, Spin } from "antdv-next";
import { computed, defineComponent } from "vue";

import type { FileCardSpinProps } from "../FileCard";

import ImageIcon from "./ImageIcon";
import usePercent from "./usePercent";

export interface ImageLoadingProps {
  prefixCls?: string;
  style?: CSSProperties;
  class?: string;
  spinProps?: FileCardSpinProps;
}

const ImageLoading = defineComponent({
  name: "FileCardImageLoading",
  props: {
    prefixCls: {
      type: String,
      default: "antdx-file-card",
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: undefined,
    },
    class: {
      type: String,
      default: "",
    },
    spinProps: {
      type: Object as PropType<FileCardSpinProps>,
      default: undefined,
    },
  },
  setup(props) {
    const [mergedPercent, percentText] = usePercent(
      true,
      typeof props.spinProps?.percent === "undefined"
        ? "auto"
        : props.spinProps?.percent,
    );

    const mergedSpinProps = computed<
      Required<Pick<FileCardSpinProps, "size">> & {
        showText: boolean;
        icon: VNodeChild;
      }
    >(() => ({
      size: props.spinProps?.size ?? "medium",
      showText: props.spinProps?.showText ?? true,
      icon: props.spinProps?.icon ?? (
        <ImageIcon
          color="rgba(0,0,0,.45)"
          size={(props.spinProps?.size as any) ?? "middle"}
        />
      ),
    }));

    const spinProps = computed(() => {
      const {
        showText: _showText,
        icon: _icon,
        ...rest
      } = props.spinProps ?? {};
      return rest;
    });

    return () => (
      <div
        class={[`${props.prefixCls}-image-loading`, props.class]}
        style={props.style}
      >
        <Skeleton.Node
          styles={{
            root: {
              width: "100%",
              height: "100%",
            },
            content: {
              width: "100%",
              height: "100%",
            },
          }}
          class={`${props.prefixCls}-image-skeleton`}
          active
        >
          <Flex
            class={[
              `${props.prefixCls}-image-spin`,
              `${props.prefixCls}-image-spin-${mergedSpinProps.value.size}`,
            ]}
            align="center"
            gap="small"
          >
            <Spin percent={mergedPercent.value} {...spinProps.value} />
            {mergedSpinProps.value.showText ? (
              <div class={`${props.prefixCls}-image-spin-text`}>
                {percentText.value}
              </div>
            ) : null}
          </Flex>
          {mergedSpinProps.value.icon}
        </Skeleton.Node>
      </div>
    );
  },
});

export default ImageLoading;
