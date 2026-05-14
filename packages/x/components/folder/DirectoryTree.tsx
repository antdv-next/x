import type { PropType, VNodeChild } from "vue";

import { FileOutlined, FolderOutlined } from "@antdv-next/icons";
import { DirectoryTree as AntDirectoryTree } from "antdv-next";
import { computed, defineComponent } from "vue";

import type {
  DirectoryIconsMap,
  DirectoryTitleRender,
  FolderProps,
  FolderTreeData,
} from "./interface";

export interface DirectoryTreeNode {
  key: string;
  path: string;
  pathSegments: string[];
  title: VNodeChild;
  icon?: VNodeChild;
  isLeaf?: boolean;
  content?: string;
  children?: DirectoryTreeNode[];
}

export interface DirectoryTreeProps {
  prefixCls: string;
  treeData: FolderTreeData[];
  directoryIcons?: DirectoryIconsMap;
  selectedKeys?: string[];
  expandedKeys?: string[];
  defaultExpandAll?: boolean;
  showLine?: boolean;
  classes?: FolderProps["classes"];
  styles?: FolderProps["styles"];
  directoryTitle?: DirectoryTitleRender;
}

function isFolder(node: FolderTreeData): boolean {
  return !!node.children && node.children.length > 0;
}

function buildPathSegments(
  node: FolderTreeData,
  parentSegments: string[],
): string[] {
  if (node.path === "/" && parentSegments.length === 0) {
    return ["/"];
  }
  return [...parentSegments, node.path].filter(seg => seg !== "");
}

function getIcon(
  node: FolderTreeData,
  directoryIcons: DirectoryIconsMap | undefined,
): VNodeChild {
  if (directoryIcons === false || directoryIcons === null) {
    return null;
  }
  if (isFolder(node)) {
    const icon = directoryIcons?.directory;
    if (typeof icon === "function") return (icon as () => VNodeChild)();
    return icon ?? <FolderOutlined />;
  }
  const filePath = node.path.toLowerCase();
  const ext = filePath.split(".").pop();
  if (ext) {
    const icon = directoryIcons?.[ext];
    if (icon) {
      return typeof icon === "function" ? (icon as () => VNodeChild)() : icon;
    }
  }
  return <FileOutlined />;
}

function convertToTreeData(
  nodes: FolderTreeData[],
  directoryIcons: DirectoryIconsMap | undefined,
  parentSegments: string[] = [],
): DirectoryTreeNode[] {
  return nodes.map(node => {
    const pathSegments = buildPathSegments(node, parentSegments);
    const fullPath = pathSegments.join("/").replace(/^\/+/, "");
    return {
      key: fullPath,
      path: fullPath,
      pathSegments,
      title: node.title,
      icon: getIcon(node, directoryIcons),
      isLeaf: !isFolder(node),
      content: node.content,
      children: node.children
        ? convertToTreeData(node.children, directoryIcons, pathSegments)
        : undefined,
    };
  });
}

const FolderDirectoryTree = defineComponent({
  name: "AxFolderDirectoryTree",
  props: {
    prefixCls: { type: String, required: true },
    treeData: {
      type: Array as PropType<FolderTreeData[]>,
      default: () => [],
    },
    directoryIcons: {
      type: [Boolean, Object] as PropType<DirectoryIconsMap>,
      default: undefined,
    },
    selectedKeys: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    expandedKeys: {
      type: Array as PropType<string[] | undefined>,
      default: undefined,
    },
    defaultExpandAll: { type: Boolean, default: true },
    showLine: { type: Boolean, default: false },
    classes: {
      type: Object as PropType<FolderProps["classes"]>,
      default: () => ({}),
    },
    styles: {
      type: Object as PropType<FolderProps["styles"]>,
      default: () => ({}),
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
  },
  emits: {
    select: (_keys: string[], _info: any) => true,
    expand: (_keys: string[], _info: any) => true,
  },
  setup(props, { emit }) {
    const treeDataConverted = computed(() =>
      convertToTreeData(props.treeData, props.directoryIcons),
    );

    const titleNode = computed(() => {
      const t = props.directoryTitle;
      if (t === false || t === null || t === undefined) return null;
      if (typeof t === "function") return (t as () => VNodeChild)();
      return t as VNodeChild;
    });

    return () => {
      const { prefixCls } = props;
      return (
        <>
          {titleNode.value ? (
            <div
              class={[
                `${prefixCls}-directory-tree-title`,
                props.classes?.directoryTitle,
              ]}
              style={props.styles?.directoryTitle}
            >
              {titleNode.value}
            </div>
          ) : null}
          <AntDirectoryTree
            {...({
              treeData: treeDataConverted.value,
              selectedKeys: props.selectedKeys,
              expandedKeys: props.expandedKeys,
              multiple: false,
              blockNode: true,
              showLine: props.showLine,
              defaultExpandAll: props.defaultExpandAll,
              class: [
                `${prefixCls}-directory-tree-content`,
                props.classes?.directoryTree,
              ],
              style: props.styles?.directoryTree,
              classes: {
                itemTitle: `${prefixCls}-directory-tree-item-title`,
              },
              onSelect: (keys: any, info: any) =>
                emit("select", keys as string[], info),
              onExpand: (keys: any, info: any) =>
                emit("expand", keys as string[], info),
            } as any)}
          />
        </>
      );
    };
  },
});

export default FolderDirectoryTree;
