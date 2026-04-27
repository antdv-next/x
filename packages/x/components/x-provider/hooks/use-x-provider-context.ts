import { useConfig } from "antdv-next/config-provider/context";

export const defaultPrefixCls = "ant";

export default function useXProviderContext() {
  const configCtx = useConfig();

  return {
    theme: configCtx.value.theme,
    getPrefixCls: configCtx.value.getPrefixCls,
    direction: configCtx.value.direction,
    csp: configCtx.value.csp,
    iconPrefixCls: configCtx.value.iconPrefixCls,
  };
}
