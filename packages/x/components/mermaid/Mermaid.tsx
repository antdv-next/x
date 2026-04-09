import type { MermaidConfig } from "mermaid";
import type {
  CSSProperties,
  PropType,
  StyleValue,
  VNodeChild,
  HTMLAttributes,
} from "vue";

import {
  DownloadOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@antdv-next/icons";
import { Button, Segmented, Tooltip } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  ref,
  useAttrs,
  watch,
} from "vue";

import type { ItemType } from "../actions";
import type { CodeHighlighterProps } from "../code-highlighter";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { isEmptyNode } from "../_utils/vue";
import warning from "../_utils/warning";
import Actions from "../actions";
import CodeHighlighter from "../code-highlighter";
import enUS from "../locale/en_US";
import useLocale from "../locale/useLocale";
import { initializeMermaid, parseMermaid, renderMermaid } from "./loader";
import useMermaidStyle from "./style";

export type MermaidSemanticType = "root" | "header" | "graph" | "code";

export type MermaidRenderType = "image" | "code";

export interface MermaidActions {
  enableZoom?: boolean;
  enableDownload?: boolean;
  enableCopy?: boolean;
  customActions?: ItemType[];
}

export interface MermaidProps extends Omit<
  HTMLAttributes,
  "content" | "class" | "style"
> {
  content: string;
  prefixCls?: string;
  rootClass?: string;
  class?: any;
  style?: StyleValue;
  classes?: Partial<Record<MermaidSemanticType, string>>;
  styles?: Partial<Record<MermaidSemanticType, CSSProperties>>;
  header?: VNodeChild | null;
  renderType?: MermaidRenderType;
  defaultRenderType?: MermaidRenderType;
  config?: MermaidConfig;
  actions?: MermaidActions;
  codeHighlighterProps?: Partial<
    Omit<CodeHighlighterProps, "content" | "language">
  >;
}

export interface MermaidRef {
  nativeElement: HTMLDivElement;
}

export interface MermaidCustomActionSlotInfo {
  item: ItemType;
  index: number;
  originNode: VNodeChild;
}

enum RenderType {
  Code = "code",
  Image = "image",
}

let idSeed = 0;
function throttle<T extends (...args: never[]) => void>(fn: T, wait: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastTime = 0;
  let pendingArgs: never[] | null = null;

  const run = (args: never[]) => {
    lastTime = Date.now();
    fn(...args);
  };

  const throttled = ((...args: never[]) => {
    pendingArgs = args;
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || lastTime === 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      const execArgs = pendingArgs;
      pendingArgs = null;
      if (execArgs) {
        run(execArgs);
      }
      return;
    }

    if (timer === null) {
      timer = setTimeout(() => {
        timer = null;
        const execArgs = pendingArgs;
        pendingArgs = null;
        if (execArgs) {
          run(execArgs);
        }
      }, remaining);
    }
  }) as T & { cancel: () => void };

  throttled.cancel = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
    pendingArgs = null;
  };

  return throttled;
}

