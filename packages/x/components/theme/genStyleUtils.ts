import { genStyleUtils } from "@antdv-next/cssinjs/cssinjs-utils";
import { useConfig } from "antdv-next/config-provider/context";
import { computed } from "vue";

import type { AliasToken, SeedToken } from "./interface";
import type { ComponentTokenMap } from "./interface/components";

import { useInternalToken } from "./useToken";

export const { genStyleHooks, genComponentStyleHook, genSubStyleComponent } =
  genStyleUtils<ComponentTokenMap, AliasToken, SeedToken>({
    usePrefix: () => {
      const configCtx = useConfig();
      return computed(() => {
        const { getPrefixCls, iconPrefixCls } = configCtx.value;
        return {
          iconPrefixCls,
          rootPrefixCls: getPrefixCls(),
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
        cssVar: computed(() => cssVar?.value ?? {}),
      };
    },
    useCSP: () => {
      const configCtx = useConfig();
      return computed(() => configCtx.value?.csp ?? {});
    },
    layer: {
      name: "antdx",
    },
  });
