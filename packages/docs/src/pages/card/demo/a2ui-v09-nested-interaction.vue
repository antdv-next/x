<script setup lang="tsx">
import type { BubbleListProps } from "@antdv-next/x";

import {
  CheckCircleOutlined,
  CloseOutlined,
  FileOutlined,
  FolderOpenOutlined,
  FolderOutlined,
  ReloadOutlined,
} from "@antdv-next/icons";
import { BubbleList } from "@antdv-next/x";
import { XMarkdown } from "@antdv-next/x-markdown";
import { Button, Card, Collapse, Space, Tag, Typography } from "antdv-next";
import { computed, h, onMounted, ref, watch } from "vue";

import {
  registerCatalog,
  XCardBox,
  XCardCard,
  type ActionPayload,
} from "@antdv-next/x-card";
import localCatalog from "./catalog-coffee.json";

registerCatalog(localCatalog as any);

const { Text: TypographyText } = Typography;

interface FileNode {
  key: string;
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  size?: number;
  modified?: string;
  language?: string;
  description?: string;
}

interface FileDetail {
  name: string;
  path: string;
  size: number;
  modified: string;
  language: string;
  description: string;
}

const PROJECT_FILES: FileNode[] = [
  {
    key: "src",
    name: "src",
    type: "folder",
    children: [
      {
        key: "src/components",
        name: "components",
        type: "folder",
        children: [
          {
            key: "src/components/Button.tsx",
            name: "Button.tsx",
            type: "file",
            size: 2048,
            modified: "2024-01-15",
            language: "TypeScript",
            description: "A reusable button component with multiple variants",
          },
          {
            key: "src/components/Card.tsx",
            name: "Card.tsx",
            type: "file",
            size: 3584,
            modified: "2024-01-14",
            language: "TypeScript",
            description: "Card component for displaying content in a container",
          },
          {
            key: "src/components/Modal.tsx",
            name: "Modal.tsx",
            type: "file",
            size: 4096,
            modified: "2024-01-13",
            language: "TypeScript",
            description: "Modal dialog component with overlay",
          },
        ],
      },
      {
        key: "src/hooks",
        name: "hooks",
        type: "folder",
        children: [
          {
            key: "src/hooks/useAuth.ts",
            name: "useAuth.ts",
            type: "file",
            size: 1536,
            modified: "2024-01-12",
            language: "TypeScript",
            description: "Authentication hook for user login/logout",
          },
          {
            key: "src/hooks/useTheme.ts",
            name: "useTheme.ts",
            type: "file",
            size: 1024,
            modified: "2024-01-11",
            language: "TypeScript",
            description: "Theme management hook",
          },
        ],
      },
      {
        key: "src/App.tsx",
        name: "App.tsx",
        type: "file",
        size: 2560,
        modified: "2024-01-10",
        language: "TypeScript",
        description: "Main application entry component",
      },
      {
        key: "src/index.tsx",
        name: "index.tsx",
        type: "file",
        size: 512,
        modified: "2024-01-09",
        language: "TypeScript",
        description: "Application bootstrap file",
      },
    ],
  },
  {
    key: "public",
    name: "public",
    type: "folder",
    children: [
      {
        key: "public/index.html",
        name: "index.html",
        type: "file",
        size: 768,
        modified: "2024-01-08",
        language: "HTML",
        description: "HTML template for the application",
      },
      {
        key: "public/favicon.ico",
        name: "favicon.ico",
        type: "file",
        size: 4096,
        modified: "2024-01-07",
        language: "Binary",
        description: "Application favicon",
      },
    ],
  },
  {
    key: "package.json",
    name: "package.json",
    type: "file",
    size: 1280,
    modified: "2024-01-16",
    language: "JSON",
    description: "Project dependencies and scripts configuration",
  },
  {
    key: "README.md",
    name: "README.md",
    type: "file",
    size: 2048,
    modified: "2024-01-17",
    language: "Markdown",
    description: "Project documentation and usage guide",
  },
];

const PANEL_DATA = [
  {
    id: "overview",
    title: "Project Overview",
    content:
      "This is a Vue-based web application built with TypeScript. It follows a component-based architecture with composables for state management.",
  },
  {
    id: "tech-stack",
    title: "Tech Stack",
    content:
      "- Vue 3.x\n- TypeScript 5.x\n- antdv-next\n- Vite for build tooling\n- ESLint & Prettier for code quality",
  },
  {
    id: "structure",
    title: "Directory Structure",
    content:
      "- src/components: Reusable UI components\n- src/hooks: Composables\n- public: Static assets\n- package.json: Dependencies",
  },
];

const contentHeader =
  "Welcome to Project File Browser! Browse the project structure below. Click on files to view details, expand folders to explore nested contents.";

