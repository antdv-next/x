import type {
  CSSProperties,
  PropType,
  SlotsType,
  StyleValue,
  VNodeChild,
} from "vue";

import { Flex, Splitter, SplitterPanel } from "antdv-next";
import { useConfig } from "antdv-next/config-provider/context";
import { computed, defineComponent, ref, useAttrs, watch } from "vue";

import type {
  DirectoryIconsMap,
  DirectoryTitleRender,
  EmptyRender,
  FileContentService,
  FolderProps,
  FolderRef,
  FolderSlots,
  FolderTreeData,
  PreviewRender,
  PreviewTitleRender,
  SemanticType,
} from "./interface";

import useXComponentConfig from "../_utils/hooks/use-x-component-config";
import { useLocale } from "../locale";
import enUS from "../locale/en_US";
import DirectoryTree from "./DirectoryTree";
import FilePreview from "./FilePreview";
import useStyle from "./style";

function findNode(
  nodes: FolderTreeData[],
  segments: string[],
  index = 0,
): FolderTreeData | undefined {
  if (index >= segments.length) return undefined;
  const current = segments[index];
  for (const node of nodes) {
    if (node.path === current) {
      if (index === segments.length - 1) return node;
      return node.children
        ? findNode(node.children, segments, index + 1)
        : undefined;
    }
  }
  return undefined;
}

function findNodeAndValidate(
  treeData: FolderTreeData[],
  path: string | string[] | undefined,
  validateAsFile = false,
): { node: FolderTreeData | undefined; isValid: boolean } {
  if (!path) return { node: undefined, isValid: false };
  const segments = Array.isArray(path)
    ? path.filter(Boolean)
    : path.split("/").filter(Boolean);
  if (segments.length === 0) return { node: undefined, isValid: false };
  const node = findNode(treeData, segments);
  const isValid = validateAsFile
    ? !!node && (!node?.children || node.children.length === 0)
    : !!node;
  return { node, isValid };
}

