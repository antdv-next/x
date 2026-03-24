export const DESIGN_STAGE_COLOR = {
  AWAKE: { START: "#66D6FF", END: "#509BFF" },
  EXPRESS: { START: "#37F5B5", END: "#3DA8F5" },
  CONFIRM: { START: "#CC8BFF", END: "#8A6AFF" },
  FEEDBACK: { START: "#FFAF71", END: "#FF6B8B" },
  COMMON: { START: "#A7B6FF", END: "#77E3FF" },
} as const;

export const HOME_LINKS = {
  components: "/components",
  welcome: "/components",
  attachments: "/components/attachments",
  think: "/components/bubble",
  actions: "/components/actions",
  richSpecZh: "https://x.ant.design/docs/spec/introduce-cn",
  richSpecEn: "https://x.ant.design/docs/spec/introduce",
} as const;
