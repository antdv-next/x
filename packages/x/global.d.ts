type ActionsComponent = (typeof import("./dist/actions"))["default"];
type ActionsAudioComponent = (typeof import("./dist/actions"))["ActionsAudio"];
type ActionsCopyComponent = (typeof import("./dist/actions"))["ActionsCopy"];
type ActionsFeedbackComponent =
  (typeof import("./dist/actions"))["ActionsFeedback"];
type ActionsItemComponent = (typeof import("./dist/actions"))["ActionsItem"];
type AttachmentsComponent = (typeof import("./dist/attachments"))["default"];
type BubbleComponent = (typeof import("./dist/bubble"))["default"];
type BubbleListComponent = (typeof import("./dist/bubble"))["BubbleList"];
type BubbleSystemComponent = (typeof import("./dist/bubble"))["BubbleSystem"];
type BubbleDividerComponent = (typeof import("./dist/bubble"))["BubbleDivider"];
type CodeHighlighterComponent =
  (typeof import("./dist/code-highlighter"))["default"];
type ConversationsComponent =
  (typeof import("./dist/conversations"))["default"];
type ConversationsCreationComponent =
  (typeof import("./dist/conversations"))["ConversationsCreation"];
type FileCardComponent = (typeof import("./dist/file-card"))["default"];
type FileCardListComponent =
  (typeof import("./dist/file-card"))["FileCardList"];
type MermaidComponent = (typeof import("./dist/mermaid"))["default"];
type PromptsComponent = (typeof import("./dist/prompts"))["default"];
type SenderComponent = (typeof import("./dist/sender"))["default"];
type SenderHeaderComponent = (typeof import("./dist/sender"))["SenderHeader"];
type SenderSwitchComponent = (typeof import("./dist/sender"))["SenderSwitch"];
type SourcesComponent = (typeof import("./dist/sources"))["default"];
type SuggestionComponent = (typeof import("./dist/suggestion"))["default"];
type ThinkComponent = (typeof import("./dist/think"))["default"];
type ThoughtChainComponent = (typeof import("./dist/thought-chain"))["default"];
type ThoughtChainItemComponent =
  (typeof import("./dist/thought-chain"))["ThoughtChainItem"];
type WelcomeComponent = (typeof import("./dist/welcome"))["default"];
type XProviderComponent = (typeof import("./dist/x-provider"))["default"];

export {};

declare module "vue" {
  export interface GlobalComponents {
    AxActions: ActionsComponent;
    AxActionsAudio: ActionsAudioComponent;
    AxActionsCopy: ActionsCopyComponent;
    AxActionsFeedback: ActionsFeedbackComponent;
    AxActionsItem: ActionsItemComponent;
    AxAttachments: AttachmentsComponent;
    AxBubble: BubbleComponent;
    AxBubbleDivider: BubbleDividerComponent;
    AxBubbleList: BubbleListComponent;
    AxBubbleSystem: BubbleSystemComponent;
    AxCodeHighlighter: CodeHighlighterComponent;
    AxConversations: ConversationsComponent;
    AxConversationsCreation: ConversationsCreationComponent;
    AxFileCard: FileCardComponent;
    AxFileCardList: FileCardListComponent;
    AxMermaid: MermaidComponent;
    AxPrompts: PromptsComponent;
    AxProvider: XProviderComponent;
    AxSender: SenderComponent;
    AxSenderHeader: SenderHeaderComponent;
    AxSenderSwitch: SenderSwitchComponent;
    AxSources: SourcesComponent;
    AxSuggestion: SuggestionComponent;
    AxThink: ThinkComponent;
    AxThoughtChain: ThoughtChainComponent;
    AxThoughtChainItem: ThoughtChainItemComponent;
    AxWelcome: WelcomeComponent;
  }
}
