import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const buildConfigPath = resolve(
  process.cwd(),
  "packages/x-pro/vite.build.config.ts",
);

/**
 * `defineComponent<Props>` 的类型参数只在编译期存在。没有 `tsxResolveTypes`，
 * 产物里不会声明运行时 props：属性会漏到根元素上，组件也读不到 `props.items`
 * 这类取值。文档站与单测都直接吃源码，所以只有 npm 消费者会遇到，CI 不会替我们
 * 发现——这里用一条针对构建配置的断言把它钉住。
 */
describe("x-pro build config", () => {
  it("resolves TSX prop types so the published package declares runtime props", () => {
    const source = readFileSync(buildConfigPath, "utf8");

    expect(source).toContain("tsxResolveTypes");
    expect(source).toContain('defaultPropsToUndefined: ["Boolean"]');
  });
});
