import type { ComponentToken as ActionsToken } from "../../actions/style";
import type { ComponentToken as AttachmentsComponentToken } from "../../attachments/style";
import type { ComponentToken as BubbleComponentToken } from "../../bubble/style";
import type { ComponentToken as CodeHighlighterToken } from "../../code-highlighter/style";
import type { ComponentToken as ConversationsComponentToken } from "../../conversations/style";
import type { ComponentToken as FileCardComponentToken } from "../../file-card/style";
import type { ComponentToken as SourcesComponentToken } from "../../sources/style";

type EmptyComponentToken = Record<string, never>;

export interface ComponentTokenMap {
  Attachments?: AttachmentsComponentToken;
  Bubble?: BubbleComponentToken;
  Conversations?: ConversationsComponentToken;
  Prompts?: EmptyComponentToken;
  Sender?: EmptyComponentToken;
  Suggestion?: EmptyComponentToken;
  Think?: EmptyComponentToken;
  ThoughtChain?: EmptyComponentToken;
  Welcome?: EmptyComponentToken;
  Actions?: ActionsToken;
  FileCard?: FileCardComponentToken;
  Folder?: EmptyComponentToken;
  Sources?: SourcesComponentToken;
  CodeHighlighter?: CodeHighlighterToken;
  Mermaid?: EmptyComponentToken;
}
