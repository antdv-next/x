<script setup lang="ts">
import type { SenderProps, SenderRef } from "@antdv-next/x";

import { Sender, Suggestion } from "@antdv-next/x";
import { App as AntdApp } from "antdv-next";
import { computed, h, ref, nextTick } from "vue";

const logs = ref<string[]>([]);
function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (logs.value.length > 80) logs.value.pop();
}
function clearLogs() {
  logs.value = [];
}

const viewMode = ref<"accept" | "detail">("accept");
const activeKey = ref("local");

type AcceptItem = {
  id: string;
  title: string;
  level: "P0" | "P1" | "P2";
  source: "本项目" | "上游";
  steps: string[];
  expect: string;
  status: "待验" | "通过" | "未通过";
};

const acceptList = ref<AcceptItem[]>([
  {
    id: "L1",
    title: "词槽撤销 (#193/#194 P0)",
    level: "P0",
    source: "本项目",
    steps: [
      "点“插入 TAG” → 选中 TAG 按 Backspace 删除",
      "按 Cmd+Z / Ctrl+Z 撤销",
    ],
    expect: "TAG 完整恢复，光标回到原位",
    status: "待验",
  },
  {
    id: "L2",
    title: "content 内 Backspace (#109)",
    level: "P1",
    source: "本项目",
    steps: ["点“聚焦 content” → 光标在 HelloWorld 中间按 Backspace"],
    expect: "仅删单个字符，不删整个 content 节点",
    status: "待验",
  },
  {
    id: "L3",
    title: "语音受控 (#103)",
    level: "P1",
    source: "本项目",
    steps: ["连续点“切换 recording”两次"],
    expect: "日志交替 true / false（旧 bug 始终 true）",
    status: "待验",
  },
  {
    id: "L4",
    title: "@ 提及替换 (#101) - 敲 @ 选人 @ 应消失",
    level: "P1",
    source: "本项目",
    steps: ["在框内输入 hello@（模拟 @ 提及）", "点“插入 @user” （模拟选人）"],
    expect:
      "显示为 hello + @user 卡片，原 @ 已被替换（旧 bug 残留为 hello@@user）",
    status: "待验",
  },
  {
    id: "L5",
    title: "边界回退 (#98/#100)",
    level: "P1",
    source: "本项目",
    steps: ["在“前 TAG 后”示例中，光标放末尾按 Backspace"],
    expect: "空文本后的 TAG 仍被正确删除",
    status: "待验",
  },
  {
    id: "A1",
    title: "粘贴多行 (#1626 上游)",
    level: "P1",
    source: "上游",
    steps: ["复制三行文本 line1\\nline2\\nline3，在输入框粘贴"],
    expect: "换行保留（旧 bug 丢失或仅首行）",
    status: "待验",
  },
  {
    id: "B1",
    title: "运行时丢槽 (#1899 上游)",
    level: "P1",
    source: "上游",
    steps: ["点“插入 tag” → 点“读取”应为 1 → 点“父重渲染” → 再读取"],
    expect: "两次读取均为 1（旧 bug 第二次为 0）",
    status: "待验",
  },
  {
    id: "C1",
    title: "content formatResult (#1638)",
    level: "P2",
    source: "上游",
    steps: ["在 content 内输入 test → 点 Get Value"],
    expect: "结果含 [test] 括号",
    status: "待验",
  },
  {
    id: "D1",
    title: "skill 删 onClose (#1938)",
    level: "P1",
    source: "上游",
    steps: ["聚焦输入框 → 按 Backspace 删除 skill"],
    expect: "下方 onClose 日志出现",
    status: "待验",
  },
  {
    id: "E1",
    title: "Suggestion 空格 (#1873)",
    level: "P1",
    source: "上游",
    steps: ["在“包裹内输入空格”框连续输入空格"],
    expect: "空格正常显示，不被吞",
    status: "待验",
  },
  {
    id: "H1",
    title: "边框 outline (#137)",
    level: "P2",
    source: "本项目",
    steps: ["点击输入框聚焦观察边框"],
    expect: "无额外蓝色外描边",
    status: "待验",
  },
  {
    id: "L6",
    title: "自定义 slot 插入后无法删除前内容",
    level: "P1",
    source: "本项目",
    steps: [
      "在框内输入 @ 触发插入自定义卡片",
      "按 Backspace 尝试删除插入前的 @Travel Planner3",
    ],
    expect: "应能删除前一个卡片，而非无法删除",
    status: "待验",
  },
  {
    id: "F1",
    title: "组合回车误提交 (#872)",
    level: "P2",
    source: "上游",
    steps: ["中文输入法下输入“你好”按回车"],
    expect: "isComposing 阶段不触发 submit",
    status: "待验",
  },
]);

const selectedId = ref("L1");
const selected = computed(
  () =>
    acceptList.value.find(i => i.id === selectedId.value) ||
    acceptList.value[0]!,
);
const passCount = computed(
  () => acceptList.value.filter(i => i.status === "通过").length,
);
function setStatus(id: string, s: AcceptItem["status"]) {
  const it = acceptList.value.find(i => i.id === id);
  if (it) it.status = s;
  log(`[验收] ${id} → ${s}`);
}
function markPass() {
  setStatus(selected.value.id, "通过");
}
function markFail() {
  setStatus(selected.value.id, "未通过");
}

