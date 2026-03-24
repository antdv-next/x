import type { ImageProps, UploadProps } from "antdv-next";
import type {
  ClassValue,
  CSSProperties,
  PropType,
  StyleValue,
  VNodeChild,
} from "vue";

import { PlusOutlined } from "@antdv-next/icons";
import { Button } from "antdv-next";
import { computed, defineComponent, inject, ref, watch } from "vue";

import type { SemanticType as FileCardSemanticType } from "../../file-card/FileCard";
import type { SemanticType as FileCardListSemanticType } from "../../file-card/List";

import useXComponentConfig from "../../_utils/hooks/use-x-component-config.ts";
import { FileCardList, type FileCardProps } from "../../file-card";
import { AttachmentContextKey } from "../context";
import SilentUploader from "../SilentUploader";
import { previewImage } from "../util";
import Progress from "./Progress";

type SemanticType = "list" | "upload";

export interface Attachment {
  uid: string;
  name: string;
  status?: "uploading" | "done" | "error" | "removed";
  url?: string;
  thumbUrl?: string;
  percent?: number;
  response?: any;
  size?: number;
  description?: VNodeChild;
  cardType?: FileCardProps["type"];
  originFileObj?: File;
  [key: string]: any;
}

export interface FileListProps {
  prefixCls: string;
  items: Attachment[];
  style?: StyleValue;
  onRemove: (item: Attachment) => void;
  overflow?: "scrollX" | "scrollY" | "wrap";
  upload: UploadProps;
  class?: ClassValue;
  classes?: Partial<
    Record<
      SemanticType | FileCardSemanticType | FileCardListSemanticType,
      string
    >
  >;
  styles?: Partial<
    Record<
      SemanticType | FileCardSemanticType | FileCardListSemanticType,
      CSSProperties
    >
  >;
}

const mergeClassName = (...names: Array<string | undefined>) =>
  names.filter(Boolean).join(" ");

export default defineComponent({
  name: "XAttachmentsFileList",
  props: {
    prefixCls: {
      type: String,
      required: true,
    },
    items: {
      type: Array as PropType<Attachment[]>,
      default: () => [],
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    onRemove: {
      type: Function as PropType<(item: Attachment) => void>,
      required: true,
    },
    overflow: {
      type: String as PropType<"scrollX" | "scrollY" | "wrap">,
      default: undefined,
    },
    upload: {
      type: Object as PropType<UploadProps>,
      default: () => ({}) as UploadProps,
    },
    class: {
      type: [String, Array, Object] as PropType<ClassValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<
        Partial<
          Record<
            SemanticType | FileCardSemanticType | FileCardListSemanticType,
            string
          >
        >
      >,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<
        Partial<
          Record<
            SemanticType | FileCardSemanticType | FileCardListSemanticType,
            CSSProperties
          >
        >
      >,
      default: () => ({}),
    },
  },
  setup(props) {
    const context = inject(AttachmentContextKey, {});
    const contextConfig = useXComponentConfig("attachments");

    const list = ref<FileCardProps[]>([]);
    const listCls = computed(() => `${props.prefixCls}-list`);
    const buildVersion = ref(0);

    const mergedClasses = computed(() => ({
      ...contextConfig.value.classes,
      ...props.classes,
    }));

    const mergedStyles = computed(() => ({
      ...contextConfig.value.styles,
      ...props.styles,
    }));

    const getDescription = (item: Attachment) => {
      if (item.description) return item.description;
      if (item.status === "uploading") return `${item.percent ?? 0}%`;
      if (item.status === "error")
        return typeof item.response === "string" ? item.response : "error";
      return "";
    };

    const rebuildList = async (items: Attachment[]) => {
      const currentBuild = ++buildVersion.value;
      const nextList: FileCardProps[] = [];

      for (const [index, item] of items.entries()) {
        const desc = getDescription(item);

        let previewImg: string | undefined;
        if (item.originFileObj) {
          previewImg = await previewImage(item.originFileObj);
        }

        const previewUrl = item.thumbUrl || item.url || previewImg;
        const cardCls = `${props.prefixCls}-list-card`;
        const status = item.status;

        let imageProps: ImageProps | undefined;

        if (previewUrl && (status === "uploading" || status === "error")) {
          const percent = item.percent;
          const mask = (
            <div class={`${cardCls}-file-img-mask`}>
              {status === "uploading" && percent !== undefined ? (
                <Progress percent={percent} prefixCls={cardCls} />
              ) : null}
              {status === "error" ? (
                <div class={`${cardCls}-desc`}>
                  <div class={`${cardCls}-ellipsis`}>{desc}</div>
                </div>
              ) : null}
            </div>
          );

          imageProps = {
            preview: {
              src: previewUrl,
              mask,
            } as any,
          };
        }

        const { cardType, type: _type, ...restItem } = item;

        nextList.push({
          key: item.uid || index,
          description: desc,
          src: previewUrl,
          classes: {
            file: mergeClassName(
              `${cardCls}-status-${status}`,
              mergedClasses.value.file,
            ),
            description: mergeClassName(
              `${cardCls}-desc`,
              mergedClasses.value.description,
            ),
          },
          byte: item.size,
          ...restItem,
          type: cardType,
          size: undefined,
          imageProps,
        });
      }

      if (currentBuild === buildVersion.value) list.value = nextList;
    };

    watch(
      () => props.items,
      items => {
        void rebuildList(items ?? []);
      },
      { immediate: true, deep: true },
    );

    const handleRemove = (item: FileCardProps) => {
      const index = list.value.findIndex(card => card.key === item.key);
      if (index >= 0 && props.items[index]) {
        props.onRemove(props.items[index]);
      }
    };

    const disabled = computed(() => {
      const disabledValue = context.disabled;
      return typeof disabledValue === "boolean"
        ? disabledValue
        : (disabledValue?.value ?? false);
    });

    const showExtension = computed(
      () =>
        !disabled.value &&
        (typeof props.upload.maxCount === "undefined" ||
          props.upload.maxCount > props.items.length),
    );

    const FileCardListAny = FileCardList as any;

    return () => (
      <FileCardListAny
        items={list.value}
        class={[`${props.prefixCls}-list`, props.class]}
        classes={{
          root: mergedClasses.value.list,
          card: mergedClasses.value.card,
          file: mergedClasses.value.file,
          description: mergedClasses.value.description,
          icon: mergedClasses.value.icon,
          name: mergedClasses.value.name,
        }}
        styles={{
          root: mergedStyles.value.list,
          card: mergedStyles.value.card,
          file: mergedStyles.value.file,
          description: mergedStyles.value.description,
          icon: mergedStyles.value.icon,
          name: mergedStyles.value.name,
        }}
        style={props.style}
        removable={!disabled.value}
        onRemove={handleRemove}
        overflow={props.overflow}
        extension={
          <SilentUploader visible={showExtension.value} upload={props.upload}>
            <Button
              class={[
                mergedClasses.value.upload,
                `${listCls.value}-upload-btn`,
              ]}
              style={mergedStyles.value.upload as any}
              type="dashed"
            >
              <PlusOutlined class={`${listCls.value}-upload-btn-icon`} />
            </Button>
          </SilentUploader>
        }
      />
    );
  },
});
