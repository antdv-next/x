type MermaidDefault = typeof import("../../x/node_modules/mermaid/dist/mermaid.core.mjs")["default"];

let mermaidInstance: MermaidDefault | null = null;
let mermaidPromise: Promise<MermaidDefault> | null = null;
let pendingInitializeConfig: unknown | null = null;

async function loadMermaid(): Promise<MermaidDefault> {
  if (mermaidInstance) return mermaidInstance;
  if (!mermaidPromise) {
    mermaidPromise = import("../../x/node_modules/mermaid/dist/mermaid.core.mjs")
      .then(mod => mod.default)
      .then(instance => {
        mermaidInstance = instance;
        if (pendingInitializeConfig !== null) {
          instance.initialize(pendingInitializeConfig as never);
          pendingInitializeConfig = null;
        }
        return instance;
      });
  }
  return mermaidPromise;
}

const mermaidProxy: MermaidDefault = {
  initialize(config) {
    pendingInitializeConfig = config;
    void loadMermaid();
  },
  async parse(...args) {
    const instance = await loadMermaid();
    return instance.parse(...(args as never[]));
  },
  async render(...args) {
    const instance = await loadMermaid();
    return instance.render(...(args as never[]));
  },
} as MermaidDefault;

export default mermaidProxy;
