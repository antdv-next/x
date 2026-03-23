import DOMPurify from "dompurify";
import { Marked } from "marked";

import type { ParserOptions } from "../interface";

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
      streamStatus: options.streamStatus ?? "done",
      codeBlockStatus: options.codeBlockStatus ?? {},
    };

    this.markdownInstance = new Marked();
    this.configureRenderers();
  }

  private configureRenderers() {
    const self = this;

    this.markdownInstance.use({
      renderer: {
        html(html: string): string {
          if (self.options.escapeRawHtml) {
            return escapeHtml(html);
          }
          return html;
        },

        link(
          href: string,
          title: string | null | undefined,
          text: string,
        ): string {
          const titleAttr = title ? ` title="${title}"` : "";
          const targetAttr = self.options.openLinksInNewTab
            ? ` target="_blank" rel="noopener noreferrer"`
            : "";
          return `<a href="${href}"${titleAttr}${targetAttr}>${text}</a>`;
        },

        paragraph(text: string): string {
          if (self.options.paragraphTag === "p") {
            return `<p>${text}</p>`;
          }
          return `<${self.options.paragraphTag}>${text}</${self.options.paragraphTag}>`;
        },

        code(
          code: string,
          infostring: string | undefined,
          escaped: boolean,
        ): string {
          const lang = infostring || "";
          const langAttr = lang ? ` data-lang="${lang}"` : "";
          const blockAttr = ' data-block="true"';
          const state = self.getCodeBlockState(lang);
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

  parse(markdown: string): string {
    let processed = markdown;

    if (this.options.protectCustomTags) {
      processed = this.protectCustomTags(processed);
    }

    if (this.options.escapeRawHtml) {
      processed = this.escapeRawHtml(processed);
    }

    const html = this.markedParse(processed);
    const sanitized = this.sanitize(html);

    if (this.injectTail) {
      return this.injectTailMarker(sanitized);
    }

    return sanitized;
  }

  private markedParse(markdown: string): string {
    return this.markdownInstance.parse(markdown) as string;
  }

  private sanitize(html: string): string {
    return DOMPurify.sanitize(html, {
      ADD_ATTR: ["target", "data-lang", "data-block", "data-state", "rel"],
      ADD_TAGS: ["xmd-tail"],
    });
  }

  private protectCustomTags(markdown: string): string {
    const customTagPattern =
      /<[A-Z][a-zA-Z0-9]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z0-9]*>/g;

    let result = markdown;
    let placeholderIndex = 0;

    result = result.replace(customTagPattern, match => {
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

    const textClosePattern = /<\/([a-z]+)>\s*$/;
    const match = html.match(textClosePattern);

    if (match) {
      const lastTag = match[1];
      const beforeClose = html.slice(0, html.lastIndexOf(`</${lastTag}>`));
      return `${beforeClose}${tailMarker}</${lastTag}>`;
    }

    return html + tailMarker;
  }

  setOptions(options: Partial<ParserOptions>): void {
    Object.assign(this.options, options);
  }
}
