import antZhCN from "antdv-next/locale/zh_CN";

import type { XProLocale } from "./types";

const xProLocale = {
  ...antZhCN,
  MessageScroller: {
    viewportLabel: "会话内容",
    navigationLabel: "消息导航",
    backToLatest: "回到最新",
    railItemLabel: "跳转到第 {index} 条消息，共 {total} 条",
  },
  TodoList: {
    title: "任务清单",
    counterLabel: "已完成 {completed} / {total}",
    toggleLabel: "展开或折叠{title}",
    statusPending: "待处理",
    statusInProgress: "进行中",
    statusCompleted: "已完成",
    statusCancelled: "已取消",
  },
} satisfies XProLocale;

export default xProLocale;
