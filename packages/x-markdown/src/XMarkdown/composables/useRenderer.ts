import type { VNode } from "vue";

import { shallowRef, type ShallowRef } from "vue";

import type { RendererOptions } from "../interface";

import { VueRenderer } from "../core/VueRenderer";

export function useRenderer(initialOptions?: RendererOptions) {
  const renderer: ShallowRef<VueRenderer | null> = shallowRef(null);

  function createRenderer(options?: RendererOptions): VueRenderer {
    return new VueRenderer(options);
  }

  function render(html: string, options?: RendererOptions): VNode {
    if (!renderer.value) {
      renderer.value = createRenderer(options || initialOptions);
    }

    if (options) {
      renderer.value.setOptions(options);
    }

    return renderer.value.render(html);
  }

  function resetRenderer(options?: RendererOptions): void {
    renderer.value = createRenderer(options);
  }

  return {
    renderer,
    render,
    resetRenderer,
  };
}