const XMermaid = defineComponent({
  name: "AxMermaid",
  inheritAttrs: false,
  props: {
    content: {
      type: String,
      required: true,
    },
    prefixCls: {
      type: String,
      default: "antd-mermaid",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Object, Array] as PropType<MermaidProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<Partial<Record<MermaidSemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<
        Partial<Record<MermaidSemanticType, CSSProperties>>
      >,
      default: () => ({}),
    },
    header: {
      type: [String, Number, Object, Array] as PropType<MermaidProps["header"]>,
      default: undefined,
    },
    renderType: {
      type: String as PropType<MermaidRenderType>,
      default: undefined,
    },
    defaultRenderType: {
      type: String as PropType<MermaidRenderType>,
      default: RenderType.Image,
    },
    config: {
      type: Object as PropType<MermaidConfig>,
      default: undefined,
    },
    actions: {
      type: Object as PropType<MermaidActions>,
      default: () => ({}),
    },
    codeHighlighterProps: {
      type: Object as PropType<MermaidProps["codeHighlighterProps"]>,
      default: undefined,
    },
  },
  emits: ["update:renderType", "renderTypeChange"],
  setup(props, { emit, expose, slots }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const [contextLocale] = useLocale("Mermaid", enUS.Mermaid);
    const contextConfig = useXComponentConfig("mermaid");
    const rootRef = ref<HTMLDivElement>();
    const graphRef = ref<HTMLDivElement>();
    const renderBaseId = `mermaid-${idSeed++}`;

    const [hashId, cssVarCls] = useMermaidStyle(
      computed(() => props.prefixCls),
    );

    const internalRenderType = ref<MermaidRenderType>(props.defaultRenderType);
    const scale = ref(1);
    const position = ref({ x: 0, y: 0 });
    const isDragging = ref(false);
    const lastMousePos = ref({ x: 0, y: 0 });

    const mergedRenderType = computed(() => {
      return props.renderType ?? internalRenderType.value;
    });

    const mergedActions = computed<Required<MermaidActions>>(() => {
      return {
        enableZoom: props.actions?.enableZoom ?? true,
        enableDownload: props.actions?.enableDownload ?? true,
        enableCopy: props.actions?.enableCopy ?? true,
        customActions: props.actions?.customActions ?? [],
      };
    });

    const mergedClasses = computed(
      () =>
        ({
          ...contextConfig.value.classes,
          ...props.classes,
        }) as Partial<Record<MermaidSemanticType, string>>,
    );

    const mergedStyles = computed(
      () =>
        ({
          ...contextConfig.value.styles,
          ...props.styles,
        }) as Partial<Record<MermaidSemanticType, CSSProperties>>,
    );

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const getNamedSlot = (
      name: "customActionIconRender" | "customActionRender",
    ) =>
      slots[name] ?? slots[name.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`)];

    const resolvedCustomActions = computed<ItemType[]>(() =>
      mergedActions.value.customActions.map((item, index) => {
        const iconSlotInfo: MermaidCustomActionSlotInfo = {
          item,
          index,
          originNode: item.icon,
        };
        const iconFromSlot = getNamedSlot("customActionIconRender")?.(
          iconSlotInfo,
        );
        const actionOriginNode =
          item.actionRender !== undefined
            ? typeof item.actionRender === "function"
              ? item.actionRender(item)
              : item.actionRender
            : undefined;
        const actionSlotInfo: MermaidCustomActionSlotInfo = {
          item,
          index,
          originNode: actionOriginNode,
        };
        const actionFromSlot =
          getNamedSlot("customActionRender")?.(actionSlotInfo);

        return {
          ...item,
          icon:
            iconFromSlot !== undefined && !isEmptyNode(iconFromSlot)
              ? iconFromSlot
              : item.icon,
          actionRender:
            actionFromSlot !== undefined && !isEmptyNode(actionFromSlot)
              ? actionFromSlot
              : item.actionRender,
        };
      }),
    );

    function applySvgTransform() {
      if (mergedRenderType.value !== RenderType.Image) return;

      const svgEl = graphRef.value?.querySelector("svg") as SVGElement | null;
      if (!svgEl) return;

      svgEl.style.transform = `scale(${scale.value}) translate(${position.value.x}px, ${position.value.y}px)`;
      svgEl.style.transformOrigin = "center";
      svgEl.style.transition = isDragging.value
        ? "none"
        : "transform 0.1s ease-out";
      svgEl.style.cursor = isDragging.value ? "grabbing" : "grab";
    }

    const renderDiagram = throttle(async () => {
      if (mergedRenderType.value === RenderType.Code) {
        if (graphRef.value) graphRef.value.innerHTML = "";
        return;
      }

      if (!props.content?.trim()) return;

      const graphEl = graphRef.value;
      if (!graphEl) return;

      try {
        const parseResult = await parseMermaid(props.content, {
          suppressErrors: true,
        } as any);

        if (parseResult === false) {
          throw new Error("Invalid Mermaid syntax");
        }

        const { svg } = await renderMermaid(
          `${renderBaseId}-${idSeed++}-${props.content.length || 0}`,
          props.content,
        );

        graphEl.innerHTML = svg;
        applySvgTransform();
      } catch (error) {
        warning(false, "Mermaid", `Render failed: ${String(error)}`);
      }
    }, 100);

    function switchRenderType(nextType: MermaidRenderType) {
      if (props.renderType === undefined) {
        internalRenderType.value = nextType;
      }
      emit("update:renderType", nextType);
      emit("renderTypeChange", nextType);
    }

    function handleMouseDown(event: MouseEvent) {
      if (mergedRenderType.value !== RenderType.Image) return;

      event.preventDefault();
      isDragging.value = true;
      lastMousePos.value = {
        x: event.clientX,
        y: event.clientY,
      };
    }

    function handleMouseMove(event: MouseEvent) {
      if (!isDragging.value) return;
      if (mergedRenderType.value !== RenderType.Image) return;

      event.preventDefault();
      const deltaX = event.clientX - lastMousePos.value.x;
      const deltaY = event.clientY - lastMousePos.value.y;

      position.value = {
        x: position.value.x + deltaX / scale.value,
        y: position.value.y + deltaY / scale.value,
      };

      lastMousePos.value = {
        x: event.clientX,
        y: event.clientY,
      };
    }

    function handleMouseUp() {
      isDragging.value = false;
    }

    function handleZoomIn() {
      scale.value = Math.min(scale.value + 0.2, 3);
    }

    function handleZoomOut() {
      scale.value = Math.max(scale.value - 0.2, 0.5);
    }

    function handleReset() {
      scale.value = 1;
      position.value = { x: 0, y: 0 };
    }

    function handleDownload() {
      const svgElement = graphRef.value?.querySelector(
        "svg",
      ) as SVGSVGElement | null;
      if (!svgElement) return;

      const svgString = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height } = svgElement.getBoundingClientRect();
      const dpr = globalThis.window?.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const link = document.createElement("a");
        link.download = `${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
      };
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    }

    const defaultHeaderActions = computed<ItemType[]>(() => {
      const items: ItemType[] = [];

      if (mergedRenderType.value === RenderType.Image) {
        if (mergedActions.value.enableZoom) {
          items.push(
            {
              key: "zoomIn",
              icon: <ZoomInOutlined />,
              label: contextLocale.value.zoomIn,
              onItemClick: handleZoomIn,
            },
            {
              key: "zoomOut",
              icon: <ZoomOutOutlined />,
              label: contextLocale.value.zoomOut,
              onItemClick: handleZoomOut,
            },
            {
              key: "zoomReset",
              actionRender: () => (
                <Tooltip title={contextLocale.value.zoomReset}>
                  <Button type="text" size="small" onClick={handleReset}>
                    {contextLocale.value.zoomReset}
                  </Button>
                </Tooltip>
              ),
            },
          );
        }

        if (mergedActions.value.enableDownload) {
          items.push({
            key: "download",
            icon: <DownloadOutlined />,
            label: contextLocale.value.download,
            onItemClick: handleDownload,
          });
        }
      }

      if (
        mergedRenderType.value === RenderType.Code &&
        mergedActions.value.enableCopy
      ) {
        items.push({
          key: "copy",
          actionRender: () => <Actions.Copy text={props.content} />,
        });
      }

      return [...items, ...resolvedCustomActions.value];
    });

    function renderHeader() {
      if (props.header === null) return null;
      if (slots.header) return slots.header();
      if (props.header !== undefined) return props.header;

      return (
        <div
          class={[`${props.prefixCls}-header`, mergedClasses.value.header]}
          style={mergedStyles.value.header}
        >
          <Segmented
            options={[
              { label: contextLocale.value.image, value: RenderType.Image },
              { label: contextLocale.value.code, value: RenderType.Code },
            ]}
            value={mergedRenderType.value}
            onChange={value => switchRenderType(value as MermaidRenderType)}
          />
          <Actions items={defaultHeaderActions.value} />
        </div>
      );
    }

    watch(
      () => props.renderType,
      next => {
        if (next !== undefined) {
          internalRenderType.value = next;
        }
      },
    );

    watch(
      () => props.config,
      nextConfig => {
        initializeMermaid({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "default",
          fontFamily: "monospace",
          ...nextConfig,
        });
      },
      { immediate: true, deep: true },
    );

    watch(
      [
        () => props.content,
        () => props.config,
        mergedRenderType,
        () => graphRef.value,
      ],
      () => {
        if (!graphRef.value) return;
        void renderDiagram();
      },
      {
        immediate: true,
        deep: true,
      },
    );

    watch(
      [
        mergedRenderType,
        () => mergedActions.value.enableZoom,
        () => graphRef.value,
      ],
      ([currentRenderType, enableZoom], _prev, onCleanup) => {
        const graphEl = graphRef.value;
        if (!graphEl) return;
        if (currentRenderType !== RenderType.Image || enableZoom === false) {
          return;
        }

        let lastTime = 0;
        const wheelHandler = (event: WheelEvent) => {
          event.preventDefault();
          event.stopPropagation();

          const now = Date.now();
          if (now - lastTime < 16) return;
          lastTime = now;

          const delta = event.deltaY > 0 ? -0.1 : 0.1;
          scale.value = Math.max(0.5, Math.min(3, scale.value + delta));
        };

        graphEl.addEventListener("wheel", wheelHandler, { passive: false });
        onCleanup(() => {
          graphEl.removeEventListener("wheel", wheelHandler);
        });
      },
      { immediate: true },
    );

    watch(
      [scale, position, mergedRenderType, isDragging],
      () => {
        applySvgTransform();
      },
      { deep: true },
    );

    onBeforeUnmount(() => {
      renderDiagram.cancel();
    });

    expose<MermaidRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    return () => {
      if (!props.content) return null;

      return (
        <div
          ref={rootRef}
          {...domAttrs.value}
          class={[
            props.prefixCls,
            contextConfig.value.classes?.root,
            props.rootClass,
            mergedClasses.value.root,
            hashId.value,
            cssVarCls.value,
            attrs.class,
            props.class,
            {
              [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
            },
          ]}
          style={[
            contextConfig.value.style,
            contextConfig.value.styles?.root,
            mergedStyles.value.root,
            attrs.style as StyleValue,
            props.style,
          ]}
        >
          {renderHeader()}

          <div
            ref={graphRef}
            class={[
              `${props.prefixCls}-graph`,
              mergedRenderType.value === RenderType.Code &&
                `${props.prefixCls}-graph-hidden`,
              mergedClasses.value.graph,
            ]}
            style={mergedStyles.value.graph}
            onMousedown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onMouseleave={handleMouseUp}
          />

          {mergedRenderType.value === RenderType.Code ? (
            <div
              class={[`${props.prefixCls}-code`, mergedClasses.value.code]}
              style={mergedStyles.value.code}
            >
              <CodeHighlighter
                showLineNumbers={false}
                showLanguage={false}
                showThemeToggle={false}
                {...props.codeHighlighterProps}
                content={props.content}
                language="mermaid"
                showCopyButton={false}
                styles={{
                  root: {
                    border: "none",
                    borderRadius: 0,
                  },
                  content: {
                    backgroundColor: "transparent",
                  },
                  code: {
                    backgroundColor: "transparent",
                    maxHeight: "100%",
                  },
                  ...props.codeHighlighterProps?.styles,
                }}
              />
            </div>
          ) : null}
        </div>
      );
    };
  },
});

export default XMermaid;