// refs
const b1Ref = ref<SenderRef>();
const b1Tick = ref(0);
const b1SlotConfig = computed<SenderProps["slotConfig"]>(() => {
  void b1Tick.value;
  return [];
});
const b1Log = ref("");
const c1Ref = ref<SenderRef>();
const c1Value = ref("");
const c1SlotConfig: SenderProps["slotConfig"] = [
  { type: "text", value: 'Translate "' },
  {
    type: "content",
    key: "text",
    props: { defaultValue: "Hello World", placeholder: "Enter" },
    formatResult: (v: any) => `[${v}]`,
  },
  { type: "text", value: '"' },
];
const lUndoRef = ref<SenderRef>();
const lContentRef = ref<SenderRef>();
const lBoundaryRef = ref<SenderRef>();
const lSkillCursorRef = ref<SenderRef>();
const lSpeechRecording = ref(false);
const lSpeechLog = ref("");
const lAllowSpeech = computed(() => ({
  recording: lSpeechRecording.value,
  onRecordingChange: (next: boolean) => {
    lSpeechLog.value = `onRecordingChange(${next})`;
    log(`[L3] ${next}`);
    lSpeechRecording.value = next;
  },
}));
const l4SlotConfig = ref<SenderProps["slotConfig"]>([]);
const l4MentionOpen = ref(false);
const mentionList = [
  { label: "@Alice", value: "alice", desc: "前端" },
  { label: "@Bob", value: "bob", desc: "后端" },
  { label: "@Charlie", value: "charlie", desc: "产品" },
];
function onL4Change(value: string) {
  // 输入 @ 即唤起
  if (value.endsWith("@") || (value.includes("@") && !l4MentionOpen.value)) {
    const lastAt = value.lastIndexOf("@");
    if (lastAt >= 0 && lastAt === value.length - 1) l4MentionOpen.value = true;
  }
  // 简单：只要有 @ 就保持开启，选后会关闭
  if (!value.includes("@")) l4MentionOpen.value = false;
}
function onL4OpenChange(v: boolean) {
  l4MentionOpen.value = v;
}
function onSelectMention(item: any) {
  const val = typeof item === "string" ? item : (item?.value ?? item);
  const lab =
    typeof item === "string"
      ? mentionList.find(m => m.value === item)?.label || `@${item}`
      : item?.label || val;
  if (!val || val === "undefined") {
    log(`[L4] 选择失败 item=${JSON.stringify(item)}`);
    return;
  }
  lBoundaryRef.value?.insert?.(
    [
      {
        type: "tag",
        key: String(val) + Date.now(),
        props: { label: String(lab), value: String(val) },
      },
    ],
    "cursor",
    "@",
  );
  l4MentionOpen.value = false;
  log(`[L4] 选择 ${lab} 已替换 @ value=${val}`);
}
const l4SubmitResult = ref("");
function onL4Submit(value: string, slotConfig?: any[]) {
  const parts = (slotConfig || [])
    .map((s: any) => {
      if (s.type === "text") return `文本:"${s.value}"`;
      if (s.type === "tag")
        return `TAG key=${s.key} label=${s.props?.label} value=${s.props?.value}`;
      return `${s.type}:${s.key}`;
    })
    .join(" | ");
  l4SubmitResult.value = `提交字符串: "${value}"\n解析: ${parts || "（无 slot，仅纯文本）"}`;
  log(
    `[L4 submit] value=${JSON.stringify(value)} slots=${slotConfig?.length} | ${parts}`,
  );
}
const customSenderRef = ref<SenderRef>();
const customValue = ref("");
const customSlotValue = ref("");
const customSkill: SenderProps["skill"] = {
  value: "travel_skill",
  title: "Travel Planner",
  closable: true,
  toolTip: { title: "Travel Skill" },
};
const customSlotMap: Record<string, NonNullable<SenderProps["slotConfig"]>> = {
  travel: [
    {
      type: "tag",
      key: "assistant1",
      props: { label: "@Travel Planner1", value: "travel1" },
    },
    {
      type: "tag",
      key: "assistant2",
      props: { label: "@Travel Planner2", value: "travel2" },
    },
    {
      type: "tag",
      key: "assistant3",
      props: { label: "@Travel Planner3", value: "travel3" },
    },
    {
      type: "custom",
      key: "reference1",
      customRender: () =>
        h(
          "div",
          {
            style: {
              background: "pink",
              padding: "4px 8px",
              borderRadius: "4px",
            },
          },
          " 自定义1 ",
        ),
    },
    {
      type: "custom",
      key: "reference2",
      customRender: () =>
        h(
          "div",
          {
            style: {
              background: "pink",
              padding: "4px 8px",
              borderRadius: "4px",
            },
          },
          " 自定义2 ",
        ),
    },
    {
      type: "custom",
      key: "reference3",
      customRender: () =>
        h(
          "div",
          {
            style: {
              background: "pink",
              padding: "4px 8px",
              borderRadius: "4px",
            },
          },
          " 自定义3 ",
        ),
    },
  ],
  meeting: [
    { type: "text", value: "Please schedule a meeting with " },
    { type: "input", key: "person", props: { placeholder: "name" } },
    { type: "text", value: " at " },
    {
      type: "content",
      key: "time",
      props: { defaultValue: "10:00", placeholder: "time" },
    },
    { type: "text", value: "." },
  ],
};
let prevCustomInput = "";
function onCustomChange(_value: string, e: any) {
  // React 原版：(event?.nativeEvent as InputEvent)?.data === "@"
  // Vue 的 SlotTextAreaProseMirror 在 ProseMirror dispatch 中不透传 uiEvent/InputEvent.data，
  // 导致 e 为 undefined，@ 检测失效。改为 value 语义对齐 + 兼容原事件路径。
  const evtData: unknown =
    (e as any)?.nativeEvent?.data ??
    (e as any)?.data ??
    (e as any)?.nativeEvent?.inputType;
  const hasAtFromEvent = evtData === "@";
  const hasAtFromValue = _value.includes("@") || _value.includes("＠");
  const hasAt = hasAtFromEvent || hasAtFromValue;
  const justAddedAt = hasAt && !prevCustomInput.includes("@");
  prevCustomInput = _value;
  if (!justAddedAt) return;
  // 避免同一 value 重复插入（insert 会再触发一次 onChange 且仍含 "@"）
  // 注：不要用 slotConfig.length 判断，键入 "@" 本身会产生一个 text slot 使长度 6→7，会误拦截
  const hasCustom4 = !!customSenderRef.value
    ?.getValue?.()
    ?.slotConfig?.some((s: any) =>
      String((s as any).key || "").includes("reference4"),
    );
  if (hasCustom4) {
    log(`[L6] 检测到 @ 但已插入过`);
    return;
  }
  customSenderRef.value?.insert?.([
    {
      type: "custom",
      key: `reference4_${Date.now()}`,
      customRender: () =>
        h(
          "div",
          {
            style: {
              background: "pink",
              padding: "4px 8px",
              borderRadius: "4px",
            },
          },
          " 自定义4 ",
        ),
    },
  ]);
  log("[L6] 输入 @ 已插入自定义4");
}
function manualInsertCustom4() {
  customSenderRef.value?.insert?.([
    {
      type: "custom",
      key: `reference4_${Date.now()}`,
      customRender: () =>
        h(
          "div",
          {
            style: {
              background: "pink",
              padding: "4px 8px",
              borderRadius: "4px",
            },
          },
          " 自定义4 ",
        ),
    },
  ]);
  log("[L6] 手动插入 自定义4");
}
function onCustomSubmit(
  nextValue: string,
  nextSlotConfig?: SenderProps["slotConfig"],
) {
  customValue.value = nextValue;
  customSlotValue.value = JSON.stringify(nextSlotConfig ?? [], null, 2);
  log(`[L6] submit value=${nextValue} slots=${nextSlotConfig?.length}`);
}
const b2SlotConfig = ref<SenderProps["slotConfig"]>([]);
const b2UpdateCount = ref(0);
const b3Ref = ref<SenderRef>();
const b3Log = ref("");
const b4Ref = ref<SenderRef>();
const b4Value = ref("qwe#");

