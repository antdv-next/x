import type { Token, Tokens } from "marked";

import { Marked, Tokenizer } from "marked";

import type { MarkedConfig, ParserOptions } from "../interface";

const escapeReplacements: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};
const ATTRIBUTE_ENTITY_RE = /&(?!(?:#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|\w+);)/g;
const CJK_WRAPPER_TRAILING_PUNCTUATION = /^[，。！？；：、]/u;

export function escapeHtml(html: string): string {
  if (/[&<>"']/.test(html)) {
    return html.replace(/[&<>"']/g, ch => escapeReplacements[ch] || ch);
  }
  return html;
}

function escapeMarkdownAttribute(value: string): string {
  return value
    .replace(ATTRIBUTE_ENTITY_RE, "&amp;")
    .replace(/["<>]/g, ch => escapeReplacements[ch]);
}

/**
 * 不再猜测一般裸链接的结尾：`/路径，详情` 既可能是完整路径，也可能是正文。
 * `new URL()` 只能验证候选地址，不能判断作者意图；按标点继续细分会误截合法的
 * 域名、路径或查询串。仅识别 `（URL），正文` 这类外层配对，其余沿用 marked。
 * 需要明确边界时，生成 `[链接文字](URL)`。详见 `memory/x-markdown.md`。
 */
function trimCjkAutolinkWrapper(token: Tokens.Link, src: string): Tokens.Link {
  let depth = 1;
  for (let index = 0; index < token.raw.length; index += 1) {
    if (token.raw[index] === "（") {
      depth += 1;
    } else if (token.raw[index] === "）" && --depth === 0) {
      if (!CJK_WRAPPER_TRAILING_PUNCTUATION.test(src.charAt(index + 1))) break;

      const raw = token.raw.slice(0, index);
      const href = token.href.slice(
        0,
        token.href.length - token.raw.length + index,
      );
      try {
        new URL(href);
      } catch {
        break;
      }

      return {
        ...token,
        raw,
        text: raw,
        href,
        tokens: [{ type: "text", raw, text: raw }],
      };
    }
  }
  return token;
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

    this.markdownInstance = this.createMarkedInstance();
  }

  private createMarkedInstance(): Marked {
    const instance = new Marked();
    const bareAutolinks = new WeakSet<Tokens.Link>();
    // 先挂载 CJK 裸链接截断，再应用用户的 `options.config`，确保用户自定义的
    // `config.tokenizer.url` 始终优先被调用，只有在返回 `false` 时才回退到这里。
    this.configureBareAutolinks(instance, bareAutolinks);
    instance.use(this.options.config);
    this.configureRenderers(instance, bareAutolinks);
    return instance;
  }

  private updateMarkedConfig(config: MarkedConfig): void {
    this.options.config = {
      ...this.options.config,
      ...config,
    };
    this.markdownInstance = this.createMarkedInstance();
  }

  /**
   * `url()` 只看到 URL 开头的剩余输入。行内扩展提供同一次分词的左侧文本，
   * 但不消费输入：仅 `（URL），正文` 这类外层配对形式改动 marked 的裸链接。
   */
  private configureBareAutolinks(
    instance: Marked,
    bareAutolinks: WeakSet<Tokens.Link>,
  ) {
    const wrappedSources = new WeakMap<Tokenizer["lexer"], string>();
    instance.use({
      extensions: [
        {
          name: "cjkAutolinkContext",
          level: "inline",
          tokenizer(src, tokens) {
            const previous = tokens.at(-1);
            if (previous?.type === "text" && previous.raw.endsWith("（")) {
              wrappedSources.set(this.lexer, src);
            } else {
              wrappedSources.delete(this.lexer);
            }
            return undefined;
          },
        },
      ],
      tokenizer: {
        url(src) {
          const token = Tokenizer.prototype.url.call(this, src);
          if (!token) return undefined;

          const link =
            wrappedSources.get(this.lexer) === src
              ? trimCjkAutolinkWrapper(token, src)
              : token;
          bareAutolinks.add(link);
          return link;
        },
      },
    });
  }

  private configureRenderers(
    instance: Marked,
    bareAutolinks: WeakSet<Tokens.Link>,
  ) {
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

    instance.use({
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
          const bare = bareAutolinks.has(token);
          const href = bare
            ? escapeHtml(token.href)
            : escapeMarkdownAttribute(token.href);
          const titleAttr = token.title
            ? ` title="${escapeMarkdownAttribute(token.title)}"`
            : "";
          const targetAttr = options.openLinksInNewTab
            ? ` target="_blank" rel="noopener noreferrer"`
            : "";
          const text = bare
            ? escapeHtml(token.text)
            : markedParseInline(this, token.tokens);
          return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
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

  /**
   * Block-lex `markdown` with the same marked configuration this parser
   * renders with **and the same preprocessing** — the streaming section
   * splitter uses it to decide whether a `#` line really starts a new
   * top-level block, so the splitter and the renderer can never disagree.
   * Lexing the raw source instead would ask the two about different documents:
   * `protectCustomTags` deletes whole regions the renderer never sees, and
   * `escapeRawHtml` turns tags into text, either of which moves a heading or a
   * definition across a boundary. `config.extensions` (the bundled LaTeX
   * plugin's `$$` rule) come along through `markdownInstance`.
   */
  lex(markdown: string): readonly Token[] {
    return this.markdownInstance.lexer(this.preprocess(markdown));
  }

  parse(markdown: string, parseOptions?: { injectTail?: boolean }): string {
    this.injectTail = parseOptions?.injectTail ?? false;

    const processed = this.preprocess(markdown);

    this.prepareCodeBlockStates(processed);
    const html = this.markedParse(processed);

    if (this.injectTail) {
      return this.injectTailMarker(html);
    }

    return html;
  }

  /** Everything `parse` does to the source before marked sees it. */
  private preprocess(markdown: string): string {
    let processed = markdown;

    if (this.options.protectCustomTags) {
      processed = this.protectCustomTags(processed);
    }

    if (this.options.escapeRawHtml) {
      processed = this.escapeRawHtml(processed);
    }

    return processed;
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
