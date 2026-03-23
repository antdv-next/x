import DOMPurify from "dompurify";
import { h, Fragment, type Component, type VNode } from "vue";

import type { RendererOptions, ComponentProps } from "../interface";

import { detectUnclosedComponentTags } from "./detectUnclosedComponentTags";

const DEFAULT_ANIMATION_DURATION = 300;

export class VueRenderer {
  private options: Required<RendererOptions>;

  constructor(options: RendererOptions = {}) {
    this.options = {
      components: options.components ?? {},
      enableAnimation: options.enableAnimation ?? true,
      animationConfig: {
        fadeDuration:
          options.animationConfig?.fadeDuration ?? DEFAULT_ANIMATION_DURATION,
        easing: options.animationConfig?.easing ?? "ease-out",
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
      ]),
    ];

    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: [
        "href",
        "src",
        "title",
        "target",
        "rel",
        "data-lang",
        "data-block",
        "data-state",
        "class",
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
      if (this.options.enableAnimation) {
        return this.wrapWithAnimation(text);
      }
      return h("span", text);
    }

    if (domNode.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = domNode as Element;
    const tagName = element.tagName.toLowerCase();

    if (tagName === "xmd-tail") {
      return h("span", { class: "xmd-tail" }, "▋");
    }

    const customComponent = this.options.components[tagName];
    if (customComponent) {
      const componentProps = this.extractComponentProps(
        element,
        tagName,
        unclosedTags,
      );
      return h(customComponent as Component, componentProps);
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

    if (tagName === "a") {
      const href = element.getAttribute("href");
      const target = element.getAttribute("target");
      const rel = element.getAttribute("rel");
      if (href) props.href = href;
      if (target) props.target = target;
      if (rel) props.rel = rel;
    } else if (tagName === "img") {
      const src = element.getAttribute("src");
      const alt = element.getAttribute("alt");
      const title = element.getAttribute("title");
      if (src) props.src = src;
      if (alt) props.alt = alt;
      if (title) props.title = title;
    } else if (tagName === "code") {
      const block = element.getAttribute("data-block");
      const lang = element.getAttribute("data-lang");
      const state = element.getAttribute("data-state");
      if (block) props.block = block === "true";
      if (lang) props.lang = lang;
      if (state) props.streamStatus = state;
    }

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
    return h(
      "span",
      {
        class: "xmd-animated-text",
        style: {
          "--fade-duration": `${this.options.animationConfig.fadeDuration}ms`,
          "--easing": this.options.animationConfig.easing,
        },
      },
      text,
    );
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
