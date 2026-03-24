import type { UploadFile, UploadProps } from "antdv-next";
import type {
  ClassValue,
  CSSProperties,
  PropType,
  StyleValue,
  VNodeChild,
} from "vue";

import { useConfig } from "antdv-next/dist/config-provider/context";
import { computed, defineComponent, provide, ref, watch } from "vue";

import type { FileCardProps } from "../file-card";
import type { SemanticType as FileCardSemanticType } from "../file-card/FileCard";
import type { SemanticType as FileCardListSemanticType } from "../file-card/List";
import type { Attachment as FileListAttachment } from "./FileList";

import useXComponentConfig from "../_utils/hooks/use-x-component-config.ts";
import { AttachmentContextKey } from "./context";
import DropArea from "./DropArea";
import FileList from "./FileList";
import PlaceholderUploader, {
  type PlaceholderType,
} from "./PlaceholderUploader";
import SilentUploader from "./SilentUploader";
import useStyle from "./style";

export type SemanticType = "root" | "list" | "placeholder" | "upload";

export interface Attachment<T = any>
  extends UploadFile<T>, Omit<FileCardProps, "size" | "byte" | "type"> {
  description?: VNodeChild;
  cardType?: FileCardProps["type"];
}

export interface AttachmentsProps<T = any> {
  prefixCls?: string;
  rootClass?: string;
  style?: StyleValue;
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
  children?: VNodeChild;
  disabled?: boolean;
  placeholder?:
    | PlaceholderType
    | ((type: "inline" | "drop") => PlaceholderType);
  getDropContainer?: null | (() => HTMLElement | null | undefined);
  items?: Attachment<T>[];
  overflow?: "scrollX" | "scrollY" | "wrap";
  accept?: string;
  action?: string;
  method?: string;
  directory?: boolean;
  multiple?: boolean;
  maxCount?: number;
  beforeUpload?: UploadProps["beforeUpload"];
  onChange?: (info: { file: Attachment; fileList: Attachment[] }) => void;
  onRemove?: (file: Attachment) => boolean | Promise<boolean>;
  customRequest?: UploadProps["customRequest"];
  withCredentials?: boolean;
  openFileDialogOnClick?: boolean;
}

export interface AttachmentsRef {
  nativeElement?: HTMLDivElement | null;
  fileNativeElement?: HTMLInputElement | null;
  upload: (file: File) => void;
  select: (options?: { accept?: string; multiple?: boolean }) => void;
}

