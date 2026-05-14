import type { CSSProperties, PropType, VNodeChild } from "vue";

import { Empty, Spin } from "antdv-next";
import { computed, defineComponent } from "vue";

import type {
  EmptyRender,
  FolderProps,
  FolderTreeData,
  PreviewRender,
  PreviewTitleRender,
} from "./interface";

import { XActionsCopy } from "../actions/ActionsCopy";
import { useLocale } from "../locale";
import enUS from "../locale/en_US";

export interface FilePreviewProps {
  prefixCls: string;
  classes?: FolderProps["classes"];
  styles?: FolderProps["styles"];
  selectedFile?: string[] | null;
  fileContent?: string;
  loading?: boolean;
  previewTitle?: PreviewTitleRender;
  previewRender?: PreviewRender;
  emptyRender?: EmptyRender;
  getFileNode?: (
    path: string[],
  ) =>
    | { title: FolderTreeData["title"]; path: string; content?: string }
    | undefined;
}

function getFileExtension(path = "") {
  const parts = path.split(".");
  return parts[parts.length - 1] || "";
}

function getLanguageFromExtension(ext: string) {
  return ext.toLowerCase() || "txt";
}

const FilePreview = defineComponent({
  name: "AxFolderFilePreview",
  props: {
    prefixCls: { type: String, required: true },
    classes: {
      type: Object as PropType<FilePreviewProps["classes"]>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<FilePreviewProps["styles"]>,
      default: () => ({}),
    },
    style: {
      type: Object as PropType<CSSProperties>,
      default: undefined,
    },
    selectedFile: {
      type: Array as PropType<string[] | null>,
      default: () => [],
    },
    fileContent: { type: String, default: "" },
    loading: { type: Boolean, default: false },
    previewTitle: {
      type: [
        Boolean,
        String,
        Number,
        Object,
        Array,
        Function,
      ] as PropType<PreviewTitleRender>,
      default: undefined,
    },
    previewRender: {
      type: [
        String,
        Number,
        Object,
        Array,
        Function,
      ] as PropType<PreviewRender>,
      default: undefined,
    },
    emptyRender: {
      type: [
        Boolean,
        String,
        Number,
        Object,
        Array,
        Function,
      ] as PropType<EmptyRender>,
      default: undefined,
    },
    getFileNode: {
      type: Function as PropType<FilePreviewProps["getFileNode"]>,
      default: undefined,
    },
  },
  setup(props) {
    const [locale] = useLocale("Folder", enUS.Folder);

    const previewCls = computed(() => `${props.prefixCls}-preview`);

    const renderOriginContent = (fileContent: string, language: string) => (
      <pre
        class={`${previewCls.value}-code language-${language}`}
        style={{ margin: 0, background: "transparent" }}
      >
        <code class={`language-${language}`}>
          {fileContent.replace(/\n$/, "")}
        </code>
      </pre>
    );

    const renderEmpty = () => {
      if (props.emptyRender === false || props.emptyRender === null) {
        return null;
      }
      const node =
        typeof props.emptyRender === "function"
          ? (props.emptyRender as () => VNodeChild)()
          : ((props.emptyRender as VNodeChild) ?? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={locale.value.selectFile}
              />
            ));
      return (
        <div
          class={[
            `${previewCls.value}-empty-container`,
            props.classes?.previewRender,
          ]}
          style={props.styles?.previewRender}
        >
          {node}
        </div>
      );
    };

    const renderContent = () => {
      if (props.loading) {
        return (
          <div
            class={[
              `${previewCls.value}-loading-container`,
              props.classes?.previewRender,
            ]}
            style={props.styles?.previewRender}
          >
            <Spin />
          </div>
        );
      }

      if (!props.selectedFile || props.selectedFile.length === 0) {
        return renderEmpty();
      }

      const selected = props.selectedFile;
      const fileNode = props.getFileNode?.(selected);
      const title = fileNode?.title ?? selected[selected.length - 1];
      const fileName = selected[selected.length - 1];
      const extension = getFileExtension(fileName);
      const language = getLanguageFromExtension(extension);

      let headerNode: VNodeChild;
      if (props.previewTitle === false || props.previewTitle === null) {
        headerNode = null;
      } else if (props.previewTitle) {
        headerNode =
          typeof props.previewTitle === "function"
            ? (
                props.previewTitle as (info: {
                  title: VNodeChild;
                  path: string[];
                  content: string;
                }) => VNodeChild
              )({
                title,
                path: selected,
                content: props.fileContent ?? "",
              })
            : (props.previewTitle as VNodeChild);
      } else {
        headerNode = (
          <div class={`${previewCls.value}-title`}>
            <span class={`${previewCls.value}-filename`}>{title}</span>
            <XActionsCopy
              text={props.fileContent ?? ""}
              class={`${previewCls.value}-copy`}
            />
          </div>
        );
      }

      const originNode = renderOriginContent(props.fileContent ?? "", language);

      let contentNode: VNodeChild;
      if (props.previewRender !== undefined && props.previewRender !== null) {
        if (typeof props.previewRender === "function") {
          contentNode = (
            props.previewRender as (
              file: any,
              info: { originNode: VNodeChild },
            ) => VNodeChild
          )(
            {
              content: props.fileContent,
              path: selected,
              title: fileNode?.title,
              language,
            },
            { originNode },
          );
        } else {
          contentNode = props.previewRender as VNodeChild;
        }
      } else {
        contentNode = originNode;
      }

      return (
        <>
          {headerNode && (
            <div
              class={[
                `${previewCls.value}-title-wrapper`,
                props.classes?.previewTitle,
              ]}
              style={props.styles?.previewTitle}
            >
              {headerNode}
            </div>
          )}
          <div
            class={[
              `${previewCls.value}-content`,
              props.classes?.previewRender,
            ]}
            style={props.styles?.previewRender}
          >
            {contentNode}
          </div>
        </>
      );
    };

    return () => (
      <div
        class={[`${previewCls.value}`, props.classes?.filePreview]}
        style={[props.styles?.filePreview, props.style]}
      >
        {renderContent()}
      </div>
    );
  },
});

export default FilePreview;
