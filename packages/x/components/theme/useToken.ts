import type { Theme } from "@antdv-next/cssinjs";
import type { Ref } from "vue";

import useAntdToken, {
  ignore as antdIgnore,
  unitless as antdUnitless,
  getComputedToken as getAntdComputedToken,
} from "antdv-next/dist/theme/useToken";

import type { DesignTokenProviderProps } from "./context";
import type { AliasToken, GlobalToken, SeedToken } from "./interface";

export const unitless: {
  [key in keyof AliasToken]?: boolean;
} = antdUnitless;

export const ignore: {
  [key in keyof AliasToken]?: boolean;
} = antdIgnore;

export const getComputedToken = getAntdComputedToken as unknown as (
  originToken: SeedToken,
  overrideToken: DesignTokenProviderProps["components"] & {
    override?: Partial<AliasToken>;
  },
  theme: Theme<any, any>,
) => any;

export function useInternalToken(): [
  theme: Ref<Theme<SeedToken, AliasToken>>,
  realToken: Ref<GlobalToken>,
  hashId: Ref<string>,
  token: Ref<GlobalToken>,
  cssVar: Ref<DesignTokenProviderProps["cssVar"]>,
] {
  const [theme, realToken, hashId, token, cssVar] = useAntdToken();

  return [
    theme as unknown as Ref<Theme<SeedToken, AliasToken>>,
    realToken as unknown as Ref<GlobalToken>,
    hashId,
    token as unknown as Ref<GlobalToken>,
    cssVar as Ref<DesignTokenProviderProps["cssVar"]>,
  ];
}

export default function useToken() {
  const [theme, _realToken, hashId, token] = useInternalToken();

  return { theme, token, hashId };
}
