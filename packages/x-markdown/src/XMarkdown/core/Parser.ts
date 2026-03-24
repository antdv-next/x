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
  private options: Required<ParserOptions>;
  private markdownInstance: Marked;
  private injectTail = false;

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
    this.markdownInstance.use({
      renderer: {
        html: (html: string): string => {
          if (this.options.escapeRawHtml) {
            return escapeHtml(html);
          }
          return html;
        },

        link: (
          href: string,
          title: string | null | undefined,
          text: string,
        ): string => {
          const titleAttr = title ? ` title="${title}"` : "";
          const targetAttr = this.options.openLinksInNewTab
            ? ` target="_blank" rel="noopener noreferrer"`
            : "";
          return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
        },

        paragraph: (text: string): string => {
          if (this.options.paragraphTag === "p") {
            return `<p>${text}</p>`;
          }
          return `<${this.options.paragraphTag}>${text}</${this.options.paragraphTag}>`;
        },

        code: (
          code: string,
          infostring: string | undefined,
          escaped: boolean,
        ): string => {
          const lang = infostring || "";
          const langAttr = lang ? ` data-lang="${lang}"` : "";
          const blockAttr = ' data-block="true"';
          const state = this.getCodeBlockState(lang);
          const stateAttr = ` data-state="${state}"`;
          const escapedCode = escaped ? code : escapeHtml(code);
          return `<pre><code class="language-${lang}"${langAttr}${blockAttr}${stateAttr}>${escapedCode}</code></pre>`;
        },
      },
    });
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
