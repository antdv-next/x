import { FastColor } from "@ant-design/fast-color";
import { theme } from "antdv-next";
import { describe, expect, it } from "vite-plus/test";

import type { AliasToken } from "../../theme/interface";
import type { ComponentToken } from "../style";

import { prepareComponentToken as prepareComponentTokenUnion } from "../style";

/**
 * `prepareComponentToken` is published as `GetDefaultToken` — a
 * `null | token | fn` union, because that is what `genStyleHooks` accepts.
 * This test only needs the callable branch.
 */
const prepareComponentToken = prepareComponentTokenUnion as (
  token: AliasToken,
) => ComponentToken;

/**
 * CodeHighlighter has two orthogonal theme axes:
 *
 * - the app theme (the `algorithm` handed to XProvider / ConfigProvider);
 * - the component `theme` prop, which only selects the shiki preview palette
 *   (`vitesse-light` / `vitesse-dark`).
 *
 * `prepareComponentToken` reads the app background (`token.colorBgContainer`)
 * to decide whether the app is dark, and derives a palette from global tokens
 * **only** when the app mode and the preview mode agree. Otherwise it pins the
 * values the shiki themes ship with: deriving a light preview palette from a
 * dark app (and vice versa) is what made the code unreadable in #172 / #174.
 */
describe("CodeHighlighter style tokens", () => {
  const lightToken = theme.getDesignToken({
    algorithm: theme.defaultAlgorithm,
  });
  const darkToken = theme.getDesignToken({ algorithm: theme.darkAlgorithm });

  it("detects a dark app from colorBgContainer (the branch input)", () => {
    expect(new FastColor(lightToken.colorBgContainer).isDark()).toBe(false);
    expect(new FastColor(darkToken.colorBgContainer).isDark()).toBe(true);
  });

  it("follows global tokens for a light preview in a light app", () => {
    const token = prepareComponentToken(lightToken);

    expect(token.colorBgTitle).toBe(lightToken.colorFillContent);
    expect(token.colorTextTitle).toBe(lightToken.colorText);
    expect(token.colorBorderCode).toBe(lightToken.colorBorderSecondary);
    expect(token.codeColor).toBe(lightToken.colorText);
    expect(token.codeBg).toBe(lightToken.colorBgLayout);
    expect(token.codeLineNumberColor).toBe(lightToken.colorTextQuaternary);
    expect(token.codeBtnColor).toBe(lightToken.colorTextSecondary);
    expect(token.codeBtnHoverBg).toBe(lightToken.colorFillSecondary);
    // A dark preview inside a light app stays pinned.
    expect(token.codeBgDark).toBe("#1e1e1e");
  });

  it("pins a light preview in a dark app, but follows tokens for a dark preview", () => {
    const token = prepareComponentToken(darkToken);

    expect(token.colorBgTitle).toBe("#f0f0f0");
    expect(token.colorTextTitle).toBe("rgba(0, 0, 0, 0.65)");
    expect(token.colorBorderCode).toBe("#f0f0f0");
    expect(token.codeColor).toBe("#393a34");
    expect(token.codeBg).toBe("#fafafa");
    expect(token.codeLineNumberColor).toBe("rgba(0, 0, 0, 0.25)");
    expect(token.codeBtnColor).toBe("rgba(0, 0, 0, 0.65)");
    expect(token.codeBtnHoverBg).toBe("rgba(0, 0, 0, 0.06)");
    // ...while the dark preview keeps following the dark app tokens.
    expect(token.colorBgTitleDark).toBe(darkToken.colorFillContent);
    expect(token.colorTextTitleDark).toBe(darkToken.colorText);
    expect(token.colorBorderCodeDark).toBe(darkToken.colorBorder);
    expect(token.codeColorDark).toBe(darkToken.colorText);
    expect(token.codeBgDark).toBe(darkToken.colorBgElevated);
    expect(token.codeLineNumberColorDark).toBe(darkToken.colorTextQuaternary);
    expect(token.codeBtnColorDark).toBe(darkToken.colorText);
    expect(token.codeBtnHoverBgDark).toBe(darkToken.colorFillSecondary);
  });
});