const XFolder = defineComponent({
  name: "AxFolder",
  inheritAttrs: false,
  props: {
    prefixCls: {
      type: String,
      default: "antd-folder",
    },
    rootClass: {
      type: String,
      default: "",
    },
    class: {
      type: [String, Array, Object] as PropType<FolderProps["class"]>,
      default: undefined,
    },
    style: {
      type: [String, Object, Array] as PropType<StyleValue>,
      default: undefined,
    },
    classes: {
      type: Object as PropType<Partial<Record<SemanticType, string>>>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<Partial<Record<SemanticType, CSSProperties>>>,
      default: () => ({}),
    },
    treeData: {
      type: Array as PropType<FolderTreeData[]>,
      default: () => [],
    },
    directoryIcons: {
      type: [Boolean, Object] as PropType<DirectoryIconsMap>,
      default: undefined,
    },
    selectable: { type: Boolean, default: true },
    selectedFile: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    defaultSelectedFile: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    directoryTreeWith: {
      type: [Number, String] as PropType<number | string>,
      default: 278,
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
    defaultExpandedPaths: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    expandedPaths: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    defaultExpandAll: { type: Boolean, default: true },
    fileContentService: {
      type: Object as PropType<FileContentService>,
      default: undefined,
    },
    directoryTitle: {
      type: [
        Boolean,
        String,
        Number,
        Object,
        Array,
        Function,
      ] as PropType<DirectoryTitleRender>,
      default: undefined,
    },
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
  },
  emits: {
    selectedFileChange: (_file: {
      path: string[];
      title?: VNodeChild;
      content?: string;
    }) => true,
    fileClick: (_path: string, _content?: string) => true,
    folderClick: (_path: string) => true,
    expandedPathsChange: (_paths: string[]) => true,
    "update:selectedFile": (_paths: string[]) => true,
    "update:expandedPaths": (_paths: string[]) => true,
  },
  slots: Object as SlotsType<FolderSlots>,
  setup(props, { emit, expose, slots }) {
    const attrs = useAttrs();
    const configCtx = useConfig();
    const contextConfig = useXComponentConfig("folder");
    const [hashId, cssVarCls] = useStyle(computed(() => props.prefixCls));
    const [locale] = useLocale("Folder", enUS.Folder);

    const rootRef = ref<HTMLDivElement>();

    const isValidSelectedFile = (filePath?: string[]): boolean =>
      !!(
        filePath &&
        filePath.length > 0 &&
        findNodeAndValidate(props.treeData, filePath, true).isValid
      );

    // controlled/uncontrolled selectedFile
    const innerSelectedFile = ref<string[]>(
      isValidSelectedFile(props.defaultSelectedFile)
        ? (props.defaultSelectedFile ?? [])
        : [],
    );

    const mergedSelectedFile = computed<string[]>(() =>
      props.selectedFile !== undefined
        ? props.selectedFile
        : innerSelectedFile.value,
    );

    const validSelectedFile = ref<boolean>(
      isValidSelectedFile(props.selectedFile ?? props.defaultSelectedFile),
    );

    watch(
      () =>
        [
          props.selectedFile,
          props.defaultSelectedFile,
          props.treeData,
        ] as const,
      () => {
        validSelectedFile.value = isValidSelectedFile(
          props.selectedFile ?? props.defaultSelectedFile ?? [],
        );
      },
      { deep: true },
    );

    // controlled/uncontrolled expandedPaths
    const innerExpandedPaths = ref<string[] | undefined>(
      props.defaultExpandedPaths,
    );
    const mergedExpandedPaths = computed<string[] | undefined>(() =>
      props.expandedPaths !== undefined
        ? props.expandedPaths
        : innerExpandedPaths.value,
    );

    // file content state
    const fileContent = ref<string>("");
    const loadingContent = ref<boolean>(false);

    const loadFileContent = async () => {
      if (!validSelectedFile.value || mergedSelectedFile.value.length === 0) {
        fileContent.value = "";
        loadingContent.value = false;
        return;
      }

      const filePath = mergedSelectedFile.value.join("/");
      const segments = filePath.split("/").filter(s => s !== "");
      const { node } = findNodeAndValidate(props.treeData, segments);

      if (props.fileContentService) {
        loadingContent.value = true;
        try {
          const content =
            await props.fileContentService.loadFileContent(filePath);
          fileContent.value = content;
        } catch (error) {
          fileContent.value = `// ${locale.value.loadError}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
        } finally {
          loadingContent.value = false;
        }
        return;
      }

      if (node?.content) {
        fileContent.value = node.content;
        loadingContent.value = false;
        return;
      }

      fileContent.value = `// ${locale.value.noService}`;
      loadingContent.value = false;
    };

    watch(
      [
        validSelectedFile,
        mergedSelectedFile,
        () => props.treeData,
        () => props.fileContentService,
      ],
      () => {
        void loadFileContent();
      },
      { immediate: true, deep: true },
    );

    // handlers
    const handleSelect = (keys: string[], info: any) => {
      const nodes = Array.isArray(info?.selectedNodes)
        ? info.selectedNodes
        : info?.selectedNodes
          ? [info.selectedNodes]
          : [];

      const isFolderClick = nodes.some((node: any) => !node?.isLeaf);

      if (isFolderClick) {
        if (nodes.length === 1) {
          const node = nodes[0];
          const folderPath = node?.path ?? "";
          emit("folderClick", folderPath);
        }
        return;
      }

      const pathArray = keys[0]?.split("/").filter(Boolean) ?? [];
      if (pathArray.length === 0) return;

      const selectedNode = nodes[0];
      const fileName = selectedNode?.title;
      const fileContentValue = selectedNode?.content as string | undefined;

      emit("selectedFileChange", {
        path: pathArray,
        title: fileName,
        content: fileContentValue,
      });

      const isControlled = props.selectedFile !== undefined;
      if (!isControlled) {
        validSelectedFile.value = true;
        innerSelectedFile.value = pathArray;
        emit("update:selectedFile", pathArray);
      }

      if (nodes.length === 1) {
        const node = nodes[0];
        emit("fileClick", node?.path ?? "", node?.content);
      }
    };

    const handleExpand = (keys: string[]) => {
      const newPaths = keys ?? [];
      if (props.expandedPaths === undefined) {
        innerExpandedPaths.value = newPaths;
      }
      emit("update:expandedPaths", newPaths);
      emit("expandedPathsChange", newPaths);
    };

    const domAttrs = computed(() => {
      const { class: _c, style: _s, ...rest } = attrs;
      return rest;
    });

    expose<FolderRef>({
      get nativeElement() {
        return rootRef.value as HTMLDivElement;
      },
    });

    // slot > prop resolution
    const mergedDirectoryTitle = computed<DirectoryTitleRender>(
      () => slots.directoryTitle ?? props.directoryTitle,
    );
    const mergedPreviewTitle = computed<PreviewTitleRender>(
      () => slots.previewTitle ?? props.previewTitle,
    );
    const mergedPreviewRender = computed<PreviewRender>(() => {
      if (slots.previewRender) {
        return (file: any, info: { originNode: VNodeChild }) =>
          slots.previewRender!({ file, originNode: info.originNode });
      }
      return props.previewRender;
    });
    const mergedEmptyRender = computed<EmptyRender>(
      () => slots.emptyRender ?? props.emptyRender,
    );

    return () => {
      const prefixCls = props.prefixCls;
      return (
        <div
          ref={rootRef}
          {...domAttrs.value}
          class={[
            prefixCls,
            contextConfig.value.classes?.root,
            props.rootClass,
            props.classes?.root,
            hashId.value,
            cssVarCls.value,
            attrs.class,
            props.class,
            {
              [`${prefixCls}-rtl`]: configCtx.value.direction === "rtl",
              [`${prefixCls}-selectable`]: props.selectable,
            },
          ]}
          style={[
            contextConfig.value.style,
            contextConfig.value.styles?.root,
            props.styles?.root,
            attrs.style as StyleValue,
            props.style,
          ]}
        >
          <Flex class={`${prefixCls}-container`}>
            <Splitter>
              <SplitterPanel defaultSize={props.directoryTreeWith}>
                <div
                  class={[
                    `${prefixCls}-directory-tree`,
                    props.classes?.directoryTree,
                  ]}
                  style={[
                    contextConfig.value.styles?.directoryTree,
                    props.styles?.directoryTree,
                  ]}
                >
                  <DirectoryTree
                    prefixCls={prefixCls}
                    directoryIcons={props.directoryIcons}
                    treeData={props.treeData}
                    selectedKeys={
                      props.selectable &&
                      mergedSelectedFile.value &&
                      validSelectedFile.value
                        ? [mergedSelectedFile.value.join("/")]
                        : []
                    }
                    classes={props.classes}
                    styles={props.styles}
                    expandedKeys={mergedExpandedPaths.value}
                    defaultExpandAll={props.defaultExpandAll}
                    directoryTitle={mergedDirectoryTitle.value}
                    onSelect={handleSelect}
                    onExpand={handleExpand}
                  />
                </div>
              </SplitterPanel>
              <SplitterPanel>
                <FilePreview
                  prefixCls={prefixCls}
                  classes={props.classes}
                  styles={props.styles}
                  selectedFile={
                    validSelectedFile.value ? mergedSelectedFile.value : []
                  }
                  fileContent={fileContent.value}
                  loading={loadingContent.value}
                  previewTitle={mergedPreviewTitle.value}
                  previewRender={mergedPreviewRender.value}
                  emptyRender={mergedEmptyRender.value}
                  getFileNode={(path: string[]) => {
                    if (!path || path.length === 0) return undefined;
                    const { node } = findNodeAndValidate(props.treeData, path);
                    return node
                      ? {
                          title: node.title,
                          path: node.path,
                          content: node.content,
                        }
                      : undefined;
                  }}
                />
              </SplitterPanel>
            </Splitter>
          </Flex>
        </div>
      );
    };
  },
});

export default XFolder;