type TextNode = { text: string; timestamp: number };
type CardNode = { timestamp: number; id: string };
type ContentType = { texts: TextNode[]; card: CardNode[] };

const role = computed<BubbleListProps["role"]>(() => ({
  assistant: {
    typing: false,
    contentRender(content: ContentType | string) {
      if (!content || typeof content === "string") return null;
      const contentList = [...content.texts, ...content.card].sort(
        (a, b) => a.timestamp - b.timestamp,
      );
      return contentList.map((node, index) => {
        if ("text" in node && node.text) {
          return h(XMarkdown, { key: `text-${index}`, content: node.text });
        }
        if ("id" in node && node.id) {
          return h(XCardCard, { key: `card-${index}`, id: node.id });
        }
        return null;
      });
    },
  },
}));

const TextComponent = {
  name: "DemoText",
  props: {
    text: { type: String, default: "" },
    variant: { type: String, default: "body" },
  },
  setup(props: any) {
    return () => {
      const content = props.text;
      if (!content) return null;
      const styleMap: Record<string, any> = {
        h1: { fontSize: "20px", fontWeight: 700, margin: "0 0 12px" },
        h2: { fontSize: "17px", fontWeight: 600, margin: "0 0 8px" },
        h3: { fontSize: "15px", fontWeight: 600, margin: "0 0 6px" },
        body: { fontSize: "14px", margin: 0 },
      };
      const style = styleMap[props.variant ?? "body"] ?? styleMap.body;
      return <p style={style}>{content}</p>;
    };
  },
};

const TreeNode = {
  name: "TreeNode",
  props: {
    node: { type: Object, required: true },
    level: { type: Number, default: 0 },
    selectedKey: { type: String, default: "" },
    onFileClick: { type: Function, required: true },
  },
  setup(props: any) {
    const expanded = ref(false);

    return () => {
      const node = props.node as FileNode;
      const isFolder = node.type === "folder";
      const isSelected = props.selectedKey === node.key;
      const Self: any = TreeNode;

      const handleClick = () => {
        if (isFolder) {
          expanded.value = !expanded.value;
        } else {
          props.onFileClick(node);
        }
      };

      return (
        <div>
          <div
            onClick={handleClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 8px",
              cursor: "pointer",
              borderRadius: "6px",
              background: isSelected ? "#e6f4ff" : "transparent",
              borderLeft: `3px solid ${isSelected ? "#1677ff" : "transparent"}`,
              marginLeft: `${props.level * 12}px`,
              transition: "all 0.2s",
            }}
          >
            {isFolder ? (
              expanded.value ? (
                <FolderOpenOutlined style={{ color: "#faad14" }} />
              ) : (
                <FolderOutlined style={{ color: "#faad14" }} />
              )
            ) : (
              <FileOutlined style={{ color: "#1677ff" }} />
            )}
            <TypographyText style={{ flex: 1, fontSize: "13px" }}>{node.name}</TypographyText>
            {isFolder && node.children && (
              <TypographyText type="secondary" style={{ fontSize: "11px" }}>
                {node.children.length}
              </TypographyText>
            )}
          </div>
          {isFolder && expanded.value && node.children && (
            <div>
              {node.children.map(child => (
                <Self
                  key={child.key}
                  node={child}
                  level={props.level + 1}
                  selectedKey={props.selectedKey}
                  onFileClick={props.onFileClick}
                />
              ))}
            </div>
          )}
        </div>
      );
    };
  },
};

const FileTree = {
  name: "FileTree",
  props: {
    files: { type: Array, default: () => [] },
    action: { type: Object, default: undefined },
    onAction: { type: Function, default: undefined },
    selectedFile: { type: Object, default: undefined },
  },
  setup(props: any) {
    return () => {
      const treeData =
        props.files && props.files.length > 0 ? (props.files as FileNode[]) : PROJECT_FILES;
      const Tn: any = TreeNode;

      const handleFileClick = (file: FileNode) => {
        if (!props.action?.event?.name) return;
        const fileDetail: FileDetail = {
          name: file.name,
          path: file.key,
          size: file.size || 0,
          modified: file.modified || "",
          language: file.language || "Unknown",
          description: file.description || "",
        };

        const context: Record<string, any> = {};
        if (props.action.event.context) {
          Object.keys(props.action.event.context).forEach(key => {
            context[key] = fileDetail;
          });
        }

        props.onAction?.(props.action.event.name, context);
      };

      return (
        <div
          style={{
            borderRadius: "12px",
            border: "1px solid #e8e8e8",
            background: "#fff",
            maxHeight: "400px",
            overflow: "auto",
          }}
        >
          <div style={{ padding: "12px 8px" }}>
            {treeData.map(node => (
              <Tn
                key={node.key}
                node={node}
                level={0}
                selectedKey={props.selectedFile?.path}
                onFileClick={handleFileClick}
              />
            ))}
          </div>
        </div>
      );
    };
  },
};

