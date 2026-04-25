import type { PropType } from "vue";

import { defineComponent, inject, ref, watch } from "vue";

import type { XCardCardProps } from "./interface";
import type { XCardCommand, XCardNode } from "./runtime/types";

import { XCardContextKey } from "./context";
import XCardNodeRenderer from "./NodeRenderer";
import { createComponentTransformer } from "./runtime/transformer";
import { setValueByPath } from "./runtime/utils";
import { applyDataModelUpdateV08, extractDataUpdatesV08 } from "./runtime/v08";
import { extractDataUpdatesV09 } from "./runtime/v09";

const XCard = defineComponent({
  name: "AxCard",
  props: {
    id: {
      type: String as PropType<XCardCardProps["id"]>,
      required: true,
    },
  },
  setup(props) {
    const context = inject(XCardContextKey, null);

    const rootNode = ref<XCardNode | null>(null);
    const dataModel = ref<Record<string, any>>({});
    const commandVersion = ref<"v0.8" | "v0.9">("v0.9");
    const activeRootId = ref("root");
    const pendingRootId = ref<string | null>(null);
    const transformer = createComponentTransformer();

    watch(
      () => context?.commandQueue.value.length || 0,
      () => {
        if (!context) return;

        const allCommands = context.commandQueue.value;
        const cardCommands = allCommands.filter(cmdBelongsToCard(props.id));

        let nextRoot = rootNode.value;
        let nextDataModel = dataModel.value;
        let nextVersion = commandVersion.value;
        let nextRootId = activeRootId.value;
        let nextPendingRootId = pendingRootId.value;

        for (const cmd of cardCommands) {
          if ("version" in cmd && cmd.version === "v0.9") {
            nextVersion = "v0.9";
          }

          if ("updateComponents" in cmd) {
            const tree = transformer.transform(
              cmd.updateComponents.components,
              "v0.9",
            );
            if (tree) {
              nextRoot = tree;
              nextRootId = "root";
            }
          }

          if ("updateDataModel" in cmd) {
            const { path, value } = cmd.updateDataModel;
            nextDataModel = setValueByPath(nextDataModel, path, value);
          }

          if ("surfaceUpdate" in cmd) {
            nextVersion = "v0.8";
            transformer.transform(cmd.surfaceUpdate.components, "v0.8");

            const rootToRender = nextPendingRootId || nextRootId;
            const currentRoot = transformer.getById(rootToRender);
            if (currentRoot) {
              nextRoot = currentRoot;
              nextRootId = rootToRender;
              nextPendingRootId = null;
            }
          }

          if ("dataModelUpdate" in cmd) {
            nextVersion = "v0.8";
            nextDataModel = applyDataModelUpdateV08(
              nextDataModel,
              cmd.dataModelUpdate.contents,
            );
          }

          if ("beginRendering" in cmd) {
            nextVersion = "v0.8";
            const { root } = cmd.beginRendering;
            const tree = transformer.getById(root);
            nextPendingRootId = root;
            if (tree) {
              nextRoot = tree;
              nextRootId = root;
              nextPendingRootId = null;
            }
          }

          if ("deleteSurface" in cmd) {
            transformer.reset();
            nextRoot = null;
            nextDataModel = {};
            nextVersion = "v0.9";
            nextRootId = "root";
            nextPendingRootId = null;
          }
        }

        rootNode.value = nextRoot;
        dataModel.value = nextDataModel;
        commandVersion.value = nextVersion;
        activeRootId.value = nextRootId;
        pendingRootId.value = nextPendingRootId;
      },
      { immediate: true },
    );

    const handleAction = (
      name: string,
      eventContext: Record<string, any>,
      actionConfig?: any,
    ) => {
      const updates =
        commandVersion.value === "v0.8"
          ? extractDataUpdatesV08(actionConfig, eventContext)
          : extractDataUpdatesV09(actionConfig, eventContext);
      if (updates.length > 0) {
        dataModel.value = updates.reduce((prev, { path, value }) => {
          return setValueByPath(prev, path, value);
        }, dataModel.value);
      }

      context?.onAction?.({
        name,
        surfaceId: props.id,
        context: { ...eventContext },
        actionConfig,
      });
    };

    const handleDataChange = (path: string, value: any) => {
      dataModel.value = setValueByPath(dataModel.value, path, value);
    };

    return () => {
      if (!context || !rootNode.value) return null;

      const catalogId = context.surfaceCatalogMap.value.get(props.id);
      const catalog = catalogId
        ? context.catalogMap.value.get(catalogId)
        : undefined;

      return (
        <div class="x-card" style={{ display: "contents" }}>
          <XCardNodeRenderer
            node={rootNode.value}
            dataModel={dataModel.value}
            components={context.components.value}
            onAction={handleAction}
            onDataChange={handleDataChange}
            commandVersion={commandVersion.value}
            catalog={catalog}
            getById={id => transformer.getById(id)}
          />
        </div>
      );
    };
  },
});

function cmdBelongsToCard(surfaceId: string) {
  return (cmd: XCardCommand) => {
    if ("createSurface" in cmd)
      return cmd.createSurface.surfaceId === surfaceId;
    if ("updateComponents" in cmd)
      return cmd.updateComponents.surfaceId === surfaceId;
    if ("updateDataModel" in cmd)
      return cmd.updateDataModel.surfaceId === surfaceId;
    if ("surfaceUpdate" in cmd)
      return cmd.surfaceUpdate.surfaceId === surfaceId;
    if ("dataModelUpdate" in cmd)
      return cmd.dataModelUpdate.surfaceId === surfaceId;
    if ("beginRendering" in cmd)
      return cmd.beginRendering.surfaceId === surfaceId;
    if ("deleteSurface" in cmd)
      return cmd.deleteSurface.surfaceId === surfaceId;
    return false;
  };
}

export default XCard;
