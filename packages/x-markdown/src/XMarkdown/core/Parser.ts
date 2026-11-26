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

export function escapeHtml(html: string): string {
  if (/[&<>"']/.test(html)) {
    return html.replace(/[&<>"']/g, ch => escapeReplacements[ch] || ch);
  }
  return html;
}

const CJK_AUTOLINK_BOUNDARY = /[），。！？；：、》」』】〕〉”’…]/u;
// 引号在正文里是标点而非 URL 括号，只在主机名后作为边界，不参与配对保护。
const CJK_HOST_OPEN_BOUNDARY = /[（《「『【〔〈“‘]/u;
// 开括号到对应收尾字符的映射：URL 路径中成对出现时内部标点属于链接。
const CJK_BRACKET_PAIRS: Record<string, string> = {
  "（": "）",
  "《": "》",
  "「": "」",
  "『": "』",
  "【": "】",
  "〔": "〕",
  "〈": "〉",
};
const CJK_CHAR =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;
const AUTOLINK_SCHEME_RE = /^(?:(?:https?|ftp):\/\/|www\.)/i;

function findCjkAutolinkBoundary(raw: string): number {
  const schemeMatch = AUTOLINK_SCHEME_RE.exec(raw);
  if (!schemeMatch) {
    return -1;
  }

  const schemeEnd = schemeMatch[0].length;
  let pathStart = raw.length;
  for (let index = schemeEnd; index < raw.length; index += 1) {
    const ch = raw[index];
    if (ch === "/" || ch === "?" || ch === "#") {
      pathStart = index;
      break;
    }
  }

  // 只有路径/查询/片段内配对成功的中文括号区间才受保护；
  // 主机名后紧跟的开括号（如 `https://a.com（文档站）。`）和未配对的开括号均不保护后续正文。
  const matchedParens = new Map<number, number>();
  const openBrackets: Array<{ index: number; close: string }> = [];
  for (let index = pathStart; index < raw.length; index += 1) {
    const character = raw[index];
    const expectedClose = CJK_BRACKET_PAIRS[character];
    if (expectedClose) {
      openBrackets.push({ index, close: expectedClose });
    } else if (
      openBrackets.length > 0 &&
      openBrackets.at(-1)!.close === character
    ) {
      matchedParens.set(openBrackets.pop()!.index, index);
    }
  }

  let asciiOpenParens = 0;
  let asciiOpenBrackets = 0;
  let asciiOpenBraces = 0;
  for (let index = schemeEnd; index < raw.length; index += 1) {
    const character = raw[index];
    const closeIndex = matchedParens.get(index);
    if (closeIndex !== undefined) {
      // 跳到配对右括号之后，其间的标点属于链接本身
      index = closeIndex;
      continue;
    }

    if (CJK_AUTOLINK_BOUNDARY.test(character)) {
      return index;
    }

    if (index < pathStart && CJK_HOST_OPEN_BOUNDARY.test(character)) {
      return index;
    }

    const nextChar = raw[index + 1];
    const nextIsCjkChar = !!nextChar && CJK_CHAR.test(nextChar);
    const nextIsCjkOrPunct =
      nextIsCjkChar || (!!nextChar && CJK_AUTOLINK_BOUNDARY.test(nextChar));
    if (character === "(") {
      asciiOpenParens += 1;
    } else if (character === ")") {
      if (asciiOpenParens > 0) {
        asciiOpenParens -= 1;
      } else if (nextIsCjkChar) {
        return index;
      }
    } else if (character === "[") {
      asciiOpenBrackets += 1;
    } else if (character === "]") {
      if (asciiOpenBrackets > 0) {
        asciiOpenBrackets -= 1;
      } else if (nextIsCjkOrPunct) {
        return index;
      }
    } else if (character === "{") {
      asciiOpenBraces += 1;
    } else if (character === "}") {
      if (asciiOpenBraces > 0) {
        asciiOpenBraces -= 1;
      } else if (nextIsCjkOrPunct) {
        return index;
      }
    } else if (index < pathStart && character === ":" && nextIsCjkChar) {
      // 主机名里的 `:` 后面直接跟汉字时不是端口，属于正文；路径/查询/片段里的
      // ASCII 结构字符（`.` `?` `,` `~` 等）即使是正文标点也不能猜，交给 marked。
      return index;
    }
  }

  return -1;
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
    // 先挂载 CJK 裸链接截断，再应用用户的 `options.config`，确保用户自定义的
    // `config.tokenizer.url` 始终优先被调用，只有在返回 `false` 时才回退到这里。
    this.configureCjkAutolinks(instance);
    instance.use(this.options.config);
    this.configureRenderers(instance);
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
   * marked 的 GFM 裸链接（`url` token）只在空白或 `<` 处结束，中文正文里紧跟
   * URL 的标点以及其后的正文会被一起并进链接。这里在 marked 自己的 `url`
   * tokenizer 之后按 CJK 边界截断并重跑 `Tokenizer.prototype.url`，让 marked
   * 自行完成 `_backpedal` 尾部 ASCII 标点清理与 `www.` 前缀补全。
   * 路径/查询/片段里的 ASCII 字符即使是句子标点也不当作边界：猜错会截断合法
   * URL（IDN 主机、`?关键词`、`~用户`），而 CJK 收尾标点已足够覆盖正文。
   */
  private configureCjkAutolinks(instance: Marked) {
    instance.use({
      tokenizer: {
        url(src) {
          const token = Tokenizer.prototype.url.call(this, src);
          if (!token) {
            return false;
          }

          const boundaryIndex = findCjkAutolinkBoundary(token.raw);
          if (boundaryIndex < 0) {
            return false;
          }

          // 重跑 marked 原生 `url` tokenizer 以重新执行 `_backpedal` 和 `www.` 前缀处理。
          // 注意此处不能用 `?? false`：若截断后不再构成有效链接（如 `https://，继续`），
          // 返回 `undefined` 可阻止 marked 回退到未截断的默认 `url` tokenizer。
          return Tokenizer.prototype.url.call(
            this,
            token.raw.slice(0, boundaryIndex),
          );
        },
      },
    });
  }

  private configureRenderers(instance: Marked) {
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
          const href = token.href.replace(
            /["<>]/g,
            ch => escapeReplacements[ch] || ch,
          );
          const titleAttr = token.title
            ? ` title="${escapeHtml(token.title)}"`
            : "";
          const targetAttr = options.openLinksInNewTab
            ? ` target="_blank" rel="noopener noreferrer"`
            : "";
          return `<a href="${href}"${titleAttr}${targetAttr}>${markedParseInline(this, token.tokens)}</a>`;
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
