import type { CSSInterpolation, DerivativeFunc } from "@antdv-next/cssinjs";

import type { AnyObject } from "../../_utils/type";
import type { AliasToken } from "./alias";
import type { MapToken } from "./maps";
import type { SeedToken } from "./seeds";

export type { AliasToken } from "./alias";

export type MappingAlgorithm = DerivativeFunc<SeedToken, MapToken>;

export type { ComponentTokenMap } from "./components";
export type {
  FullToken,
  GenStyleFn,
  GetDefaultToken,
  GlobalToken,
  OverrideComponent,
  OverrideToken,
} from "./cssinjs-utils";
export type {
  ColorMapToken,
  ColorNeutralMapToken,
  CommonMapToken,
  FontMapToken,
  HeightMapToken,
  MapToken,
  SizeMapToken,
  StyleMapToken,
} from "./maps";
export type {
  ColorPalettes,
  LegacyColorPalettes,
  PresetColorKey,
  PresetColorType,
} from "./presetColors";
export { PresetColors } from "./presetColors";
export type { SeedToken } from "./seeds";
export type { TokenWithCommonCls } from "@antdv-next/cssinjs/cssinjs-utils";

export type UseComponentStyleResult = [(node: any) => any, string];

export type GenerateStyle<
  ComponentToken extends AnyObject = AliasToken,
  ReturnType = CSSInterpolation,
> = (token: ComponentToken) => ReturnType;
