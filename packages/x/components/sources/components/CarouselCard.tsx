import type { PropType } from "vue";

import { LeftOutlined, RightOutlined } from "@antdv-next/icons";
import { Carousel } from "antdv-next";
import { defineComponent, nextTick, ref, watch } from "vue";

import type { SourcesItem, SourcesProps } from "../interface";

export interface CarouselCardProps {
  activeKey?: SourcesProps["activeKey"];
  prefixCls: string;
  items?: SourcesProps["items"];
  classes?: any;
  style?: any;
  onClick?: (item: SourcesItem) => void;
}

const CarouselCard = defineComponent({
  name: "XSourcesCarouselCard",
  props: {
    activeKey: {
      type: [String, Number] as PropType<CarouselCardProps["activeKey"]>,
      default: undefined,
    },
    prefixCls: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<SourcesItem[]>,
      default: undefined,
    },
    classes: {
      type: [String, Array, Object] as PropType<CarouselCardProps["classes"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<CarouselCardProps["style"]>,
      default: undefined,
    },
    onClick: {
      type: Function as PropType<CarouselCardProps["onClick"]>,
      default: undefined,
    },
  },
  setup(props) {
    const compCls = `${props.prefixCls}-carousel`;
    const slide = ref(0);
    const carouselRef = ref<InstanceType<typeof Carousel>>();

    watch(
      [() => props.activeKey, () => props.items],
      () => {
        nextTick(() => {
          if (carouselRef.value) {
            const current = Math.max(
              0,
              props.items?.findIndex(({ key }) => key === props.activeKey) ?? 0,
            );
            slide.value = current;
            (carouselRef.value as any).goTo(current, false);
          }
        });
      },
      { immediate: true },
    );

    const handleClick = (item: SourcesItem) => {
      if (item.url) window.open(item.url, "_blank", "noopener,noreferrer");
      props.onClick?.(item);
    };

    return () => (
      <div style={props.style} class={[`${compCls}-wrapper`, props.classes]}>
        <div class={`${compCls}-title`}>
          <div class={`${compCls}-btn-wrapper`}>
            <span
              class={[
                `${compCls}-btn`,
                `${compCls}-left-btn`,
                { [`${compCls}-btn-disabled`]: slide.value === 0 },
              ]}
              onClick={() => (carouselRef.value as any)?.prev()}
            >
              <LeftOutlined />
            </span>
            <span
              class={[
                `${compCls}-btn`,
                `${compCls}-right-btn`,
                {
                  [`${compCls}-btn-disabled`]:
                    slide.value === (props.items?.length || 1) - 1,
                },
              ]}
              onClick={() => (carouselRef.value as any)?.next()}
            >
              <RightOutlined />
            </span>
          </div>
          <div class={`${compCls}-page`}>
            {`${slide.value + 1}/${props.items?.length || 1}`}
          </div>
        </div>
        <Carousel
          class={compCls}
          ref={carouselRef}
          arrows={false}
          infinite={false}
          dots={false}
          afterChange={(current: number) => {
            slide.value = current;
          }}
          beforeChange={(_: number, nextSlide: number) => {
            slide.value = nextSlide;
          }}
        >
          {props.items?.map((item, index) => (
            <div
              key={item.key ?? index}
              class={`${compCls}-item`}
              onClick={() => handleClick(item)}
            >
              <div class={`${compCls}-item-title-wrapper`}>
                {item.icon && (
                  <span class={`${compCls}-item-icon`}>{item.icon}</span>
                )}
                <span class={`${compCls}-item-title`}>{item.title}</span>
              </div>
              {item.description && (
                <div class={`${compCls}-item-description`}>
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </Carousel>
      </div>
    );
  },
});

export default CarouselCard;