const FileDetailCard = {
  name: "FileDetailCard",
  props: {
    file: { type: Object, default: undefined },
  },
  setup(props: any) {
    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getLanguageColor = (lang: string) => {
      const colors: Record<string, string> = {
        TypeScript: "#3178c6",
        JavaScript: "#f7df1e",
        HTML: "#e34c26",
        JSON: "#292929",
        Markdown: "#083fa1",
      };
      return colors[lang] || "#666";
    };

    return () => {
      const file = props.file as FileDetail | undefined;
      if (!file) return null;

      return (
        <Card
          size="small"
          title={
            <Space>
              <FileOutlined style={{ color: "#1677ff" }} />
              <TypographyText strong>{file.name}</TypographyText>
            </Space>
          }
          style={{ borderRadius: "12px" }}
          bodyStyle={{ padding: "16px" }}
        >
          <Space direction="vertical" size={12} style={{ width: "100%" }}>
            <div>
              <TypographyText type="secondary" style={{ fontSize: "12px" }}>
                Path
              </TypographyText>
              <br />
              <TypographyText code style={{ fontSize: "13px" }}>
                {file.path}
              </TypographyText>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              <div>
                <TypographyText type="secondary" style={{ fontSize: "12px" }}>
                  Size
                </TypographyText>
                <br />
                <TypographyText style={{ fontSize: "13px" }}>{formatSize(file.size)}</TypographyText>
              </div>
              <div>
                <TypographyText type="secondary" style={{ fontSize: "12px" }}>
                  Modified
                </TypographyText>
                <br />
                <TypographyText style={{ fontSize: "13px" }}>{file.modified}</TypographyText>
              </div>
            </div>

            <div>
              <TypographyText type="secondary" style={{ fontSize: "12px" }}>
                Language
              </TypographyText>
              <br />
              <Tag color={getLanguageColor(file.language)}>{file.language}</Tag>
            </div>

            {file.description && (
              <div>
                <TypographyText type="secondary" style={{ fontSize: "12px" }}>
                  Description
                </TypographyText>
                <br />
                <TypographyText style={{ fontSize: "13px" }}>{file.description}</TypographyText>
              </div>
            )}
          </Space>
        </Card>
      );
    };
  },
};

const AccordionPanel = {
  name: "AccordionPanel",
  props: {
    panels: { type: Array, default: () => [] },
  },
  setup(props: any) {
    const activeKey = ref<string | string[]>(["overview"]);

    return () => {
      const panelData =
        props.panels && props.panels.length > 0
          ? (props.panels as Array<{ id: string; title: string; content: string }>)
          : PANEL_DATA;

      const items = panelData.map((panel, index) => ({
        key: panel.id || String(index),
        label: (
          <Space>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
            <TypographyText strong>{panel.title}</TypographyText>
          </Space>
        ),
        children: (
          <TypographyText style={{ fontSize: "13px", whiteSpace: "pre-wrap" }}>
            {panel.content}
          </TypographyText>
        ),
        style: { marginBottom: "8px", borderRadius: "8px" },
      }));

      return (
        <div style={{ minWidth: "300px" }}>
          <Collapse
            accordion
            items={items}
            activeKey={activeKey.value}
            onChange={(val: any) => {
              activeKey.value = val;
            }}
            style={{ background: "#fff" }}
          />
        </div>
      );
    };
  },
};

const MainContainer = {
  name: "MainContainer",
  setup(_: any, { slots }: any) {
    return () => (
      <div
        style={{
          borderRadius: "16px",
          border: "1.5px solid #e8e8e8",
          padding: "20px",
          background: "#fff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          marginBlock: "16px",
          minWidth: "500px",
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size={16}>
          {slots.default?.()}
        </Space>
      </div>
    );
  },
};

function useStreamText(text: string) {
  const textRef = ref(0);
  const textIndex = ref(0);
  const textTimestamp = ref(0);
  const streamStatus = ref<"INIT" | "RUNNING" | "FINISHED">("INIT");
  let timer: ReturnType<typeof setInterval> | null = null;

  const run = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (textRef.value < text.length) {
        if (textTimestamp.value === 0) {
          textTimestamp.value = Date.now();
          streamStatus.value = "RUNNING";
        }
        textRef.value = Math.min(textRef.value + 3, text.length);
        textIndex.value = textRef.value;
      } else {
        streamStatus.value = "FINISHED";
        if (timer) clearInterval(timer);
      }
    }, 100);
  };

  const reset = () => {
    if (timer) clearInterval(timer);
    timer = null;
    textRef.value = 0;
    textTimestamp.value = 0;
    textIndex.value = 0;
    streamStatus.value = "INIT";
  };

  return {
    text: computed(() => text.slice(0, textIndex.value)),
    streamStatus,
    timestamp: textTimestamp,
    run,
    reset,
  };
}

