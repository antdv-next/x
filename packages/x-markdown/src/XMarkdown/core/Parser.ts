import type { Tokens } from "marked";

import { Marked } from "marked";

import type { MarkedConfig, ParserOptions } from "../interface";

const escapeReplacements: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(html: string): string {
  if (/[&<>"']/.test(html)) {
    return html.replace(/[&<>"']/g, ch => escapeReplacements[ch] || ch);
  }
  return html;
}

export class Parser {
  private static readonly COMPLETE_FENCED_CODE =
    /^ {0,3}(`{3,}|~{3,})([\s\S]*?)\n {0,3}\1[ \n\t]*$/;

  private options: Required<ParserOptions>;
  private markdownInstance: Marked;
  private injectTail = false;
  private codeBlockStates: Array<"loading" | "done"> = [];
  private codeBlockStateIndex = 0;

  constructor(options: ParserOptions = {}) {
    this.options = {
      openLinksInNewTab: options.openLinksInNewTab ?? true,
      paragraphTag: options.paragraphTag ?? "p",
      injectTail: options.injectTail ?? false,
      protectCustomTags: options.protectCustomTags ?? true,
      escapeRawHtml: options.escapeRawHtml ?? false,
      config: {
        gfm: true,
        ...options.config,
      },
      components: options.components ?? {},
      streamStatus: options.streamStatus ?? "done",
      codeBlockStatus: options.codeBlockStatus ?? {},
    };

    this.markdownInstance = new Marked(this.options.config);
    this.configureRenderers();
  }

  private updateMarkedConfig(config: MarkedConfig): void {
    this.options.config = {
      ...this.options.config,
      ...config,
    };
    this.markdownInstance = new Marked(this.options.config);
    this.configureRenderers();
  }

  private configureRenderers() {
    const options = this.options;
    const consumeCodeBlockState = (lang: string): "loading" | "done" =>
      this.consumeCodeBlockState(lang);
    // 自定义渲染器在解析时会被绑定到 marked 内部 Renderer 实例（其 `parser`
    // 字段指向当前 marked Parser），行内 token 需通过该实例解析
    const markedParseInline = (
      renderer: unknown,
      tokens: Tokens.Generic[] | undefined,
    ): string => {
      const parser = (
        renderer as {
          parser?: { parseInline: (t: Tokens.Generic[]) => string };
        }
      ).parser;
      return parser ? parser.parseInline(tokens ?? []) : "";
    };

    this.markdownInstance.use({
      renderer: {
        // marked v13 起渲染器统一改收 token 对象（v14 移除旧的多参签名）；
        // 方法简写保证 `this` 指向 marked 内部 Renderer 实例
        html(token: Tokens.HTML | Tokens.Tag): string {
          if (options.escapeRawHtml) {
            return escapeHtml(token.text);
          }
          return token.text;
        },

        link(token: Tokens.Link): string {
          const titleAttr = token.title ? ` title="${token.title}"` : "";
          const targetAttr = options.openLinksInNewTab
            ? ` target="_blank" rel="noopener noreferrer"`
            : "";
          return `<a href="${token.href}"${titleAttr}${targetAttr}>${markedParseInline(this, token.tokens)}</a>`;
        },

        paragraph(token: Tokens.Paragraph): string {
          const text = markedParseInline(this, token.tokens);
          if (options.paragraphTag === "p") {
            return `<p>${text}</p>`;
          }
          return `<${options.paragraphTag}>${text}</${options.paragraphTag}>`;
        },

        code(token: Tokens.Code): string {
          const lang = token.lang || "";
          const langAttr = lang ? ` data-lang="${lang}"` : "";
          const blockAttr = ' data-block="true"';
          const state = consumeCodeBlockState(lang);
          const stateAttr = ` data-state="${state}"`;
          return `<pre><code class="language-${lang}"${langAttr}${blockAttr}${stateAttr}>${escapeHtml(token.text)}</code></pre>`;
        },
      },
    });
  }

  private prepareCodeBlockStates(markdown: string): void {
    this.codeBlockStates = [];
    this.codeBlockStateIndex = 0;

    const tokens = this.markdownInstance.lexer(markdown) as unknown[];

    const walkTokens = (nodes: unknown[]): void => {
      for (const node of nodes) {
        if (!node || typeof node !== "object") {
          continue;
        }

        const token = node as Record<string, unknown>;
        if (token.type === "code") {
          const lang = typeof token.lang === "string" ? token.lang : "";
          const codeBlockStyle =
            typeof token.codeBlockStyle === "string"
              ? token.codeBlockStyle
              : "";
          const raw = typeof token.raw === "string" ? token.raw : "";

          const inferredState: "loading" | "done" =
            codeBlockStyle === "indented" ||
            Parser.COMPLETE_FENCED_CODE.test(raw)
              ? "done"
              : "loading";

          this.codeBlockStates.push(
            this.options.codeBlockStatus[lang] ?? inferredState,
          );
        }

        const childTokens = token.tokens;
        if (Array.isArray(childTokens)) {
          walkTokens(childTokens);
        }

        const items = token.items;
        if (Array.isArray(items)) {
          for (const item of items) {
            if (!item || typeof item !== "object") {
              continue;
            }

            const itemTokens = (item as Record<string, unknown>).tokens;
            if (Array.isArray(itemTokens)) {
              walkTokens(itemTokens);
            }
          }
        }
      }
    };

    walkTokens(tokens);
  }

  private consumeCodeBlockState(lang: string): "loading" | "done" {
    const nextState = this.codeBlockStates[this.codeBlockStateIndex];
    this.codeBlockStateIndex += 1;
    return nextState ?? this.getCodeBlockState(lang);
  }

  private getCodeBlockState(lang: string): "loading" | "done" {
    return this.options.codeBlockStatus[lang] ?? this.options.streamStatus;
  }

  parse(markdown: string, parseOptions?: { injectTail?: boolean }): string {
    this.injectTail = parseOptions?.injectTail ?? false;
    let processed = markdown;

    if (this.options.protectCustomTags) {
      processed = this.protectCustomTags(processed);
    }

    if (this.options.escapeRawHtml) {
      processed = this.escapeRawHtml(processed);
    }

    this.prepareCodeBlockStates(processed);
    const html = this.markedParse(processed);

    if (this.injectTail) {
      return this.injectTailMarker(html);
    }

    return html;
  }

  private markedParse(markdown: string): string {
    return this.markdownInstance.parse(markdown) as string;
  }

  private protectCustomTags(markdown: string): string {
    const customTagPattern =
      /<[A-Z][a-zA-Z0-9]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g;

    let result = markdown;
    let placeholderIndex = 0;

    result = result.replace(customTagPattern, () => {
      const placeholder = `__CUSTOM_TAG_${placeholderIndex}__`;
      placeholderIndex++;
      return placeholder;
    });

    return result;
  }

  private escapeRawHtml(markdown: string): string {
    const htmlTagPattern = /<[^>]+>/g;
    return markdown.replace(htmlTagPattern, match => {
      return escapeHtml(match);
    });
  }

  private injectTailMarker(html: string): string {
    const tailMarker = "<xmd-tail></xmd-tail>";

    if (html.includes(tailMarker)) {
      return html;
    }

    const container = document.createElement("div");
    container.innerHTML = html;

    const findLastMeaningfulNode = (root: Node): Node | null => {
      const children = Array.from(root.childNodes);
      for (let i = children.length - 1; i >= 0; i--) {
        const node = children[i];
        if (node.nodeType === Node.TEXT_NODE) {
          if ((node.textContent || "").trim()) {
            return node;
          }
          continue;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        const nested = findLastMeaningfulNode(node);
        if (nested) {
          return nested;
        }

        return node;
      }
      return null;
    };

    const lastMeaningfulNode = findLastMeaningfulNode(container);

    if (!lastMeaningfulNode || lastMeaningfulNode.nodeType !== Node.TEXT_NODE) {
      return html;
    }

    const marker = document.createElement("xmd-tail");
    lastMeaningfulNode.parentNode?.insertBefore(
      marker,
      lastMeaningfulNode.nextSibling,
    );

    return container.innerHTML;
  }

  setOptions(options: Partial<ParserOptions>): void {
    const { config, ...rest } = options;
    Object.assign(this.options, rest);

    if (config) {
      this.updateMarkedConfig(config);
    }
  }
}
