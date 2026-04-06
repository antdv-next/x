import type { ImageProps, SpinProps } from "antdv-next";
import type {
  ClassValue,
  CSSProperties,
  HTMLAttributes,
  PropType,
  StyleValue,
  VNodeChild,
} from "vue";

import {
  FileExcelFilled,
  FileImageFilled,
  FileMarkdownFilled,
  FilePdfFilled,
  FilePptFilled,
  FileTextFilled,
  FileWordFilled,
  FileZipFilled,
  JavaOutlined,
  JavaScriptOutlined,
  PythonOutlined,
} from "@antdv-next/icons";
import { Image } from "antdv-next";
import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, useAttrs } from "vue";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import File from "./components/File";
import ImageLoading from "./components/ImageLoading";
import AudioIcon from "./icons/audio";
import VideoIcon from "./icons/video";
import useFileCardStyle from "./style";
import { matchExt } from "./utils";

export type SemanticType = "root" | "file" | "icon" | "name" | "description";

export type PresetIcons =
  | "default"
  | "excel"
  | "image"
  | "markdown"
  | "pdf"
  | "ppt"
  | "word"
  | "zip"
  | "video"
  | "audio"
  | "java"
  | "javascript"
  | "python";

export type FileCardTypeValue = "file" | "image" | "audio" | "video";

export type CardInfo = {
  size: string;
  icon: VNodeChild;
  namePrefix?: string;
  nameSuffix?: string;
  name?: string;
  src?: string;
  type?: string;
};

export type ExtendNode = false | VNodeChild | ((info: CardInfo) => VNodeChild);

export interface FileCardSlotInfo {
  info: CardInfo;
  originNode: VNodeChild;
}

export type FileCardSpinProps = SpinProps & {
  showText?: boolean;
  icon?: VNodeChild;
};

export interface FileCardProps extends Omit<
  HTMLAttributes,
  "onClick" | "class" | "style"
> {
  prefixCls?: string;
  style?: StyleValue;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  class?: ClassValue;
  classes?: Partial<Record<SemanticType, string>>;
  rootClass?: string;
  key?: string | number;
  name: string;
  byte?: number;
  size?: "small" | "default";
  description?: ExtendNode;
  loading?: boolean;
  src?: string;
  mask?: ExtendNode;
  icon?: VNodeChild;
  type?: string;
  imageProps?: ImageProps;
  spinProps?: FileCardSpinProps;
  videoProps?: Record<string, any>;
  audioProps?: Record<string, any>;
  onClick?: (info: CardInfo, event: MouseEvent) => void;
}

const IMAGE_EXT = ["png", "jpg", "jpeg", "gif", "bmp", "webp", "svg", "jfif"];
const AUDIO_EXT = ["mp3", "wav", "flac", "ape", "aac", "ogg"];
const VIDEO_EXT = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];

const PRESET_FILE_ICONS: {
  ext: string[];
  color: string;
  icon: VNodeChild;
  key: PresetIcons;
}[] = [
  {
    icon: <FileExcelFilled />,
    color: "#22b35e",
    ext: ["xlsx", "xls"],
    key: "excel",
  },
  {
    icon: <FileImageFilled />,
    color: "#8c8c8c",
    ext: IMAGE_EXT,
    key: "image",
  },
  {
    icon: <FileMarkdownFilled />,
    color: "#8c8c8c",
    ext: ["md", "mdx"],
    key: "markdown",
  },
  {
    icon: <FilePdfFilled />,
    color: "#ff4d4f",
    ext: ["pdf"],
    key: "pdf",
  },
  {
    icon: <FilePptFilled />,
    color: "#ff6e31",
    ext: ["ppt", "pptx"],
    key: "ppt",
  },
  {
    icon: <FileWordFilled />,
    color: "#1677ff",
    ext: ["doc", "docx"],
    key: "word",
  },
  {
    icon: <FileZipFilled />,
    color: "#fab714",
    ext: ["zip", "rar", "7z", "tar", "gz"],
    key: "zip",
  },
  {
    icon: <VideoIcon />,
    color: "#ff4d4f",
    ext: VIDEO_EXT,
    key: "video",
  },
  {
    icon: <AudioIcon />,
    color: "#ff6e31",
    ext: AUDIO_EXT,
    key: "audio",
  },
  {
    icon: <JavaOutlined />,
    color: "#1677ff",
    ext: ["java"],
    key: "java",
  },
  {
    icon: <JavaScriptOutlined />,
    color: "#fab714",
    ext: ["js"],
    key: "javascript",
  },
  {
    icon: <PythonOutlined />,
    color: "#fab714",
    ext: ["py"],
    key: "python",
  },
];

const DEFAULT_ICON = {
  icon: <FileTextFilled />,
  color: "#8c8c8c",
  ext: ["default"],
  key: "default" as const,
};