const CreateCard = {
  version: "v0.9",
  createSurface: {
    surfaceId: "browser",
    catalogId: "local://coffee_booking_catalog.json",
  },
};

const UpdateCard = {
  version: "v0.9",
  updateComponents: {
    surfaceId: "browser",
    components: [
      { id: "title", component: "Text", text: "Project File Browser", variant: "h1" },
      {
        id: "file-tree",
        component: "FileTree",
        selectedFile: { path: "/browser/selectedFile" },
        action: {
          event: {
            name: "select_file",
            context: { selectedFile: { path: "/browser/selectedFile" } },
          },
        },
      },
      {
        id: "file-detail",
        component: "FileDetailCard",
        file: { path: "/browser/selectedFile" },
      },
      {
        id: "accordion-section",
        component: "AccordionPanel",
        panels: { path: "/browser/panels" },
      },
      {
        id: "root",
        component: "MainContainer",
        children: ["title", "file-tree", "file-detail", "accordion-section"],
      },
    ],
  },
};

const UpdateModel = {
  version: "v0.9",
  updateDataModel: {
    surfaceId: "browser",
    path: "/browser",
    value: { panels: PANEL_DATA },
  },
};

const card = ref<CardNode[]>([]);
const commandQueue = ref<any[]>([]);
const sessionKey = ref(0);

const onAgentCommand = (command: any) => {
  if ("createSurface" in command) {
    const surfaceId = command.createSurface.surfaceId;
    if (!card.value.some(c => c.id === surfaceId)) {
      card.value = [...card.value, { id: surfaceId, timestamp: Date.now() }];
    }
  } else if ("deleteSurface" in command) {
    card.value = card.value.filter(c => c.id !== command.deleteSurface.surfaceId);
  }
  commandQueue.value = [...commandQueue.value, command];
};

const handleAction = (payload: ActionPayload) => {
  if (payload.name === "select_file") {
    const { selectedFile } = payload.context || {};
    if (selectedFile) {
      onAgentCommand({
        version: "v0.9",
        updateDataModel: {
          surfaceId: "browser",
          path: "/browser/selectedFile",
          value: selectedFile,
        },
      });
    }
  }
};

const {
  text: textHeader,
  streamStatus: streamStatusHeader,
  timestamp: timestampHeader,
  run: runHeader,
  reset: resetHeader,
} = useStreamText(contentHeader);

const handleReload = () => {
  resetHeader();
  commandQueue.value = [
    ...commandQueue.value,
    { version: "v0.9", deleteSurface: { surfaceId: "browser" } },
  ];
  card.value = [];
  setTimeout(() => {
    sessionKey.value += 1;
    runHeader();
  }, 50);
};

const items = computed(() => [
  (() => {
    const textNodes = [{ text: textHeader.value, timestamp: timestampHeader.value }].filter(
      item => item.timestamp !== 0,
    );
    const hasRenderableContent = textNodes.length > 0 || card.value.length > 0;
    return {
      content: hasRenderableContent
        ? ({ texts: textNodes, card: card.value } as ContentType)
        : "",
      typing: false,
      role: "assistant",
      key: sessionKey.value,
    };
  })(),
]);

onMounted(() => {
  runHeader();
});

watch(
  () => streamStatusHeader.value,
  value => {
    if (value === "FINISHED") {
      onAgentCommand(CreateCard);
      onAgentCommand(UpdateCard);
      onAgentCommand(UpdateModel);
    }
  },
);

const components = {
  Text: TextComponent,
  FileTree,
  FileDetailCard,
  AccordionPanel,
  MainContainer,
};
</script>

<template>
  <div>
    <div style="margin-bottom: 16px">
      <Button type="primary" :icon="h(ReloadOutlined)" @click="handleReload">
        Reload
      </Button>
    </div>

    <XCardBox
      :key="sessionKey"
      :commands="commandQueue"
      :on-action="handleAction"
      :components="components"
    >
      <BubbleList :items="items" style="height: 700px" :role="role" />
    </XCardBox>
  </div>
</template>

<docs lang="zh-CN">
使用 XCard 实现 A2UI v0.9 协议的复杂交互与嵌套组件示例。演示了可展开的详情卡片、树形文件浏览器和手风琴折叠面板，配合 catalog 机制。
</docs>

<docs lang="en-US">
Complex interaction and nested components example implementing A2UI v0.9 protocol with XCard. Demonstrates expandable detail cards, tree file browser, and accordion folding panels with catalog mechanism.
</docs>