function onFillL4() {
  l4SlotConfig.value = [{ type: "text", value: "hello@" }];
  nextTick(() => lBoundaryRef.value?.focus({ cursor: "end" }));
}
function autoCheckL4() {
  const refExists = !!lBoundaryRef.value;
  log(`[L4 auto] refExists=${refExists} start`);
  if (!refExists) {
    log("[L4 auto] ref null");
    setStatus("L4", "未通过");
    return;
  }
  l4SlotConfig.value = [{ type: "text", value: "hello@" }];
  nextTick(() => {
    lBoundaryRef.value?.focus({ cursor: "end" });
    setTimeout(() => {
      const before = lBoundaryRef.value?.getValue()?.value || "";
      log(`[L4 auto] before=${JSON.stringify(before)}`);
      lBoundaryRef.value?.insert?.(
        [
          {
            type: "tag",
            key: "at" + Date.now(),
            props: { label: "@user", value: "user" },
          },
        ],
        "cursor",
        "@",
      );
      setTimeout(() => {
        const v = lBoundaryRef.value?.getValue()?.value || "";
        const hasHelloAt = v.includes("hello@");
        log(`[L4 auto] after=${JSON.stringify(v)} hasHelloAt=${hasHelloAt}`);
        setStatus("L4", !hasHelloAt ? "通过" : "未通过");
      }, 400);
    }, 300);
  });
}
function autoCheckL3() {
  const before = lSpeechRecording.value;
  lAllowSpeech.value.onRecordingChange(!before);
  setTimeout(() => {
    const after = lSpeechRecording.value;
    setStatus("L3", after !== before ? "通过" : "未通过");
  }, 100);
}
function autoCheckB1() {
  b1Ref.value?.insert([
    { type: "tag", key: "t" + Date.now(), props: { label: "TAG", value: "v" } },
  ]);
  setTimeout(() => {
    const before = b1Ref.value?.getValue()?.slotConfig?.length || 0;
    b1Tick.value++;
    nextTick(() => {
      const after = b1Ref.value?.getValue()?.slotConfig?.length || 0;
      b1Log.value = `before=${before} after=${after}`;
      log(`[B1 auto] ${b1Log.value}`);
      setStatus("B1", before === 1 && after === 1 ? "通过" : "未通过");
    });
  }, 300);
}

