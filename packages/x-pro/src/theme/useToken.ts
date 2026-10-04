import type { Theme } from "@antdv-next/cssinjs";
import type {
  AliasToken,
  GlobalToken,
  SeedToken,
} from "antdv-next/theme/internal";
import type { Ref } from "vue";

import { useToken as useAntdToken } from "antdv-next/theme/internal";

export type DesignTokenCssVar = {
  prefix?: string;
  key?: string;
};

/**
 * 读取宿主 `ConfigProvider` 的 token 与 cssVar。
 *
 * 与 `@antdv-next/x`（`components/theme/useToken.ts`）一致：只取前五项，刻意不透出
 * `zeroRuntime`。`zeroRuntime` 只覆盖 antdv-next 预构建的 `antd.css`，其中并不包含
 * x-pro 的样式，透出去会让组件在开启零运行时的宿主里彻底失去样式。
 *
 * 注意 antd `useToken` 声明中的命名与取值是错位的：第 2 项是原始 token，
 * 第 4 项才是把值替换成 `var(--ant-*)` 的 token，这里按取值语义命名。
 */
export function useInternalToken(): [
  Ref<Theme<SeedToken, AliasToken>>,
  Ref<GlobalToken>,
  Ref<string>,
  Ref<GlobalToken>,
  Ref<DesignTokenCssVar | undefined>,
] {
  const [theme, realToken, hashId, token, cssVar] = useAntdToken();

  return [theme, realToken, hashId, token, cssVar];
}
