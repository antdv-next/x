import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createSSRApp, Fragment, h } from "vue";
import { renderToString } from "vue/server-renderer";

// Set env flags early so the cssinjs statistic mechanism is enabled without
// needing an external `cross-env` wrapper. `enableStatistic` in cssinjs-utils is
// evaluated once when that module loads, so the global MUST be set before any
// (transitive) import of cssinjs-utils.
process.env.NODE_ENV = "production";
process.env.CSSINJS_STATISTIC = "1";
(globalThis as any).CSSINJS_STATISTIC = true;

type RenderNode =
  | ReturnType<typeof h>
  | Array<ReturnType<typeof h> | null>
  | null;

type RenderFn = (component: any) => RenderNode;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../../");
const output = path.resolve(repoRoot, "packages/docs/src/assets/token.json");

let antd: Record<string, any> = {};
let statistic: Record<
  string,
  { global: string[]; component: Record<string, string | number> }
> = {};
let createCache: typeof import("@antdv-next/cssinjs").createCache;
let StyleProvider: typeof import("@antdv-next/cssinjs").StyleProvider;
let ConfigProvider: any;

// Components that cannot be safely rendered in SSR (heavy deps / static
// methods / sub-components whose styles are already covered by their parent).
const blackList = [
  "Mermaid",
  "CodeHighlighter",
  "XProvider",
  "Notification",
  "XNotification",
  "SenderHeader",
  "SenderSwitch",
  "ThoughtChainItem",
  "FileCardList",
  "ConversationsCreation",
  "BubbleList",
  "BubbleSystem",
  "BubbleDivider",
  "ActionsItem",
  "ActionsAudio",
  "ActionsCopy",
  "ActionsFeedback",
];

const ComponentCustomizeRender: Record<string, RenderFn> = {
  Welcome: Welcome => h(Welcome, { title: "Welcome", description: "desc" }),
  Prompts: Prompts => h(Prompts, { items: [] }),
  Suggestion: Suggestion => h(Suggestion, { items: [] }),
  Bubble: Bubble => h(Bubble, { content: "Hello" }),
  Conversations: Conversations => h(Conversations, { items: [] }),
  Sender: Sender => h(Sender),
  Attachments: Attachments => h(Attachments),
  Think: Think => h(Think),
  ThoughtChain: ThoughtChain => h(ThoughtChain, { items: [] }),
  FileCard: FileCard => h(FileCard, { name: "file.txt" }),
  Folder: Folder => h(Folder, { treeData: [] }),
  Sources: Sources => h(Sources, { items: [] }),
  Actions: Actions => h(Actions, { items: [] }),
};

function shouldRenderComponent(name: string) {
  if (blackList.includes(name)) return false;
  return name[0] === name![0]!.toUpperCase();
}

function isRenderableComponent(name: string, component: any) {
  if (!shouldRenderComponent(name)) return false;
  if (!component) return false;
  if (typeof component === "function") return true;
  if (typeof component === "object") {
    return Boolean(
      (component as any).render ||
      (component as any).setup ||
      (component as any).__asyncLoader,
    );
  }
  return false;
}

function normalizeRender(node: RenderNode): ReturnType<typeof h>[] {
  if (!node) return [];
  return Array.isArray(node)
    ? (node.filter(Boolean) as ReturnType<typeof h>[])
    : [node];
}

async function renderComponent(compName: string, component: any, theme: any) {
  const cache = createCache();
  const renderFunc = ComponentCustomizeRender[compName];
  const rendered = renderFunc ? renderFunc(component) : h(component);
  const nodes = normalizeRender(rendered);

  const app = createSSRApp({
    render: () =>
      h(
        ConfigProvider,
        { theme },
        {
          default: () =>
            h(
              StyleProvider,
              { cache, mock: "server" },
              { default: () => h(Fragment, null, nodes) },
            ),
        },
      ),
  });

  await renderToString(app);
}

function resetStatistic() {
  Object.keys(statistic).forEach(key => {
    delete statistic[key];
  });
}

async function collect(theme: any, label: string) {
  const components = Object.keys(antd).filter(
    name =>
      ComponentCustomizeRender[name] ||
      isRenderableComponent(name, (antd as any)[name]),
  );

  console.log(
    `\nCollecting token statistics (${label}): ${components.length} components`,
  );
  for (const name of components) {
    try {
      await renderComponent(name, (antd as any)[name], theme);
      process.stdout.write(`  ✓ ${name}\n`);
    } catch (error) {
      console.error(`  ✗ Failed to render ${name}`);
      console.error(error);
    }
  }
}

async function main() {
  if (process.env.CSSINJS_STATISTIC) {
    (globalThis as any).CSSINJS_STATISTIC = true;
  }

  const cssinjs = await import("@antdv-next/cssinjs");
  createCache = cssinjs.createCache;
  StyleProvider = cssinjs.StyleProvider;

  const cssinjsUtils = await import("@antdv-next/cssinjs/cssinjs-utils");
  statistic = cssinjsUtils.statistic;

  const antdvNext = await import("antdv-next");
  ConfigProvider = antdvNext.ConfigProvider;

  const antdModule = await import("../../dist/index.js");
  antd = antdModule;

  resetStatistic();
  await collect({ hashed: false }, "default");
  await collect({ hashed: false, token: { wireframe: true } }, "wireframe");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(statistic, null, 2), "utf8");
  console.log(
    `\nCollected token statistics successfully, check it in ${output}`,
  );
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
