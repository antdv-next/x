import type { Component, PropType } from "vue";

import { defineComponent } from "vue";

import type { NodeRendererProps } from "./interface";
import type { XCardNode } from "./runtime/types";

import { validateComponentAgainstCatalog } from "./runtime/utils";
import { resolvePropsV08 } from "./runtime/v08";
import { resolvePropsV09 } from "./runtime/v09";

const XCardNodeRenderer = defineComponent({
  name: "AxCardNodeRenderer",
  props: {
    node: {
      type: Object as PropType<XCardNode>,
      required: true,
    },
    dataModel: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    components: {
      type: Object as PropType<Record<string, Component>>,
      required: true,
    },
    onAction: {
      type: Function as PropType<NodeRendererProps["onAction"]>,
      default: undefined,
    },
    onDataChange: {
      type: Function as PropType<NodeRendererProps["onDataChange"]>,
      default: undefined,
    },
    commandVersion: {
      type: String as PropType<"v0.8" | "v0.9">,
      default: "v0.9",
    },
    catalog: {
      type: Object as PropType<NodeRendererProps["catalog"]>,
      default: undefined,
    },
    getById: {
      type: Function as PropType<(id: string) => XCardNode | undefined>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      const { node } = props;

      const validation = validateComponentAgainstCatalog(
        props.catalog,
        node.type,
        node.props,
      );
      if (!validation.valid) {
        for (const err of validation.errors) {
          console.warn(err);
        }
      }

      const Component = props.components[node.type] as any;
      if (!Component) {
        console.warn(`XCard component "${node.type}" is not registered.`);
        return null;
      }

      const resolvedProps =
        props.commandVersion === "v0.8"
          ? resolvePropsV08(node.props, props.dataModel)
          : resolvePropsV09(node.props, props.dataModel);
      resolvedProps.onAction = (name: string, context: Record<string, any>) => {
        props.onAction?.(name, context, resolvedProps.action);
      };
      resolvedProps.onDataChange = props.onDataChange;

      const children = (node.children || [])
        .map(childId => ({ childId, childNode: props.getById(childId) }))
        .filter(item => Boolean(item.childNode))
        .map(item => (
          <XCardNodeRenderer
            key={item.childId}
            node={item.childNode as XCardNode}
            dataModel={props.dataModel}
            components={props.components}
            onAction={props.onAction}
            onDataChange={props.onDataChange}
            commandVersion={props.commandVersion}
            catalog={props.catalog}
            getById={props.getById}
          />
        ));

      return <Component {...resolvedProps}>{children}</Component>;
    };
  },
});

export default XCardNodeRenderer;
