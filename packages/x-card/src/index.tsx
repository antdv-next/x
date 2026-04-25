import Box from "./Box";
import Card from "./Card";
import { clearCatalogCache, loadCatalog, registerCatalog } from "./catalog";

type XCardType = typeof Card & {
  Box: typeof Box;
};

const XCardWithSub = Card as XCardType;
XCardWithSub.Box = Box;

export { Box as XCardBox, Card as XCardCard };
export { clearCatalogCache, loadCatalog, registerCatalog };

export type { ActionPayload, XCardBoxProps, XCardCardProps } from "./interface";
export type {
  Catalog,
  XCardCommand,
  XCardComponent_v09,
  XCardNode,
} from "./runtime/types";

export default XCardWithSub;
