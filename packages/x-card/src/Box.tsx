import type { Component, PropType } from "vue";

import { computed, defineComponent, provide, ref, watch } from "vue";

import type { XCardBoxProps } from "./interface";
import type { Catalog, XCardCommand } from "./runtime/types";

import { loadCatalog } from "./catalog";
import { XCardContextKey } from "./context";

const XCardBox = defineComponent({
  name: "AxCardBox",
  props: {
    commands: {
      type: Array as PropType<XCardBoxProps["commands"]>,
      default: () => [],
    },
    components: {
      type: Object as PropType<Record<string, Component>>,
      default: () => ({}),
    },
    onAction: {
      type: Function as PropType<XCardBoxProps["onAction"]>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const catalogMap = ref<Map<string, Catalog>>(new Map());
    const surfaceCatalogMap = ref<Map<string, string>>(new Map());
    const commandQueue = ref<XCardCommand[]>([]);
    const processedCount = ref(0);

    watch(
      () => props.commands?.length || 0,
      async () => {
        const commands = props.commands || [];

        commandQueue.value = commands as XCardCommand[];

        if (commands.length < processedCount.value) {
          processedCount.value = 0;
        }

        const newCommands = commands.slice(processedCount.value);
        for (const cmd of newCommands) {
          if ("createSurface" in cmd) {
            const { surfaceId, catalogId } = cmd.createSurface;
            if (catalogId) {
              surfaceCatalogMap.value = new Map(surfaceCatalogMap.value).set(
                surfaceId,
                catalogId,
              );

              if (!catalogMap.value.has(catalogId)) {
                try {
                  const catalog = await loadCatalog(catalogId);
                  catalogMap.value = new Map(catalogMap.value).set(
                    catalogId,
                    catalog,
                  );
                } catch (error) {
                  console.error(
                    `Failed to load XCard catalog ${catalogId}:`,
                    error,
                  );
                }
              }
            }
          }

          if ("deleteSurface" in cmd) {
            const surfaceId = cmd.deleteSurface.surfaceId;
            if (surfaceCatalogMap.value.has(surfaceId)) {
              const nextMap = new Map(surfaceCatalogMap.value);
              nextMap.delete(surfaceId);
              surfaceCatalogMap.value = nextMap;
            }
          }
        }

        processedCount.value = commands.length;
      },
      { immediate: true },
    );

    provide(XCardContextKey, {
      commandQueue,
      components: computed(() => props.components || {}),
      onAction: props.onAction,
      catalogMap,
      surfaceCatalogMap,
    });

    return () => slots.default?.();
  },
});

export default XCardBox;
