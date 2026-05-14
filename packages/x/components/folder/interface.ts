import type {
  CSSProperties,
  HTMLAttributes,
  StyleValue,
  VNodeChild,
} from "vue";

export type SemanticType =
  | "root"
  | "directoryTree"
  | "directoryTitle"
  | "filePreview"
  | "previewTitle"
  | "previewRender";

export interface FolderTreeData {
  title: VNodeChild;
  path: string;
  content?: string;
  children?: FolderTreeData[];
}

export interface FileContentService {
  loadFileContent: (filePath: string) => Promise<string>;
}

export type DirectoryIconRenderer = VNodeChild | (() => VNodeChild);
export type DirectoryIconsMap =
  | false
  | (Record<string, DirectoryIconRenderer> & {
      directory?: DirectoryIconRenderer;
    });

export interface PreviewFileInfo {
  content?: string;
  path: string[];
  title?: FolderTreeData["title"];
  language: string;
}

export interface SelectedFileInfo {
  path: string[];
  title?: FolderTreeData["title"];
  content?: string;
}

export type EmptyRender = false | null | VNodeChild | (() => VNodeChild);

export type PreviewTitleRender =
  | false
  | null
  | VNodeChild
  | ((info: {
      title: VNodeChild;
      path: string[];
      content: string;
    }) => VNodeChild);

export type PreviewRender =
  | VNodeChild
  | ((file: PreviewFileInfo, info: { originNode: VNodeChild }) => VNodeChild);

export type DirectoryTitleRender =
  | false
  | null
  | VNodeChild
  | (() => VNodeChild);

export interface FolderProps extends Omit<HTMLAttributes, "title"> {
  prefixCls?: string;
  rootClass?: string;
  class?: any;
  style?: StyleValue;
  classes?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;

  treeData: FolderTreeData[];
  directoryIcons?: DirectoryIconsMap;

  selectable?: boolean;
  selectedFile?: string[];
  defaultSelectedFile?: string[];
  onSelectedFileChange?: (file: SelectedFileInfo) => void;

  directoryTreeWith?: number | string;
  emptyRender?: EmptyRender;
  previewRender?: PreviewRender;

  defaultExpandedPaths?: string[];
  expandedPaths?: string[];
  defaultExpandAll?: boolean;
  onExpandedPathsChange?: (paths: string[]) => void;

  fileContentService?: FileContentService;

  onFileClick?: (filePath: string, content?: string) => void;
  onFolderClick?: (folderPath: string) => void;

  directoryTitle?: DirectoryTitleRender;
  previewTitle?: PreviewTitleRender;
}

export interface FolderRef {
  nativeElement: HTMLDivElement;
}

export interface FolderSlots {
  directoryTitle?: () => VNodeChild;
  previewTitle?: (info: {
    title: VNodeChild;
    path: string[];
    content: string;
  }) => VNodeChild;
  previewRender?: (info: {
    file: PreviewFileInfo;
    originNode: VNodeChild;
  }) => VNodeChild;
  emptyRender?: () => VNodeChild;
}
