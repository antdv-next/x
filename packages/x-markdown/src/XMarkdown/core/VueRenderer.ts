import DOMPurify from "dompurify";
import { h, Fragment, createTextVNode, type Component, type VNode } from "vue";

import type { RendererOptions, ComponentProps } from "../interface";

import AnimationText from "../components/AnimationText.vue";
import { detectUnclosedComponentTags } from "./detectUnclosedComponentTags";

const DEFAULT_ANIMATION_DURATION = 200;
const NON_WHITESPACE_REGEX = /[^\r\n\s]+/;
const MATHML_TAGS = [
  "math",
  "maction",
  "maligngroup",
  "malignmark",
  "menclose",
  "merror",
  "mfenced",
  "mfrac",
  "mglyph",
  "mi",
  "mlabeledtr",
  "mlongdiv",
  "mmultiscripts",
  "mn",
  "mo",
  "mover",
  "mpadded",
  "mphantom",
  "mprescripts",
  "mroot",
  "mrow",
  "ms",
  "mscarries",
  "mscarry",
  "msgroup",
  "msline",
  "mspace",
  "msqrt",
  "msrow",
  "mstack",
  "mstyle",
  "msub",
  "msup",
  "msubsup",
  "mtable",
  "mtd",
  "mtext",
  "mtr",
  "munder",
  "munderover",
  "semantics",
  "annotation",
  "annotation-xml",
] as const;

export class VueRenderer {
  private options: Required<RendererOptions>;

  constructor(options: RendererOptions = {}) {
    this.options = {
      components: options.components ?? {},
      enableAnimation: options.enableAnimation ?? true,
      animationConfig: {
        fadeDuration:
          options.animationConfig?.fadeDuration ?? DEFAULT_ANIMATION_DURATION,
        easing: options.animationConfig?.easing ?? "ease-in-out",
      },
    };
  }

  render(html: string): VNode {
    const sanitized = this.sanitize(html);
    const unclosedTags = detectUnclosedComponentTags(
      sanitized,
      Object.keys(this.options.components),
    );
    const nodes = this.parseToVNodes(sanitized, unclosedTags);
    if (nodes.length === 0) {
      return h("span", "");
    }
    if (nodes.length === 1) {
      return nodes[0];
    }
    return h(Fragment, nodes);
  }

  private sanitize(html: string): string {
    const allowedTags = [
      ...new Set([
        ...Object.keys(this.options.components),
        "p",
        "br",
        "span",
        "div",
        "a",
        "img",
        "ul",
        "ol",
        "li",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "blockquote",
        "pre",
        "code",
        "em",
        "strong",
        "del",
        "ins",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
        "hr",
        "xmd-tail",
        ...MATHML_TAGS,
      ]),
    ];

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: [
        "class",
        "style",
        "aria-hidden",
        "aria-label",
        "role",
        "xmlns",
        "encoding",
        "href",
        "src",
        "title",
        "alt",
        "target",
        "rel",
        "data-lang",
        "data-block",
        "data-state",
        "data-raw",
        "data-icon",
        "data-description",
        "icon",
        "description",
      ],
    });
  }

  private parseToVNodes(html: string, unclosedTags: Set<string>): VNode[] {
    const template = `<div>${html}</div>`;
    const container = document.createElement("div");
    container.innerHTML = template;

    const nodes: VNode[] = [];
    Array.from(container.childNodes).forEach(node => {
      const vnode = this.convertNode(node as Element, unclosedTags);
      if (vnode) {
        nodes.push(vnode);
      }
    });

    return nodes;
  }

  private convertNode(domNode: Node, unclosedTags: Set<string>): VNode | null {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const text = domNode.textContent || "";
      const parentTagName =
        domNode.parentNode instanceof Element
          ? domNode.parentNode.tagName.toLowerCase()
          : "";
      const isParentCustomComponent = Boolean(
        parentTagName && this.options.components[parentTagName],
      );
      const shouldAnimate =
        this.options.enableAnimation &&
        NON_WHITESPACE_REGEX.test(text) &&
        !isParentCustomComponent;

      if (shouldAnimate) {
        return this.wrapWithAnimation(text);
      }
      return createTextVNode(text);
    }

    if (domNode.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = domNode as Element;
    const tagName = element.tagName.toLowerCase();

    const customComponent = this.options.components[tagName];
    if (customComponent) {
      const componentProps = this.extractComponentProps(
        element,
        tagName,
        unclosedTags,
      );

      const children: VNode[] = [];
      Array.from(element.childNodes).forEach(child => {
        const childVNode = this.convertNode(child, unclosedTags);
        if (childVNode) {
          children.push(childVNode);
        }
      });

      if (children.length === 0) {
        return h(customComponent as Component, componentProps);
      }

      return h(customComponent as Component, componentProps, {
        default: () => children,
      });
    }

    if (tagName === "xmd-tail") {
      return h("span", { class: "xmd-tail" }, "▋");
    }

    return this.convertNativeElement(element, tagName, unclosedTags);
  }

  private convertNativeElement(
    element: Element,
    tagName: string,
    unclosedTags: Set<string>,
  ): VNode {
    const children: VNode[] = [];
    const props: Record<string, unknown> = {};

    Array.from(element.attributes).forEach(attr => {
      props[attr.name] = attr.value;
    });

    Array.from(element.childNodes).forEach(child => {
      const childVNode = this.convertNode(child, unclosedTags);
      if (childVNode) {
        children.push(childVNode);
      }
    });

    return h(tagName, props, children);
  }

  private extractComponentProps(
    element: Element,
    tagName: string,
    unclosedTags: Set<string>,
  ): ComponentProps {
    const props: ComponentProps = {};

    const instanceId = Array.from(unclosedTags).find(tag =>
      tag.startsWith(tagName),
    );
    props.streamStatus = instanceId ? "loading" : "done";

    Array.from(element.attributes).forEach(attr => {
      props[attr.name] = attr.value;
    });

    return props;
  }

  private wrapWithAnimation(text: string): VNode {
    return h(AnimationText, {
      text,
      fadeDuration: this.options.animationConfig.fadeDuration,
      easing: this.options.animationConfig.easing,
    });
  }

  setOptions(options: Partial<RendererOptions>): void {
    if (options.components) {
      this.options.components = {
        ...this.options.components,
        ...options.components,
      };
    }
    if (options.enableAnimation !== undefined) {
      this.options.enableAnimation = options.enableAnimation;
    }
    if (options.animationConfig) {
      this.options.animationConfig = {
        ...this.options.animationConfig,
        ...options.animationConfig,
      };
    }
  }
}
