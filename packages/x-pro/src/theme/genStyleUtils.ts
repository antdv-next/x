import type { ComponentTokenMap } from "antdv-next/theme/interface/components";
import type { AliasToken, SeedToken } from "antdv-next/theme/internal";

import { genStyleUtils } from "@antdv-next/cssinjs/cssinjs-utils";
import { useConfig } from "antdv-next/config-provider/context";
import { computed } from "vue";

import { useInternalToken } from "./useToken";

/**
 * x-pro 组件的样式注册入口，与 `@antdv-next/x` 的 `components/theme/genStyleUtils.ts` 对齐。
 *
 * 不能直接使用 `antdv-next/theme/internal` 的 `genStyleHooks`：那套实现会跟随宿主的
 * `zeroRuntime` 停止注册运行时样式，而 `zeroRuntime` 只覆盖 antdv-next 预构建的
 * `antd.css`，其中没有 x-pro 的组件样式，结果是组件在文档站这类宿主里完全失去样式。
 *
 * 层名固定为 `antdx`，与 x 组件同层（宿主未开启 `StyleProvider layer` 时该名字不参与级联）；
 * 与 x 一样不注入 antd 的 reset / 图标样式，这些由宿主的 antd 负责。
 */
export const { genStyleHooks, genComponentStyleHook, genSubStyleComponent } =
  genStyleUtils<ComponentTokenMap, AliasToken, SeedToken>({
    usePrefix: () => {
      const configCtx = useConfig();
      return computed(() => {
        const { getPrefixCls, iconPrefixCls } = configCtx.value;
        return {
          rootPrefixCls: getPrefixCls(),
          iconPrefixCls,
        };
      });
    },
    useToken: () => {
      const [theme, realToken, hashId, token, cssVar] = useInternalToken();
      return {
        theme,
        realToken,
        hashId,
        token,
        cssVar: computed(() => cssVar.value ?? {}),
      };
    },
    useCSP: () => {
      const configCtx = useConfig();
      return computed(() => configCtx.value?.csp ?? {});
    },
    layer: { name: "antdx" },
  });
