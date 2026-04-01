import type { MermaidConfig } from "mermaid";

type MermaidInstance =
  (typeof import("mermaid/dist/mermaid.core.mjs"))["default"];

let mermaidInstance: MermaidInstance | null = null;
let mermaidPromise: Promise<MermaidInstance> | null = null;
let pendingInitializeConfig: MermaidConfig | null = null;

async function loadMermaid(): Promise<MermaidInstance> {
  if (mermaidInstance) return mermaidInstance;
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid/dist/mermaid.core.mjs")
      .then(mod => mod.default)
      .then(instance => {
        mermaidInstance = instance;
        if (pendingInitializeConfig) {
          instance.initialize(pendingInitializeConfig);
          pendingInitializeConfig = null;
        }
        return instance;
      });
  }
  return mermaidPromise;
}

export function initializeMermaid(config: MermaidConfig) {
  pendingInitializeConfig = config;
  if (mermaidInstance) {
    mermaidInstance.initialize(config);
    pendingInitializeConfig = null;
    return;
  }
  void loadMermaid();
}

export async function parseMermaid(
  content: string,
  options?: Parameters<MermaidInstance["parse"]>[1],
) {
  const mermaid = await loadMermaid();
  return mermaid.parse(content, options as never);
}

export async function renderMermaid(
  id: string,
  content: string,
  container?: Element,
) {
  const mermaid = await loadMermaid();
  return mermaid.render(id, content, container);
}
