export {};

declare module "vue" {
  export interface GlobalComponents {
    AActions: (typeof import("./dist/actions"))["XActions"];
    AActionsAudio: (typeof import("./dist/actions"))["ActionsAudio"];
    AActionsCopy: (typeof import("./dist/actions"))["ActionsCopy"];
    AActionsFeedback: (typeof import("./dist/actions"))["ActionsFeedback"];
    AActionsItem: (typeof import("./dist/actions"))["ActionsItem"];
    ABubble: (typeof import("./dist/bubble"))["XBubble"];
    ABubbleList: (typeof import("./dist/bubble"))["XBubbleList"];
    ABubbleSystem: (typeof import("./dist/bubble"))["XBubbleSystem"];
    ABubbleDivider: (typeof import("./dist/bubble"))["XBubbleDivider"];
    XActions: (typeof import("./dist/actions"))["XActions"];
    XActionsAudio: (typeof import("./dist/actions"))["ActionsAudio"];
    XActionsCopy: (typeof import("./dist/actions"))["ActionsCopy"];
    XActionsFeedback: (typeof import("./dist/actions"))["ActionsFeedback"];
    XActionsItem: (typeof import("./dist/actions"))["ActionsItem"];
    XBubble: (typeof import("./dist/bubble"))["XBubble"];
    XBubbleList: (typeof import("./dist/bubble"))["XBubbleList"];
    XBubbleSystem: (typeof import("./dist/bubble"))["XBubbleSystem"];
    XBubbleDivider: (typeof import("./dist/bubble"))["XBubbleDivider"];
  }
}
