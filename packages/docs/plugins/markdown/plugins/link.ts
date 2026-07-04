import type MarkdownIt from "markdown-it";

import { EXTERNAL_URL_RE } from "../shared";

/**
 * 让 markdown 中的外部链接在新标签页打开。
 *
 * 仅对带协议（http(s)://、mailto: 等）的外部链接生效，
 * 站内相对链接保持默认行为，避免影响路由内跳转与锚点导航。
 *
 * 已通过 `markdown-it-attrs` 等方式显式声明的 `target` / `rel`
 * 不会被覆盖，保留作者对单个链接的控制权。
 */
export function linkPlugin(md: MarkdownIt) {
  const defaultLinkRender =
    md.renderer.rules.link_open ||
    ((tokens, idx, options, _env, self) =>
      self.renderToken(tokens, idx, options));

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]!;
    const href = token.attrGet("href");

    if (href && EXTERNAL_URL_RE.test(href)) {
      if (!token.attrGet("target")) token.attrSet("target", "_blank");
      if (!token.attrGet("rel")) token.attrSet("rel", "noopener noreferrer");
    }

    return defaultLinkRender(tokens, idx, options, env, self);
  };
}