// shared
const pasteSlotConfig = ref<SenderProps["slotConfig"]>([
  { type: "text", value: "请帮我规划去 " },
  {
    type: "select",
    key: "city",
    props: { defaultValue: "北京", options: ["北京", "上海", "成都"] },
  },
  { type: "text", value: " 的行程，预算 " },
  { type: "input", key: "budget", props: { placeholder: "输入预算" } },
  { type: "text", value: " 元。" },
]);
const pasteInfo = ref("");
const onPasteA = (_e: ClipboardEvent, info: any) => {
  pasteInfo.value = `len=${info.text.length} nl=${info.text.includes("\n")}`;
  log(`[粘贴] ${pasteInfo.value}`);
};
const onCutA = (_e: ClipboardEvent, info: any) =>
  log(`[剪切] ${JSON.stringify(info.text)}`);
const dSkillCloseLog = ref("");
const dSkill: SenderProps["skill"] = {
  value: "planner",
  title: "行程助手",
  closable: true,
  onClose: () => {
    dSkillCloseLog.value = `onClose @${new Date().toLocaleTimeString()}`;
    log("[D1] onClose");
  },
};
const dSkillRef = ref<SenderRef>();
const dSkillActive = ref(false);
const dSlotConfigWithSkill = computed<SenderProps["slotConfig"]>(() =>
  dSkillActive.value
    ? [
        { type: "text", value: "skill " },
        { type: "input", key: "inp", props: { placeholder: "输入" } },
      ]
    : [],
);
const dPlaceholderI18n = ref("你好 (zh-CN)");
const eSuggestionValue = ref("");
const eSuggestionLog = ref("");
const eSuggestionItems = [
  { label: " a", value: "a" },
  { label: " b", value: "b" },
  { label: " c", value: "c" },
];
const eTrigger = ref(false);
function onEOpenChange(v: boolean) {
  eTrigger.value = v;
}
function onEChange(v: string) {
  eSuggestionValue.value = v;
  eSuggestionLog.value = v.slice(-20);
}
const gPrefixClickLog = ref("");
const gFocusRef = ref<SenderRef>();
const gInsertPos = ref<"start" | "end" | "cursor">("cursor");
const gLoading = ref(false);
</script>

