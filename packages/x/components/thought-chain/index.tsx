import ThoughtChainItem from "./Item";
import ThoughtChain from "./ThoughtChain";

export type {
  ThoughtChainItemProps,
  ThoughtChainItemStatus,
  ThoughtChainItemType,
  ThoughtChainProps,
  ThoughtChainRef,
  SemanticType as ThoughtChainSemanticType,
  ThoughtChainItemSemanticType,
} from "./interface";

type ThoughtChainType = typeof ThoughtChain & {
  Item: typeof ThoughtChainItem;
};

const ThoughtChainWithSub = ThoughtChain as ThoughtChainType;
ThoughtChainWithSub.Item = ThoughtChainItem;

export { ThoughtChainItem };

export default ThoughtChainWithSub;
