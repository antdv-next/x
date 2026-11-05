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
  Questionnaire: {
    title: "请回答几个问题",
    progress: "第 {index} 题，共 {total} 题",
    required: "必答",
    optional: "选答",
    other: "其他",
    customPlaceholder: "请输入你的答案",
    previous: "上一题",
    next: "下一题",
    submit: "提交答案",
    skipQuestion: "跳过此题",
    skip: "跳过问卷",
    dismiss: "关闭",
    revise: "修改答案",
    retry: "重试提交",
    pending: "等待回答",
    submitting: "正在提交",
    submitted: "答案已提交",
    expired: "问卷已过期",
    cancelled: "问卷已取消",
    error: "提交失败，答案已保留。",
    invalidConfig: "问卷配置无效",
    requiredError: "请回答此必答题。",
    minSelections: "请至少选择 {min} 项。",
    maxSelections: "最多选择 {max} 项。",
    unanswered: "未回答",
    skipped: "已跳过",
    limitReached: "已达到字数上限",
    showMore: "展开说明",
    showLess: "收起说明",
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
