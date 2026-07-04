import type { MarkdownItAsync } from "markdown-it-async";

import { frontmatterPlugin } from "@mdit-vue/plugin-frontmatter";
import { headersPlugin } from "@mdit-vue/plugin-headers";
import { titlePlugin } from "@mdit-vue/plugin-title";
import { tocPlugin } from "@mdit-vue/plugin-toc";
import { slugify } from "@mdit-vue/shared";
import { fromAsyncCodeToHtml } from "@shikijs/markdown-it/async";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import anchorPlugin from "markdown-it-anchor";
import MarkdownIt from "markdown-it-async";
// @ts-expect-error markdown-it-attrs has no bundled types.
import attrsPlugin from "markdown-it-attrs";
// @ts-expect-error markdown-it-emoji has no proper types for this entry.
import { full as emoji } from "markdown-it-emoji";
import { codeToHtml } from "shiki";

import { containerPlugin } from "./plugins/container";
import { demoPlugin } from "./plugins/demo";
import { gitHubAlertsPlugin } from "./plugins/github-alerts";
import { imagePlugin } from "./plugins/image";
import { linkPlugin } from "./plugins/link";
import { preWrapperPlugin } from "./plugins/pre-wrapper";
import { stackblitzPlugin } from "./plugins/stackblitz";
import { tablePlugin } from "./plugins/table";

export interface CreateMarkdownOptions {
  withPlugin?: boolean;
  preConfig?: (md: MarkdownItAsync) => void;
  config?: (md: MarkdownItAsync) => void;
  root?: string;
}

export function loadShiki(md: MarkdownItAsync, cls = "ant-doc-code") {
  md.use(
    fromAsyncCodeToHtml(codeToHtml, {
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
      defaultColor: false,
      cssVariablePrefix: "--ant-doc-",
      transformers: [
        transformerMetaHighlight(),
        transformerMetaWordHighlight(),
        transformerNotationDiff(),
        transformerNotationErrorLevel(),
        transformerNotationFocus(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        {
          name: "remove:clean-up",
          code(element) {
            if (element.tagName === "code" && element.properties.class)
              delete element.properties.class;
          },
          pre(element) {
            delete element.properties.tabindex;
            delete element.properties.style;
            this.addClassToHast(element, cls);
          },
        },
      ],
    }),
  );
}

export function loadBaseMd(md: MarkdownItAsync) {
  md.use(frontmatterPlugin);
  md.use(headersPlugin, {
    level: [2, 3, 4, 5, 6],
    slugify,
  });
  md.use(titlePlugin);
  md.use(emoji);
  md.use(attrsPlugin);
  md.use(linkPlugin);
  md.use(containerPlugin);
  md.use(gitHubAlertsPlugin);
}

function withPlugins(md: MarkdownItAsync, options: CreateMarkdownOptions) {
  md.use(demoPlugin, {
    root: options.root,
  });
  loadBaseMd(md);
  md.use(tocPlugin);
  md.use(anchorPlugin, {
    slugify,
    permalink: anchorPlugin.permalink.linkInsideHeader({
      symbol: "&ZeroWidthSpace;",
      renderAttrs: (slug, state) => {
        const idx = state.tokens.findIndex(token => {
          const attrs = token.attrs;
          const id = attrs?.find(attr => attr[0] === "id");
          return id && slug === id[1];
        });
        const title = state.tokens[idx + 1]?.content || "";
        return {
          "aria-label": `Permalink to "${title}"`,
        };
      },
    }),
  });
  loadShiki(md);
  md.use(imagePlugin);
  md.use(preWrapperPlugin, {
    hasSingleTheme: false,
  });
  md.use(tablePlugin);
  md.use(stackblitzPlugin);
  md.linkify.set({ fuzzyLink: false });
}

export function createMarkdown() {
  let md: MarkdownItAsync | undefined;

  return (options: CreateMarkdownOptions = {}) => {
    if (md) return md;

    md = MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });

    options.preConfig?.(md);
    if (options.withPlugin !== false) withPlugins(md, options);
    options.config?.(md);

    return md;
  };
}

export const useMarkdown = createMarkdown();