const XAttachments = defineComponent({
  name: "XAttachments",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-attachment",
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
      type: [String, Object, Array] as PropType<ClassValue>,
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
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: [String, Number, Object, Array, Function] as PropType<
        PlaceholderType | ((type: "inline" | "drop") => PlaceholderType)
      >,
      default: undefined,
    },
    getDropContainer: {
      type: Function as unknown as PropType<
        AttachmentsProps["getDropContainer"]
      >,
      default: null,
    },
    items: {
      type: Array as PropType<Attachment[]>,
      default: () => [],
    },
    overflow: {
      type: String as PropType<"scrollX" | "scrollY" | "wrap">,
      default: undefined,
    },
    accept: {
      type: String,
      default: undefined,
    },
    action: {
      type: String,
      default: undefined,
    },
    method: {
      type: String,
      default: "POST",
    },
    directory: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    maxCount: {
      type: Number,
      default: undefined,
    },
    beforeUpload: {
      type: Function as PropType<UploadProps["beforeUpload"]>,
      default: undefined,
    },
    onChange: {
      type: Function as PropType<
        (info: { file: Attachment; fileList: Attachment[] }) => void
      >,
      default: undefined,
    },
    onRemove: {
      type: Function as PropType<
        (file: Attachment) => boolean | Promise<boolean>
      >,
      default: undefined,
    },
    customRequest: {
      type: Function as PropType<UploadProps["customRequest"]>,
      default: undefined,
    },
    withCredentials: {
      type: Boolean,
      default: false,
    },
    openFileDialogOnClick: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["change"],
  setup(props, { attrs, emit, slots, expose }) {
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("attachments");

    const containerRef = ref<HTMLDivElement | null>(null);

    const [hashId, cssVarCls] = useStyle(computed(() => props.prefixCls));

    const mergedClasses = computed(() => ({
      ...contextConfig.value.classes,
      ...props.classes,
    }));

    const mergedStyles = computed(() => ({
      ...contextConfig.value.styles,
      ...props.styles,
    }));

    provide(AttachmentContextKey, {
      disabled: computed(() => props.disabled),
    });

    const fileList = ref<FileListAttachment[]>([]);

    watch(
      () => props.items,
      items => {
        fileList.value = (items ?? []) as FileListAttachment[];
      },
      { immediate: true, deep: true },
    );

    const triggerChange = (info: {
      file: Attachment;
      fileList: Attachment[];
    }) => {
      fileList.value = info.fileList as FileListAttachment[];
      props.onChange?.(info);
      emit("change", info);
    };

    const onUploadChange: UploadProps["onChange"] = info => {
      triggerChange({
        file: info.file as Attachment,
        fileList: (info.fileList ?? []) as Attachment[],
      });
    };

    const uploadProps = computed(
      () =>
        ({
          accept: props.accept,
          action: props.action,
          method: props.method,
          directory: props.directory,
          multiple: props.multiple,
          maxCount: props.maxCount,
          beforeUpload: props.beforeUpload,
          withCredentials: props.withCredentials,
          openFileDialogOnClick: props.openFileDialogOnClick,
          customRequest: props.customRequest,
          fileList: fileList.value as any,
          onChange: onUploadChange,
        }) as UploadProps,
    );

    const onItemRemove = (item: FileListAttachment) => {
      void Promise.resolve(
        typeof props.onRemove === "function"
          ? props.onRemove(item as Attachment)
          : undefined,
      ).then(ret => {
        if (ret === false) return;

        const nextFileList: any[] = [];
        for (const fileItem of fileList.value as any[]) {
          if (fileItem.uid !== item.uid) nextFileList.push(fileItem);
        }

        triggerChange({
          file: { ...item, status: "removed" } as Attachment,
          fileList: nextFileList as Attachment[],
        });
      });
    };

    const getFileInput = () =>
      containerRef.value?.querySelector<HTMLInputElement>(
        'input[type="file"]',
      ) ?? null;

    expose({
      get nativeElement() {
        return containerRef.value;
      },
      get fileNativeElement() {
        return getFileInput();
      },
      upload(file: File) {
        const fileInput = getFileInput();
        if (!fileInput) return;

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event("change", { bubbles: true }));
      },
      select(options?: { accept?: string; multiple?: boolean }) {
        const fileInput = getFileInput();
        if (!fileInput) return;

        fileInput.multiple = options?.multiple ?? false;

        const acceptValue = options?.accept || props.accept;
        fileInput.accept =
          typeof acceptValue === "string"
            ? acceptValue
            : (acceptValue as any)?.format || "";

        fileInput.click();
      },
    });

    const getPlaceholderNode = (
      type: "inline" | "drop",
      options?: { style?: StyleValue },
    ) => {
      const placeholderContent =
        typeof props.placeholder === "function"
          ? props.placeholder(type)
          : props.placeholder;

      return (
        <PlaceholderUploader
          placeholder={placeholderContent}
          upload={uploadProps.value}
          prefixCls={props.prefixCls}
          class={mergedClasses.value.placeholder}
          style={[mergedStyles.value.placeholder, options?.style]}
        />
      );
    };

    const renderWithChildren = () => (
      <div ref={containerRef}>
        <SilentUploader
          upload={uploadProps.value}
          style={mergedStyles.value.root}
          class={[props.rootClass, mergedClasses.value.root]}
        >
          {slots.default?.()}
        </SilentUploader>
        <DropArea
          getDropContainer={props.getDropContainer}
          prefixCls={props.prefixCls}
          style={mergedStyles.value.root}
          class={[
            hashId.value,
            cssVarCls.value,
            props.rootClass,
            mergedClasses.value.root,
          ]}
        >
          {getPlaceholderNode("drop")}
        </DropArea>
      </div>
    );

    const renderNormalMode = () => {
      const hasFileList = fileList.value.length > 0;

      return (
        <div
          ref={containerRef}
          class={[
            props.prefixCls,
            hashId.value,
            cssVarCls.value,
            {
              [`${props.prefixCls}-rtl`]: configCtx.value.direction === "rtl",
            },
            props.class,
            props.rootClass,
            mergedClasses.value.root,
            attrs.class,
          ]}
          style={[
            mergedStyles.value.root,
            props.style,
            attrs.style as StyleValue,
          ]}
          dir={configCtx.value.direction || "ltr"}
        >
          <FileList
            prefixCls={props.prefixCls}
            items={fileList.value as any}
            onRemove={onItemRemove as any}
            overflow={props.overflow}
            upload={uploadProps.value}
            classes={mergedClasses.value}
            style={!hasFileList ? { display: "none" } : undefined}
            styles={mergedStyles.value}
          />

          {getPlaceholderNode(
            "inline",
            hasFileList ? { style: { display: "none" } } : undefined,
          )}

          <DropArea
            getDropContainer={
              props.getDropContainer || (() => containerRef.value)
            }
            prefixCls={props.prefixCls}
            class={[hashId.value, cssVarCls.value]}
          >
            {getPlaceholderNode("drop")}
          </DropArea>
        </div>
      );
    };

    return () => (slots.default ? renderWithChildren() : renderNormalMode());
  },
});

export default XAttachments;
