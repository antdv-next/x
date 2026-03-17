import type { ComponentToken as ActionsToken } from '../../actions/style'
import type { ComponentToken as BubbleComponentToken } from '../../bubble/style'
import type { ComponentToken as ConversationsComponentToken } from '../../conversations/style'

type EmptyComponentToken = Record<string, never>

export interface ComponentTokenMap {
  Attachments?: EmptyComponentToken
  Bubble?: BubbleComponentToken
  Conversations?: ConversationsComponentToken
  Prompts?: EmptyComponentToken
  Sender?: EmptyComponentToken
  Suggestion?: EmptyComponentToken
  Think?: EmptyComponentToken
  ThoughtChain?: EmptyComponentToken
  Welcome?: EmptyComponentToken
  Actions?: ActionsToken
  FileCard?: EmptyComponentToken
  Folder?: EmptyComponentToken
  Sources?: EmptyComponentToken
  CodeHighlighter?: EmptyComponentToken
  Mermaid?: EmptyComponentToken
}