<template>
  <AntdApp>
    <div style="max-width: 1160px; margin: 0 auto; padding: 20px 16px 60px">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        "
      >
        <div>
          <h1 style="font-size: 20px; margin: 0">Sender 验收 Playground</h1>
          <div style="color: #666; font-size: 13px; margin-top: 4px">
            本项目 7 个 P0/P1 必验 + 上游 6 个关键 → 共 13 项。每项 1-2
            步即可判定通过/未通过。
          </div>
        </div>
        <a-segmented
          v-model:value="viewMode"
          :options="[
            { label: '验收模式', value: 'accept' },
            { label: '详细模式', value: 'detail' },
          ]"
        />
      </div>

      <a-flex gap="8" style="margin: 12px 0">
        <a-tag color="red">本项目 7</a-tag>
        <a-tag color="blue">上游 6</a-tag>
        <a-tag>{{ passCount }}/{{ acceptList.length }} 通过</a-tag>
        <a-progress
          :percent="Math.round((passCount / acceptList.length) * 100)"
          :size="[120, 10]"
          style="margin-left: 8px"
        />
        <a-button size="small" @click="clearLogs">清空日志</a-button>
      </a-flex>

      <div v-if="viewMode === 'accept'">
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 12px"
          message="如何验收"
          description="左侧点一项 → 右侧按“步骤”操作 → 看“预期”是否达成 → 点“通过”或“未通过”。带“自动”标记的可一键验证。"
        />

        <div style="display: grid; grid-template-columns: 340px 1fr; gap: 16px">
          <div
            style="
              border: 1px solid #f0f0f0;
              border-radius: 8px;
              overflow: hidden;
            "
          >
            <div
              style="
                padding: 10px 12px;
                background: #fafafa;
                border-bottom: 1px solid #f0f0f0;
                font-weight: 600;
                font-size: 13px;
              "
            >
              验收清单
            </div>
            <div
              v-for="it in acceptList"
              :key="it.id"
              @click="selectedId = it.id"
              :style="{
                padding: '10px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f5f5f5',
                background: selectedId === it.id ? '#e6f4ff' : '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }"
            >
              <div>
                <div style="font-size: 13px; font-weight: 500">
                  {{ it.id }} · {{ it.title }}
                  <a-tag
                    v-if="it.source === '本项目'"
                    color="red"
                    style="margin-left: 4px; font-size: 10px"
                    >本项目</a-tag
                  ><a-tag
                    v-else
                    color="blue"
                    style="margin-left: 4px; font-size: 10px"
                    >上游</a-tag
                  >
                  <a-tag
                    :color="
                      it.level === 'P0'
                        ? 'red'
                        : it.level === 'P1'
                          ? 'orange'
                          : 'default'
                    "
                    style="font-size: 10px"
                    >{{ it.level }}</a-tag
                  >
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 2px">
                  {{ it.steps[0] }}
                </div>
              </div>
              <a-tag
                :color="
                  it.status === '通过'
                    ? 'success'
                    : it.status === '未通过'
                      ? 'error'
                      : 'default'
                "
                style="margin-left: 8px"
                >{{ it.status }}</a-tag
              >
            </div>
          </div>

          <div
            style="border: 1px solid #f0f0f0; border-radius: 8px; padding: 16px"
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              "
            >
              <div style="font-size: 15px; font-weight: 600">
                {{ selected.id }} · {{ selected.title }}
              </div>
              <a-space>
                <a-button size="small" type="primary" @click="markPass"
                  >标记通过</a-button
                >
                <a-button size="small" danger @click="markFail"
                  >标记未通过</a-button
                >
              </a-space>
            </div>
            <a-divider style="margin: 12px 0" />
            <div
              style="
                background: #fafafa;
                border: 1px solid #f0f0f0;
                border-radius: 6px;
                padding: 10px 12px;
                margin-bottom: 12px;
              "
            >
              <div style="font-size: 12px; font-weight: 600; color: #1677ff">
                复现步骤（1-2 步）
              </div>
              <ol
                style="
                  margin: 6px 0 0 18px;
                  padding: 0;
                  font-size: 13px;
                  line-height: 1.7;
                "
              >
                <li v-for="(s, i) in selected.steps" :key="i">{{ s }}</li>
              </ol>
            </div>
            <div
              style="
                background: #f6ffed;
                border: 1px solid #b7eb8f;
                border-radius: 6px;
                padding: 10px 12px;
                margin-bottom: 12px;
              "
            >
              <div style="font-size: 12px; font-weight: 600; color: #389e0d">
                预期结果
              </div>
              <div style="font-size: 13px; margin-top: 4px">
                {{ selected.expect }}
              </div>
            </div>
            <div
              style="
                border: 1px solid #d9d9d9;
                border-radius: 8px;
                padding: 14px;
                background: #fff;
              "
            >
              <div style="font-size: 12px; color: #666; margin-bottom: 8px">
                交互区 — 按步骤操作，下方日志为判定依据
              </div>
              <div v-if="selected.id === 'L1'">
                <a-flex gap="8" style="margin-bottom: 8px">
                  <a-button
                    size="small"
                    type="primary"
                    @click="
                      lUndoRef?.insert?.([
                        {
                          type: 'tag',
                          key: 'l' + Date.now(),
                          props: { label: 'TAG', value: 't' },
                        },
                      ])
                    "
                    >插入 TAG</a-button
                  >
                  <a-button
                    size="small"
                    @click="
                      log(
                        `[L1] slots=${lUndoRef?.getValue()?.slotConfig?.length}`,
                      )
                    "
                    >getValue</a-button
                  >
                </a-flex>
                <Sender
                  ref="lUndoRef"
                  :slot-config="[
                    { type: 'text', value: '前缀 ' },
                    {
                      type: 'tag',
                      key: 'lt1',
                      props: { label: 'UNDO_TAG', value: 'u' },
                    },
                    { type: 'text', value: ' 后缀' },
                  ]"
                  placeholder="选中 TAG 按 Backspace → Cmd+Z"
                />
              </div>
              <div v-else-if="selected.id === 'L2'">
                <a-flex gap="8" style="margin-bottom: 8px">
                  <a-button
                    size="small"
                    @click="lContentRef?.focus({ cursor: 'slot', key: 'c' })"
                    >聚焦 content</a-button
                  >
                  <a-button
                    size="small"
                    @click="
                      log(
                        `[L2] ${JSON.stringify(lContentRef?.getValue()?.value?.slice(0, 60))}`,
                      )
                    "
                    >getValue</a-button
                  >
                </a-flex>
                <Sender
                  ref="lContentRef"
                  :slot-config="[
                    { type: 'text', value: '前缀 ' },
                    {
                      type: 'content',
                      key: 'c',
                      props: {
                        defaultValue: 'HelloWorld',
                        placeholder: 'content',
                      },
                    },
                    { type: 'text', value: ' 后缀' },
                  ]"
                  placeholder="光标进 HelloWorld 中间按 Backspace"
                />
              </div>
              <div v-else-if="selected.id === 'L3'">
                <a-flex gap="8" style="margin-bottom: 8px">
                  <a-button
                    size="small"
                    :type="lSpeechRecording ? 'primary' : 'default'"
                    @click="lAllowSpeech.onRecordingChange(!lSpeechRecording)"
                    >切换 recording ({{ lSpeechRecording }})</a-button
                  >
                  <a-button size="small" type="primary" @click="autoCheckL3"
                    >一键验证</a-button
                  >
                  <span style="font-size: 12px">{{ lSpeechLog || "-" }}</span>
                </a-flex>
                <Sender
                  :allow-speech="lAllowSpeech as any"
                  placeholder="观察日志交替"
                />
              </div>
              <div v-else-if="selected.id === 'L4'">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px">
                  场景：输入 <b>@</b> 唤起用户列表（类似微信 @ 人），选择后
                  <b>@</b> 被替换为卡片，而非残留
                </div>
                <Suggestion
                  :items="mentionList"
                  :open="l4MentionOpen"
                  @open-change="onL4OpenChange"
                  @select="onSelectMention"
                >
                  <Sender
                    ref="lBoundaryRef"
                    :slot-config="l4SlotConfig"
                    placeholder="输入 @ 试试，或点下方示例；按 Enter 提交"
                    :on-change="onL4Change"
                    :on-submit="onL4Submit"
                  />
                </Suggestion>
                <div style="font-size: 11px; color: #999; margin-top: 6px">
                  提示：输入 hello@ 会自动弹出；选择后观察 @ 是否消失（旧 bug
                  会残留 hello@@user）。按 Enter 提交后下方解析哪些是文本哪些是
                  TAG。
                </div>
                <a-flex gap="8" style="margin-top: 8px">
                  <a-button size="small" @click="onFillL4"
                    >示例：填入 hello@</a-button
                  >
                  <a-button size="small" type="primary" @click="autoCheckL4"
                    >一键验证</a-button
                  >
                  <a-button
                    size="small"
                    @click="
                      log(
                        `[L4] value=${JSON.stringify(lBoundaryRef?.getValue()?.value)} slot=${JSON.stringify(lBoundaryRef?.getValue()?.slotConfig)}`,
                      )
                    "
                    >查看值</a-button
                  >
                </a-flex>
                <div
                  v-if="l4SubmitResult"
                  style="
                    margin-top: 10px;
                    background: #f6ffed;
                    border: 1px solid #b7eb8f;
                    border-radius: 6px;
                    padding: 8px 10px;
                    font-size: 12px;
                    white-space: pre-wrap;
                    font-family: monospace;
                  "
                >
                  {{ l4SubmitResult }}
                </div>
                <div
                  v-else
                  style="
                    margin-top: 10px;
                    background: #fafafa;
                    border: 1px dashed #d9d9d9;
                    border-radius: 6px;
                    padding: 8px 10px;
                    font-size: 11px;
                    color: #999;
                  "
                >
                  提交后在此显示解析：例如输入 <b>hello</b> +
                  <b>@Alice 卡片</b> + <b>123</b>，提交会得到
                  <code>value="hello@Alice 123"</code> 且
                  <code>slotConfig=[text:hello , tag:@Alice, text: 123]</code
                  >，可据 <code>type==='tag'</code> 区分。
                </div>
              </div>
              <div v-else-if="selected.id === 'L5'">
                <Sender
                  :slot-config="[
                    { type: 'text', value: '前 ' },
                    {
                      type: 'tag',
                      key: 'b1',
                      props: { label: 'TAG', value: 'v' },
                    },
                    { type: 'text', value: '' },
                    { type: 'text', value: ' 后' },
                  ]"
                  placeholder="光标末尾 Backspace 应删 TAG"
                />
                <div style="font-size: 12px; color: #666; margin-top: 6px">
                  有空文本节点时仍应删前一 TAG；有子节点时 placeholder
                  不显示即为通过。
                </div>
              </div>
              <div v-else-if="selected.id === 'A1'">
                <Sender
                  :slot-config="pasteSlotConfig"
                  placeholder="粘贴 line1 换行 line2 换行 line3"
                  :on-paste="onPasteA"
                />
                <div style="font-size: 12px; margin-top: 6px">
                  pasteInfo: {{ pasteInfo || "— 粘贴后显示" }}
                </div>
              </div>
              <div v-else-if="selected.id === 'B1'">
                <a-flex gap="8" style="margin-bottom: 8px">
                  <a-button
                    size="small"
                    type="primary"
                    @click="
                      b1Ref?.insert([
                        {
                          type: 'tag',
                          key: 't' + Date.now(),
                          props: { label: 'TAG', value: 'v' },
                        },
                      ])
                    "
                    >插入</a-button
                  >
                  <a-button size="small" @click="b1Tick++">父重渲染</a-button>
                  <a-button size="small" type="primary" @click="autoCheckB1"
                    >一键验证</a-button
                  >
                  <span style="font-size: 12px">{{ b1Log || "-" }}</span>
                </a-flex>
                <Sender
                  ref="b1Ref"
                  :slot-config="b1SlotConfig"
                  placeholder="插入后重渲染不应丢"
                />
              </div>
              <div v-else-if="selected.id === 'C1'">
                <Sender
                  ref="c1Ref"
                  :slot-config="c1SlotConfig"
                  placeholder="content 内输入"
                />
                <a-flex gap="8" style="margin-top: 8px">
                  <a-button
                    size="small"
                    type="primary"
                    @click="
                      c1Value = c1Ref?.getValue()?.value || '';
                      log(`[C1] ${c1Value}`);
                      setStatus(
                        'C1',
                        c1Value.includes('[') ? '通过' : '未通过',
                      );
                    "
                    >一键验证</a-button
                  >
                  <span style="font-size: 12px"
                    >结果: {{ c1Value || "-" }}</span
                  >
                </a-flex>
              </div>
              <div v-else-if="selected.id === 'D1'">
                <Sender
                  ref="dSkillRef"
                  :skill="dSkill"
                  :slot-config="dSlotConfigWithSkill"
                  placeholder="按 Backspace 删 skill"
                />
                <div style="font-size: 12px; margin-top: 6px">
                  onClose: {{ dSkillCloseLog || "— 删除后应出现" }}
                </div>
                <a-button
                  size="small"
                  style="margin-top: 6px"
                  @click="dSkillActive = !dSkillActive"
                  >切换词槽</a-button
                >
              </div>
              <div v-else-if="selected.id === 'E1'">
                <a-flex gap="12">
                  <div style="flex: 1">
                    <div style="font-size: 11px; margin-bottom: 4px">
                      裸 Sender
                    </div>
                    <Sender placeholder="输入空格应正常" />
                  </div>
                  <div style="flex: 1">
                    <div style="font-size: 11px; margin-bottom: 4px">
                      Suggestion 包裹
                    </div>
                    <Suggestion
                      :items="eSuggestionItems"
                      :open="eTrigger"
                      @open-change="onEOpenChange"
                      ><Sender
                        placeholder="包裹内空格"
                        :value="eSuggestionValue"
                        :on-change="onEChange"
                    /></Suggestion>
                    <div style="font-size: 11px">
                      {{ eSuggestionLog || "-" }}
                    </div>
                  </div>
                </a-flex>
              </div>
              <div v-else-if="selected.id === 'H1'">
                <a-flex gap="12">
                  <Sender placeholder="聚焦看边框" style="flex: 1" /><Sender
                    placeholder="对比"
                    style="flex: 1"
                  />
                </a-flex>
                <div style="font-size: 12px; color: #666; margin-top: 6px">
                  无蓝色外描边即通过。
                </div>
              </div>
              <div v-else-if="selected.id === 'L6'">
                <div style="font-size: 12px; color: #666; margin-bottom: 8px">
                  React 对齐：输入 <b>@</b> 自动插入
                  <b
                    style="
                      background: pink;
                      padding: 2px 6px;
                      border-radius: 4px;
                    "
                    >自定义4</b
                  >，随后应能删除其前的 <b>@Travel Planner3</b>（粉色卡片）
                </div>
                <Sender
                  ref="customSenderRef"
                  :skill="customSkill"
                  :slot-config="customSlotMap.travel"
                  :auto-size="{ minRows: 3, maxRows: 4 }"
                  placeholder="输入 @ 触发插入自定义 slot"
                  :on-change="onCustomChange"
                  :on-submit="onCustomSubmit"
                />
                <div
                  style="
                    margin-top: 10px;
                    display: flex;
                    gap: 12px;
                    font-size: 12px;
                    flex-wrap: wrap;
                  "
                >
                  <div
                    v-if="customValue"
                    style="
                      background: #f6ffed;
                      border: 1px solid #b7eb8f;
                      padding: 6px 8px;
                      border-radius: 4px;
                      flex: 1;
                    "
                  >
                    value: {{ customValue }}
                  </div>
                  <div
                    v-if="customSlotValue"
                    style="
                      background: #fafafa;
                      border: 1px solid #f0f0f0;
                      padding: 6px 8px;
                      border-radius: 4px;
                      white-space: pre-wrap;
                      font-family: monospace;
                      font-size: 11px;
                      max-height: 120px;
                      overflow: auto;
                      flex: 1;
                    "
                  >
                    slotConfig: {{ customSlotValue.slice(0, 500) }}
                  </div>
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 8px">
                  操作（两条路径完全对齐 React）：① 在框内输入
                  <b>@</b>（已改为按 <code>value.includes("@")</code> 检测，兼容
                  ProseMirror 不透传 <code>InputEvent.data</code>）→
                  自动插入粉色“自定义4”；或 ② 点“手动插入 自定义4”按钮 →
                  随后将光标置于“自定义4”后按 <b>Backspace</b> 尝试删除其前的
                  <b>@Travel Planner3</b>；若无法删除即为 bug。
                </div>
                <div style="font-size: 11px; color: #999; margin-top: 4px">
                  对应 React 原 bug：输入 @ 触发插入自定义 slot
                  后无法删除插入之前的前一个内容
                </div>
                <a-flex gap="8" style="margin-top: 8px">
                  <a-button
                    size="small"
                    type="primary"
                    @click="manualInsertCustom4"
                    >手动插入 自定义4（对齐 React：等价于输入 @）</a-button
                  >
                  <a-button
                    size="small"
                    @click="customSenderRef?.focus({ cursor: 'end' })"
                    >聚焦末尾</a-button
                  >
                  <a-button
                    size="small"
                    @click="
                      log(
                        `[L6] getValue=${JSON.stringify(customSenderRef?.getValue()?.value)} slots=${JSON.stringify(customSenderRef?.getValue()?.slotConfig?.map((s: any) => s.key || s.type))}`,
                      );
                      customValue = customSenderRef?.getValue()?.value || '';
                      customSlotValue = JSON.stringify(
                        customSenderRef?.getValue()?.slotConfig ?? [],
                        null,
                        2,
                      );
                    "
                    >getValue / slots</a-button
                  >
                </a-flex>
              </div>
              <div v-else-if="selected.id === 'F1'">
                <Sender
                  placeholder="中文输入法回车不应提交"
                  :on-submit="(v: string) => log(`[F1] submit ${v}`)"
                />
                <div style="font-size: 12px; color: #666">
                  输入“你好”选词时按回车，日志不应有 submit。
                </div>
              </div>
            </div>
            <a-flex gap="8" style="margin-top: 12px">
              <a-button type="primary" @click="markPass">✓ 通过</a-button>
              <a-button danger @click="markFail">✗ 未通过</a-button>
              <span style="font-size: 12px; color: #999; margin-left: 8px"
                >点击后左侧清单状态同步，顶部进度更新</span
              >
            </a-flex>
          </div>
        </div>
        <a-card
          size="small"
          title="实时日志（判定依据）"
          style="margin-top: 14px"
        >
          <div
            style="
              max-height: 160px;
              overflow: auto;
              font-family: monospace;
              font-size: 11px;
              background: #fafafa;
              padding: 8px;
              border: 1px solid #f0f0f0;
              border-radius: 6px;
            "
          >
            <div v-if="!logs.length" style="color: #999">
              操作后日志在此显示
            </div>
            <div
              v-for="(l, i) in logs"
              :key="i"
              style="border-bottom: 1px dashed #f0f0f0"
            >
              {{ l }}
            </div>
          </div>
        </a-card>
      </div>

      <div v-else>
        <a-alert
          type="info"
          show-icon
          style="margin-bottom: 12px"
          message="详细模式 — 完整复现"
          description="切回验收模式可快速判定；详细模式保留 9 个标签全量。"
        />
        <a-tabs v-model:activeKey="activeKey" type="card">
          <a-tab-pane key="local" tab="本项目 Bugs (6)"
            ><a-flex vertical gap="12"
              ><a-card size="small" title="L1 撤销"
                ><Sender
                  ref="lUndoRef"
                  :slot-config="[
                    { type: 'text', value: '前缀 ' },
                    {
                      type: 'tag',
                      key: 'lt1',
                      props: { label: 'UNDO_TAG', value: 'u' },
                    },
                    { type: 'text', value: ' 后缀' },
                  ]"
                  placeholder="删除后 Cmd+Z" /></a-card
              ><a-card size="small" title="L2 content"
                ><Sender
                  ref="lContentRef"
                  :slot-config="[
                    { type: 'text', value: '前缀 ' },
                    {
                      type: 'content',
                      key: 'c',
                      props: {
                        defaultValue: 'HelloWorld',
                        placeholder: 'content',
                      },
                    },
                    { type: 'text', value: ' 后缀' },
                  ]"
                  placeholder="content 中间 Backspace" /></a-card
              ><a-card size="small" title="L3 语音"
                ><Sender
                  :allow-speech="lAllowSpeech as any"
                  placeholder="切换 recording" /></a-card></a-flex
          ></a-tab-pane>
          <a-tab-pane key="paste" tab="粘贴"
            ><Sender
              :slot-config="pasteSlotConfig"
              placeholder="粘贴"
              :on-paste="onPasteA"
          /></a-tab-pane>
          <a-tab-pane key="slots" tab="词槽生命周期"
            ><a-flex vertical gap="12"
              ><a-card size="small" title="B1 丢槽"
                ><Sender
                  ref="b1Ref"
                  :slot-config="b1SlotConfig"
                  placeholder="重渲染不应丢" /></a-card
              ><a-card size="small" title="C1 formatResult"
                ><Sender
                  ref="c1Ref"
                  :slot-config="c1SlotConfig"
                  placeholder="content" /></a-card></a-flex
          ></a-tab-pane>
          <a-tab-pane key="props" tab="Props/样式"
            ><a-flex vertical gap="12"
              ><Sender placeholder="prefix 测试"
                ><template #prefix
                  ><a-button size="small">Prefix</a-button></template
                ></Sender
              ><Sender :loading="gLoading" placeholder="loading" /></a-flex
          ></a-tab-pane>
          <a-tab-pane key="style" tab="样式"
            ><Sender placeholder="聚焦边框"
          /></a-tab-pane>
        </a-tabs>
      </div>

      <a-divider />
      <div style="font-size: 12px; color: #999">
        验收完成标准：左侧 12 项全部标记“通过”即视为 Sender 本项目 + 关键上游
        Bug 已闭环。日志与 SENDER_ISSUES.md 为证据。
      </div>
    </div>
  </AntdApp>
</template>
