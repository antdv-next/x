import type { ComponentToken as ActionsToken } from "../../actions/style";
import type { ComponentToken as AttachmentsComponentToken } from "../../attachments/style";
import type { ComponentToken as BubbleComponentToken } from "../../bubble/style";
import type { ComponentToken as CodeHighlighterToken } from "../../code-highlighter/style";
import type { ComponentToken as ConversationsComponentToken } from "../../conversations/style";
import type { ComponentToken as FileCardComponentToken } from "../../file-card/style";
import type { ComponentToken as PromptsComponentToken } from "../../prompts/style";
import type { ComponentToken as SenderComponentToken } from "../../sender/style";
import type { ComponentToken as SourcesComponentToken } from "../../sources/style";
import type { ComponentToken as ThinkComponentToken } from "../../think/style";
import type { ComponentToken as ThoughtChainComponentToken } from "../../thought-chain/style";

type EmptyComponentToken = Record<string, never>;

export interface ComponentTokenMap {
  Attachments?: AttachmentsComponentToken;
  Bubble?: BubbleComponentToken;
  Conversations?: ConversationsComponentToken;
  Prompts?: PromptsComponentToken;
  Sender?: SenderComponentToken;
  Suggestion?: EmptyComponentToken;
  Think?: ThinkComponentToken;
  ThoughtChain?: ThoughtChainComponentToken;
  Welcome?: EmptyComponentToken;
  Actions?: ActionsToken;
  FileCard?: FileCardComponentToken;
  Folder?: EmptyComponentToken;
  Sources?: SourcesComponentToken;
  CodeHighlighter?: CodeHighlighterToken;
  Mermaid?: EmptyComponentToken;
}
