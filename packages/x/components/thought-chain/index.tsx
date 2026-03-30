import ThoughtChainItem from "./Item";
import ThoughtChain from "./ThoughtChain";

export type {
  ThoughtChainContentSlotInfo,
  ThoughtChainDescriptionSlotInfo,
  ThoughtChainFooterSlotInfo,
  ThoughtChainIconSlotInfo,
  ThoughtChainItemDescriptionSlotInfo,
  ThoughtChainItemIconSlotInfo,
  ThoughtChainItemProps,
  ThoughtChainItemStatus,
  ThoughtChainItemTitleSlotInfo,
  ThoughtChainItemType,
  ThoughtChainProps,
  ThoughtChainRef,
  SemanticType as ThoughtChainSemanticType,
  ThoughtChainItemSemanticType,
  ThoughtChainTitleSlotInfo,
} from "./interface";

type ThoughtChainType = typeof ThoughtChain & {
  Item: typeof ThoughtChainItem;
};

const ThoughtChainWithSub = ThoughtChain as ThoughtChainType;
ThoughtChainWithSub.Item = ThoughtChainItem;

export { ThoughtChainItem };

export default ThoughtChainWithSub;