export const XFileCard = defineComponent({
  name: "AxFileCard",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-file-card",
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    rootClass: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
    },
    byte: {
      type: Number,
      default: undefined,
    },
    size: {
      type: String as PropType<"small" | "default">,
      default: "default",
    },
    description: {
      type: [
        String,
        Number,
        Object,
        Array,
        Function,
        Boolean,
      ] as PropType<ExtendNode>,
      default: undefined,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    src: {
      type: String,
      default: undefined,
    },
    mask: {
      type: [
        String,
        Number,
        Object,
        Array,
        Function,
        Boolean,
      ] as PropType<ExtendNode>,
      default: undefined,
    },
    icon: {
      type: [String, Number, Object, Array, Function] as PropType<VNodeChild>,
      default: undefined,
    },
    type: {
      type: String,
      default: undefined,
    },
    imageProps: {
      type: Object as PropType<ImageProps>,
      default: undefined,
    },
    spinProps: {
      type: Object as PropType<FileCardSpinProps>,
      default: undefined,
    },
    videoProps: {
      type: Object as PropType<Record<string, any>>,
      default: undefined,
    },
    audioProps: {
      type: Object as PropType<Record<string, any>>,
      default: undefined,
    },
    onClick: {
      type: Function as PropType<(info: CardInfo, event: MouseEvent) => void>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("fileCard");

    const [hashId, cssVarCls] = useFileCardStyle(
      computed(() => props.prefixCls),
    );

    const domAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    const namePair = computed(() => {
      const nameString = props.name || "";
      const match = nameString.match(/^(.*)\.[^.]+$/);

      if (!match) return [nameString, ""] as const;
      return [
        match[1] ?? "",
        nameString.slice((match[1] ?? "").length),
      ] as const;
    });

    const iconInfo = computed(() => {
      if (typeof props.icon === "string") {
        const preset = PRESET_FILE_ICONS.find(item => item.key === props.icon);
        if (preset) return { icon: preset.icon, color: preset.color };
      }

      for (const item of PRESET_FILE_ICONS) {
        if (matchExt(namePair.value[1], item.ext)) {
          return { icon: item.icon, color: item.color };
        }
      }

      return {
        icon: DEFAULT_ICON.icon,
        color: DEFAULT_ICON.color,
      };
    });

    const fileType = computed(() => {
      if (props.type) return props.type;

      if (matchExt(namePair.value[1], IMAGE_EXT)) return "image";
      if (matchExt(namePair.value[1], AUDIO_EXT)) return "audio";
      if (matchExt(namePair.value[1], VIDEO_EXT)) return "video";

      return "file";
    });

    const mergedClasses = computed(() => ({
      ...contextConfig.value.classes,
      ...props.classes,
    }));

    const mergedStyles = computed(() => ({
      ...contextConfig.value.styles,
      ...props.styles,
    }));

    const renderContent = () => {
      if (fileType.value === "image") {
        return (
          <div
            class={[
              `${props.prefixCls}-image`,
              mergedClasses.value.file,
              {
                [`${props.prefixCls}-loading`]: props.loading,
              },
            ]}
            style={mergedStyles.value.file}
          >
            <Image
              class={`${props.prefixCls}-image-img`}
              width={mergedStyles.value.file?.width}
              height={mergedStyles.value.file?.height}
              alt={props.name}
              src={props.src}
              {...props.imageProps}
            />
            {props.loading ? (
              <ImageLoading
                spinProps={props.spinProps}
                prefixCls={props.prefixCls}
                style={mergedStyles.value.file}
              />
            ) : null}
          </div>
        );
      }

      if (fileType.value === "video") {
        return (
          <video
            src={props.src}
            controls
            style={mergedStyles.value.file}
            class={[`${props.prefixCls}-video`, mergedClasses.value.file]}
            {...props.videoProps}
          />
        );
      }

      if (fileType.value === "audio") {
        return (
          <audio
            src={props.src}
            controls
            style={mergedStyles.value.file}
            class={[`${props.prefixCls}-audio`, mergedClasses.value.file]}
            {...props.audioProps}
          />
        );
      }

      return (
        <File
          prefixCls={props.prefixCls}
          namePrefix={namePair.value[0]}
          name={props.name}
          type={fileType.value}
          src={props.src}
          ext={namePair.value[1]}
          size={props.size}
          byte={props.byte}
          description={props.description}
          icon={
            props.icon && typeof props.icon !== "string"
              ? props.icon
              : iconInfo.value.icon
          }
          iconColor={iconInfo.value.color}
          onClick={props.onClick}
          mask={props.mask}
          descriptionRenderSlot={slots.description}
          maskRenderSlot={slots.mask}
          iconRenderSlot={slots.iconRender}
          classes={mergedClasses.value}
          styles={mergedStyles.value}
        />
      );
    };

    return () => (
      <div
        {...domAttrs.value}
        class={[
          props.prefixCls,
          contextConfig.value.classes?.root,
          props.rootClass,
          props.classes?.root,
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
          props.styles.root,
          attrs.style as StyleValue,
          props.style,
        ]}
      >
        {renderContent()}
      </div>
    );
  },
});

export default XFileCard;
