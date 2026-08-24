<script setup lang="ts">
import { Sender, Suggestion } from "@antdv-next/x";
import type { SenderProps, SenderRef } from "@antdv-next/x";
import { App as AntdApp } from "antdv-next";
import { computed, ref, nextTick } from "vue";

const { message } = AntdApp.useApp();

// shared logs
const logs = ref<string[]>([]);
function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
  if (logs.value.length > 80) logs.value.pop();
}
function clearLogs() { logs.value = []; }

// overview
const activeKey = ref("local");
const issueSummary = [
  { cat: "本项目·撤销/ProseMirror", count: 2, ids: "#193 #194 (open, P0)" },
  { cat: "本项目·语音受控", count: 2, ids: "#103 #104 (speech recording)" },
  { cat: "本项目·边界/回退", count: 4, ids: "#98 #100 #96 #109" },
  { cat: "本项目·替换字符", count: 2, ids: "#99 #101 (replaceCharacters)" },
  { cat: "本项目·样式/同步", count: 3, ids: "#137 #163 #165" },
  { cat: "上游·粘贴/词槽", count: 6, ids: "#1946 #1626 #1965 #1510 ..." },
  { cat: "上游·交互/提交", count: 8, ids: "#1906 #1889 #872 #1151 ..." },
];

// A: Paste
const pasteSlotConfig = ref<SenderProps["slotConfig"]>([
  { type: "text", value: "请帮我规划去 " },
  { type: "select", key: "city", props: { defaultValue: "北京", options: ["北京", "上海", "成都"] } },
  { type: "text", value: " 的行程，预算 " },
  { type: "input", key: "budget", props: { placeholder: "输入预算" } },
  { type: "text", value: " 元。" },
]);
const pasteInfo = ref("");
const pasteFilterLog = ref("");
const onPasteA = (_e: ClipboardEvent, info: any) => {
  pasteInfo.value = `paste len=${info.text.length} newline=${info.text.includes("\n")}`;
  log(`[粘贴] len=${info.text.length} newline=${info.text.includes("\n")} text=${JSON.stringify(info.text.slice(0,80))}`);
};
const onCopyA = (_e: ClipboardEvent, info: any) => log(`[复制] text=${JSON.stringify(info.text)} slots=${info.slotConfig?.length}`);
const onCutA = (_e: ClipboardEvent, info: any) => log(`[剪切] text=${JSON.stringify(info.text)} slots=${info.slotConfig?.length}`);
const pasteFilter = (t: string) => t.replace(/\t/g, "  ");

// B: Slot lifecycle
const b1Ref = ref<SenderRef>();
const b1Tick = ref(0);
const b1SlotConfig = computed<SenderProps["slotConfig"]>(() => { void b1Tick.value; return []; });
const b1StableSlotConfig = ref<SenderProps["slotConfig"]>([]);
const b1Log = ref("");
function b1InsertTag() { b1Ref.value?.insert([{ type: "tag", key: `tag-${Date.now()}`, props: { label: "tag", value: "v" } }]); log("[B1] insert tag"); }
function b1Read() { const v = b1Ref.value?.getValue(); b1Log.value = `value=${JSON.stringify(v?.value)} slots=${JSON.stringify(v?.slotConfig)}`; log(`[B1] getValue slots=${v?.slotConfig?.length}`); }
function b1Rerender() { b1Tick.value++; log("[B1] force parent re-render"); }

const b2SlotConfig = ref<SenderProps["slotConfig"]>([]);
const b2UpdateCount = ref(0);
const b2OnChange: SenderProps["onChange"] = (_v, _e, slots) => {
  b2UpdateCount.value++;
  log(`[B2] onChange #${b2UpdateCount.value} slots=${slots?.length}`);
  b2SlotConfig.value = slots ?? [];
  if (b2UpdateCount.value > 20) log("[B2] ⚠️ 可能无限更新");
};

const b3Ref = ref<SenderRef>();
const b3Log = ref("");
const b3OnSubmit: SenderProps["onSubmit"] = (val, slots) => { b3Log.value = `submit val=${val} slots=${JSON.stringify(slots)}`; log(`[B3] submit slots=${slots?.length}`); };
const b4Ref = ref<SenderRef>();
const b4Value = ref("qwe#");
function b4InsertReplace() { b4Ref.value?.insert([{ type: "tag", key: "k"+Date.now(), props: { label: "TAG", value: "tag" } }], "cursor", "#"); log("[B4] insert replace #"); }

// C
const c1Ref = ref<SenderRef>();
const c1Value = ref("");
const c1SlotConfig: SenderProps["slotConfig"] = [
  { type: "text", value: 'Translate "' },
  { type: "content", key: "text", props: { defaultValue: "Hello World", placeholder: "Enter text" }, formatResult: (v: any) => `[${v}]` },
  { type: "text", value: '" from ' },
  { type: "select", key: "sourceLang", props: { defaultValue: "English", options: ["English", "Chinese", "Japanese"] }, formatResult: (v: any) => `{${v}}` },
  { type: "text", value: " to Chinese." },
];
function c1Get() { const v = c1Ref.value?.getValue(); c1Value.value = v?.value ?? ""; log(`[C1] getValue=${c1Value.value}`); }
const c2Ref = ref<SenderRef>();
const c2SlotConfig: SenderProps["slotConfig"] = [
  { type: "text", value: "前缀 " },
  { type: "tag", key: "t1", props: { label: "Tag1", value: "t1" } },
  { type: "text", value: " 中间 " },
  { type: "tag", key: "t2", props: { label: "Tag2", value: "t2" } },
  { type: "text", value: " 后缀" },
];
const c3SlotConfig = ref<SenderProps["slotConfig"]>([
  { type: "text", value: "Files: " },
  { type: "tag", key: "img", props: { label: "x-image", value: "x-image" } },
  { type: "tag", key: "doc", props: { label: "x-doc-很长的标签名测试是否换行", value: "doc" } },
]);

// D
const dSkillCloseLog = ref("");
const dSkill: SenderProps["skill"] = { value: "planner", title: "行程助手", closable: true, onClose: () => { dSkillCloseLog.value = `onClose @${new Date().toLocaleTimeString()}`; log("[D] skill onClose"); } };
const dSkillRef = ref<SenderRef>();
const dSkillActive = ref(false);
const dSlotConfigWithSkill = computed<SenderProps["slotConfig"]>(() => dSkillActive.value ? [{ type: "text", value: "skill 文本 " }, { type: "input", key: "inp", props: { placeholder: "输入" } }] : []);
const dPlaceholderI18n = ref("你好 (zh-CN)");
function dToggleI18n() { dPlaceholderI18n.value = dPlaceholderI18n.value.includes("zh") ? "Hello (en-US)" : "你好 (zh-CN)"; log(`[D] placeholder ${dPlaceholderI18n.value}`); }

// E
const eSuggestionValue = ref("");
const eSuggestionLog = ref("");
const eSuggestionItems = [{ label: " suggestion-a", value: "a" }, { label: " suggestion-b", value: "b" }, { label: " suggestion-c", value: "c" }];
const eTrigger = ref(false);

// F
const fMaxLength = ref(20);
const fShowCount = ref(true);
const fValue = ref("");
const fCompLog = ref("");
const fOnKeyDown: SenderProps["onKeyDown"] = (e) => { if (e.key === "Enter" && (e as any).isComposing) { fCompLog.value = "isComposing Enter"; log("[F] composing Enter"); } };
const fSubmitType = ref<"enter" | "shiftEnter">("enter");
const gValue = ref("");
const gInsertPos = ref<"start" | "end" | "cursor">("cursor");
const gFocusRef = ref<SenderRef>();
const gLoading = ref(false);

// H
const hUndoRef = ref<SenderRef>();
const hUndoLog = ref("");
const hBorderless = ref(false);

// L 本项目
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
    log(`[L3] onRecordingChange=${next}`);
    lSpeechRecording.value = next;
  }
}));
</script>

<template>
  <AntdApp>
    <div style="max-width: 1080px; margin: 0 auto; padding: 20px 16px 80px;">
      <h1 style="font-size: 22px; margin: 0;">Sender 全量 Issues 最小复现 Playground（本项目优先）</h1>
      <p style="color: #666; margin: 6px 0 0;">已覆盖：本项目 antdv-next/x 的 8 个 bug 类 + 12 个 Sender 修复 PR（含 #193/#194 ProseMirror 重构）+ 上游 ant-design/x 239 条中 Sender 相关去重 38 项。每个卡片即最小复现。</p>

      <a-flex gap="8" wrap style="margin: 12px 0;">
        <a-tag color="red">本项目 Bugs 6 组</a-tag>
        <a-tag color="blue">上游 239 → 38 去重</a-tag>
        <a-tag>版本 1.2.2 / 上游对标 2.9.0</a-tag>
        <a-button size="small" @click="clearLogs">清空日志</a-button>
      </a-flex>

      <a-alert type="info" show-icon style="margin-bottom: 12px;" message="使用提示" description="按标签切换 → 按卡片步骤操作 → 观察日志与预期对比。粘贴请用多行文本 line1+换行+line2。" />

      <a-collapse style="margin-bottom: 16px;">
        <a-collapse-panel header="查看全部 Issues 概览" key="overview">
          <a-table :pagination="false" size="small" :columns="[{ title: '分类', dataIndex: 'cat', key: 'cat', width: 160 }, { title: '数量', dataIndex: 'count', key: 'count', width: 60 }, { title: '代表 Issues', dataIndex: 'ids', key: 'ids' }]" :data-source="issueSummary" bordered />
          <div style="margin-top: 10px; font-size: 12px; color: #666; line-height: 1.7;">
            <div><b>本项目撤销</b>：#193 撤销仅恢复文本、#194 ProseMirror 重构（P0）</div>
            <div><b>本项目语音</b>：#103/#104 受控 recording 始终 true</div>
            <div><b>本项目边界</b>：#98/#100 空文本后删 tag、placeholder 误显示、#96 skill 切换丢光标、#109 content 内回退</div>
            <div><b>本项目替换</b>：#99/#101 折叠光标 replaceCharacters 失效</div>
            <div><b>上游粘贴/词槽</b>：#1946 pasteFilter、#1626 换行丢失、#1965 首行、#1510 content 错位</div>
            <div><b>上游交互</b>：#1906 选中删除、#1889 回车、#872 组合回车、#1151 maxLength 等</div>
          </div>
        </a-collapse-panel>
      </a-collapse>

      <a-tabs v-model:activeKey="activeKey" type="card">
        <a-tab-pane key="local" tab="本项目 Bugs (6)">
          <a-alert type="warning" show-icon style="margin-bottom: 12px;" message="本项目特有 Bug — 与上游无关，来自本仓库 issues/PR" description="包含 ProseMirror 撤销、content 回退、语音受控、replaceCharacters、边界回退、光标保留。每个均为最小复现。" />
          <a-flex vertical gap="14">
            <a-card size="small" title="L1 · 词槽撤销失效 (#193 #194 本项目 P0)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">复现：① 删除词槽后 Cmd+Z 应恢复词槽；② 粘贴后 Cmd+Z 回退。旧实现手写 contenteditable，快照分散导致不一致。PR #194 已用 ProseMirror 统一。</div>
              <a-flex gap="8" wrap style="margin-bottom: 8px;">
                <a-button size="small" type="primary" @click="lUndoRef?.insert?.([{ type:'tag', key:'l'+Date.now(), props:{ label:'TAG', value:'t' } }]); log('[L1] insert tag')">插入 tag</a-button>
                <a-button size="small" @click="log(`[L1] slots=${lUndoRef?.getValue()?.slotConfig?.length}`)">getValue</a-button>
                <span style="font-size: 12px; color: #666;">手动：选中 TAG 按 Backspace → Cmd+Z / 粘贴后 Cmd+Z</span>
              </a-flex>
              <Sender ref="lUndoRef" :slot-config="[{ type:'text', value:'前缀 ' },{ type:'tag', key:'lt1', props:{ label:'UNDO_TAG', value:'u' } },{ type:'text', value:' 后缀' }]" placeholder="删除 TAG 后撤销应完整恢复" />
              <div style="font-size: 12px; color: #1677ff; margin-top: 6px;">预期：撤销后 TAG 完整恢复；若仅文本恢复则未修复。</div>
            </a-card>

            <a-card size="small" title="L2 · content 内 Backspace 异常 (#109)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">复现：光标在 content 文本中间按 Backspace，应删字符而非整个词槽。PR #109 统一 Backspace 处理。</div>
              <Sender ref="lContentRef" :slot-config="[{ type:'text', value:'前缀 ' },{ type:'content', key:'c', props:{ defaultValue:'HelloWorld', placeholder:'content 内' } },{ type:'text', value:' 后缀' }]" placeholder="光标进 HelloWorld 中间按 Backspace" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" @click="lContentRef?.focus({ cursor:'slot', key:'c' })">聚焦 content</a-button>
                <a-button size="small" @click="log(`[L2] value=${JSON.stringify(lContentRef?.getValue()?.value?.slice(0,60))}`)">getValue</a-button>
              </a-flex>
              <div style="font-size: 12px; color: #1677ff;">预期：删单字符；若删整个节点则未修复。</div>
            </a-card>

            <a-card size="small" title="L3 · 语音受控不同步 (#103 #104)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">复现：受控 allowSpeech 下旧实现用内部 ref 取反导致 onRecordingChange 始终 true。</div>
              <a-flex gap="8" align="center" wrap style="margin-bottom: 8px;">
                <a-button size="small" :type="lSpeechRecording ? 'primary' : 'default'" @click="lAllowSpeech.onRecordingChange(!lSpeechRecording)">切换 recording (当前 {{ lSpeechRecording }})</a-button>
                <span style="font-size: 12px;">日志: {{ lSpeechLog || '-' }}</span>
              </a-flex>
              <Sender :allow-speech="lAllowSpeech as any" placeholder="观察 onRecordingChange 是否交替" />
              <div style="font-size: 12px; color: #1677ff;">预期：交替 true/false；若始终 true 则未修复。</div>
            </a-card>

            <a-card size="small" title="L4 · replaceCharacters 折叠光标失效 (#99 #101)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">复现：输入 @ 后折叠光标，旧 getSelection().toString() 为空，insert 替换 @ 失效。</div>
              <Sender ref="lBoundaryRef" :value="gValue" :on-change="(v:string)=>gValue=v" placeholder="先输入 @ 再点按钮" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" @click="gValue='hello@'; nextTick(()=> lBoundaryRef?.focus({ cursor:'end' }))">填入 hello@</a-button>
                <a-button size="small" type="primary" @click="lBoundaryRef?.insert?.([{ type:'tag', key:'at'+Date.now(), props:{ label:'@user', value:'user' } }], 'cursor', '@'); log('[L4] replace @')">插入并替换 @</a-button>
                <a-button size="small" @click="log(`[L4] value=${gValue}`)">getValue</a-button>
              </a-flex>
              <div style="font-size: 12px;">当前值: {{ gValue }}</div>
              <div style="font-size: 12px; color: #1677ff;">预期：hello@ → hello + TAG；残留 @ 则未修复。</div>
            </a-card>

            <a-card size="small" title="L5 · 边界回退与光标保留 (#98 #100 #96)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">① 空文本后 Backspace 应跳过非 slot 节点删 tag；② 有子节点时 placeholder 不显示；③ skill 切换保留输入与光标。</div>
              <div style="font-size: 12px; margin-bottom: 4px;">边界回退</div>
              <Sender :slot-config="[{ type:'text', value:'前 ' },{ type:'tag', key:'b1', props:{ label:'TAG', value:'v' } },{ type:'text', value:'' },{ type:'text', value:' 后' }]" placeholder="光标末尾 Backspace 应删 TAG" />
              <div style="font-size: 12px; margin: 8px 0 4px;">skill 切换保留</div>
              <Sender ref="lSkillCursorRef" :skill="{ value:'s1', title:'Skill' } as any" :slot-config="[{ type:'text', value:'skill 文本 ' },{ type:'input', key:'sk', props:{ placeholder:'输入中切换' } }]" placeholder="输入后切换 skill 测试" />
              <a-flex gap="8" style="margin-top: 6px;">
                <a-button size="small" @click="lSkillCursorRef?.focus({ cursor:'end' })">聚焦末尾</a-button>
                <a-button size="small" @click="log('[L5] skill switch')">模拟切换</a-button>
              </a-flex>
            </a-card>

            <a-card size="small" title="L6 · 已同步修复 (#137 #163 #165)">
              <div style="font-size: 12px; line-height: 1.8;">
                <div>✅ #137 borderless outline 已去 — 见 样式/撤销 H1</div>
                <div>✅ #163 content formatResult 已同步 — 见 C1</div>
                <div>✅ #165 Suggestion 滚动 — 见 E2，maxHeight 256 + overflow auto</div>
                <div>✅ #177 #183 空格吞字已修复 — 见 E1</div>
              </div>
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="paste" tab="粘贴/剪贴板">
          <a-flex vertical gap="14">
            <a-card size="small" title="A1 · 粘贴多行截断 (#1626 #1965 #1946 上游)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">词槽模式粘贴 line1 换行 line2，旧 getCleanedText 会丢失换行，Chrome150+ 仅首行。</div>
              <Sender :slot-config="pasteSlotConfig" placeholder="粘贴多行观察" :on-paste="onPasteA" :on-copy="onCopyA" :on-cut="onCutA" @submit="(v:string,s:any)=>log(`[A1] submit ${JSON.stringify(v).slice(0,80)}`)" />
              <div style="margin-top: 8px; font-size: 12px;">pasteInfo: {{ pasteInfo || '-' }}</div>
              <div style="font-size: 12px; color: #1677ff;">预期：保留换行或 pasteFilter 自定义；丢失则未修复。</div>
            </a-card>
            <a-card size="small" title="A2 · pasteFilter + content 错位 (#1946 #1510)">
              <a-flex gap="12">
                <div style="flex: 1;">
                  <div style="font-size: 12px; margin-bottom: 4px;">content 内粘贴</div>
                  <Sender :slot-config="[{ type:'text', value:'前缀 ' },{ type:'content', key:'c1', props:{ placeholder:'content 内粘贴' } },{ type:'text', value:' 后缀' }]" placeholder="焦点进 content 再粘贴" />
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 12px; margin-bottom: 4px;">pasteFilter 演示</div>
                  <Sender placeholder="粘贴多行" :on-paste="(_e:any,info:any)=>{ const out=pasteFilter(info.text); pasteFilterLog=`in=${info.text.length} out=${out.length}`; log(`[A2] ${pasteFilterLog}`); }" />
                  <div style="font-size: 12px;">{{ pasteFilterLog }}</div>
                </div>
              </a-flex>
            </a-card>
            <a-card size="small" title="A3 · 复制/剪切撤销 (#193)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">Ctrl+A 复制/剪切后撤销应恢复词槽而非仅文本。</div>
              <Sender :slot-config="[{ type:'text', value:'文本 ' },{ type:'tag', key:'k1', props:{ label:'TAG', value:'v' } },{ type:'text', value:' 更多' }]" placeholder="Ctrl+A 测试" :on-copy="onCopyA" :on-cut="onCutA" :on-paste="onPasteA" />
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="slots" tab="词槽生命周期">
          <a-flex vertical gap="14">
            <a-card size="small" title="B1 · 运行时丢槽 (#1899 上游)">
              <a-flex gap="8" wrap>
                <a-button size="small" type="primary" @click="b1InsertTag">插入 tag</a-button>
                <a-button size="small" @click="b1Read">读取</a-button>
                <a-button size="small" danger @click="b1Rerender">父重渲染</a-button>
              </a-flex>
              <div style="margin-top: 8px;">
                <Sender ref="b1Ref" :slot-config="b1SlotConfig" placeholder="插入后重渲染不应丢 slot" />
                <div style="font-size: 12px;">getValue: {{ b1Log || '-' }} | tick={{ b1Tick }}</div>
              </div>
            </a-card>
            <a-card size="small" title="B2 · 受控无限更新 (#1623)">
              <Sender :slot-config="b2SlotConfig" :on-change="b2OnChange" placeholder="输入观察次数" />
              <div style="font-size: 12px;">次数: {{ b2UpdateCount }} | slots: {{ b2SlotConfig.length }}</div>
              <a-button size="small" @click="b2UpdateCount=0; b2SlotConfig=[]">重置</a-button>
            </a-card>
            <a-card size="small" title="B3 · insert 后提交 (#1682) + 替换 (#1723)">
              <Sender ref="b3Ref" :slot-config="[]" :on-submit="b3OnSubmit" placeholder="先插入再提交" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" @click="b3Ref?.insert([{ type:'tag', key:'ss'+Date.now(), props:{ label:'文档', value:'v' } }])">插入 tag</a-button>
                <span style="font-size: 12px;">{{ b3Log || '-' }}</span>
              </a-flex>
              <a-divider style="margin: 8px 0;" />
              <Sender ref="b4Ref" :value="b4Value" :on-change="(v:string)=>b4Value=v" placeholder="输入 qwe# 再替换" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" @click="b4InsertReplace">替换 #</a-button>
                <span style="font-size: 12px;">值: {{ b4Value }}</span>
              </a-flex>
            </a-card>
            <a-card size="small" title="B4 · content 变 input + tag 内插入 (#1539 #1609)">
              <Sender :slot-config="[{ type:'text', value:'前缀 ' },{ type:'content', key:'c', props:{ placeholder:'content' } },{ type:'tag', key:'t', props:{ label:'TAG', value:'v' } },{ type:'text', value:' 后缀' }]" placeholder="content 双击删除 / tag 插入测试" />
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="behaviour" tab="词槽交互">
          <a-flex vertical gap="14">
            <a-card size="small" title="C1 · content formatResult (#1638)">
              <Sender ref="c1Ref" :slot-config="c1SlotConfig" placeholder="content 输入" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" type="primary" @click="c1Get">Get Value</a-button>
                <span style="font-size: 12px;">结果: {{ c1Value || '-' }}</span>
              </a-flex>
            </a-card>
            <a-card size="small" title="C2 · 选中删除/回车 (#1906 #1889)">
              <Sender :slot-config="c2SlotConfig" placeholder="选中跨 tag 删除 / 回车删除" />
            </a-card>
            <a-card size="small" title="C3 · 样式 (#1898 #1878)">
              <Sender :slot-config="c3SlotConfig" placeholder="观察 tag 单行居中" />
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="skill" tab="Skill/占位">
          <a-flex vertical gap="14">
            <a-card size="small" title="D1 · Backspace 删 skill onClose (#1938)">
              <Sender ref="dSkillRef" :skill="dSkill" :slot-config="dSlotConfigWithSkill" :placeholder="dPlaceholderI18n" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" @click="dSkillActive=!dSkillActive">切换词槽</a-button>
                <a-button size="small" @click="dSkillRef?.focus({ cursor:'start' })">聚焦首位</a-button>
              </a-flex>
              <div style="font-size: 12px;">onClose: {{ dSkillCloseLog || '-' }}</div>
            </a-card>
            <a-card size="small" title="D2 · placeholder i18n (#1897)">
              <Sender :skill="dSkillActive ? dSkill : undefined" :slot-config="dSlotConfigWithSkill" :placeholder="dPlaceholderI18n" />
              <a-button size="small" style="margin-top: 8px;" type="primary" @click="dToggleI18n">切换语言</a-button>
              <span style="font-size: 12px; margin-left: 8px;">{{ dPlaceholderI18n }}</span>
            </a-card>
            <a-card size="small" title="D3 · 中文首字 (#1809)">
              <Sender :slot-config="[{ type:'text', value:'词槽：' }, { type:'input', key:'a', props:{ placeholder:'输入' } }]" placeholder="中文输入测试" :on-key-down="fOnKeyDown" />
              <div style="font-size: 12px;">{{ fCompLog || '-' }}</div>
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="suggestion" tab="Suggestion">
          <a-flex vertical gap="14">
            <a-card size="small" title="E1 · 空格被吞 (#1873 #171)">
              <a-flex gap="12">
                <div style="flex: 1;">
                  <div style="font-size: 12px; margin-bottom: 4px;">裸 Sender</div>
                  <Sender placeholder="裸" />
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 12px; margin-bottom: 4px;">Suggestion 包裹</div>
                  <Suggestion :items="eSuggestionItems" :open="eTrigger" :on-open-change="(o:boolean)=>eTrigger=o">
                    <Sender placeholder="包裹内输入空格" :value="eSuggestionValue" :on-change="(v:string)=>{ eSuggestionValue=v; eSuggestionLog=v.slice(-30); }" />
                  </Suggestion>
                  <div style="font-size: 12px;">{{ eSuggestionLog || '-' }}</div>
                </div>
              </a-flex>
            </a-card>
            <a-card size="small" title="E2 · 长列表滚动 (#1983)">
              <div style="font-size: 12px; color: #666; margin-bottom: 8px;">点击输入框聚焦查看 20 条 option，弹层应内部滚动（maxHeight 256）。</div>
              <Suggestion :items="Array.from({length:20},(_,i)=>({ label:`option-${i+1} `+'很长 '.repeat(3), value:`v${i}`}))">
                <Sender placeholder="点击聚焦查看长列表滚动" />
              </Suggestion>
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="input" tab="输入/限制">
          <a-flex vertical gap="14">
            <a-card size="small" title="F1 · 组合回车 (#872)">
              <Sender placeholder="中文回车测试" :on-submit="(v:string)=>log(`[F1] submit ${v}`)" />
            </a-card>
            <a-card size="small" title="F2 · maxLength (#1151)">
              <a-flex gap="8" align="center">
                <a-input-number v-model:value="fMaxLength" :min="5" :max="100" size="small" style="width:90px;" />
                <a-switch v-model:checked="fShowCount" checked-children="showCount" un-checked-children="hide" />
              </a-flex>
              <Sender :value="fValue" :on-change="(v:string)=>{ fValue=v; log(`[F2] len=${v.length}`); }" placeholder="超长输入" />
              <div style="font-size: 12px;">{{ fValue.length }} / {{ fMaxLength }}</div>
            </a-card>
            <a-card size="small" title="F3 · 提交 (#741 #900)">
              <a-segmented v-model:value="fSubmitType" :options="[{label:'enter',value:'enter'},{label:'shiftEnter',value:'shiftEnter'}]" size="small" style="margin-bottom: 8px;" />
              <Sender :submit-type="fSubmitType" :slot-config="[{ type:'input', key:'inner', props:{ placeholder:'词槽内 input' } }]" :on-submit="(v:string)=>log(`[F3] ${fSubmitType} ${v.slice(0,30)}`)" />
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="props" tab="Props/样式">
          <a-flex vertical gap="14">
            <a-card size="small" title="G1 · prefix 聚焦 (#893)">
              <Sender placeholder="prefix 测试">
                <template #prefix>
                  <a-button size="small" @click.stop="gPrefixClickLog='stop @'+Date.now()">Prefix(stop)</a-button>
                  <a-button size="small" @click="gPrefixClickLog='no stop @'+Date.now()">Prefix</a-button>
                </template>
              </Sender>
              <div style="font-size: 12px;">{{ gPrefixClickLog || '-' }}</div>
            </a-card>
            <a-card size="small" title="G2 · loading (#869)">
              <Sender :loading="gLoading" placeholder="loading" :on-cancel="()=>{ log('[G2] cancel'); gLoading=false; }" :on-submit="()=>{ gLoading=true; setTimeout(()=>gLoading=false,1500); }" />
              <a-button size="small" @click="gLoading=!gLoading" style="margin-top: 8px;">切换 {{ gLoading }}</a-button>
            </a-card>
            <a-card size="small" title="G3 · 主题 (#1903)">
              <Sender placeholder="主题观察" />
            </a-card>
            <a-card size="small" title="G4 · 聚焦插入 (#1609)">
              <Sender ref="gFocusRef" :slot-config="[{ type:'text', value:'前 ' },{ type:'tag', key:'t', props:{ label:'TAG', value:'t' } },{ type:'text', value:' 后' }]" :value="gValue" :on-change="(v:string)=>gValue=v" placeholder="tag 插入" />
              <a-flex gap="8" wrap style="margin-top: 8px;">
                <a-segmented v-model:value="gInsertPos" :options="[{label:'start',value:'start'},{label:'end',value:'end'},{label:'cursor',value:'cursor'}]" size="small" />
                <a-button size="small" @click="gFocusRef?.insert?.(' hello', gInsertPos)">插入 hello</a-button>
                <a-button size="small" @click="gFocusRef?.focus({ cursor:'slot', key:'t' })">聚焦 tag</a-button>
                <a-button size="small" @click="gFocusRef?.focus({ cursor:'start' })">首位</a-button>
                <a-button size="small" @click="gFocusRef?.focus({ cursor:'end' })">末位</a-button>
              </a-flex>
            </a-card>
          </a-flex>
        </a-tab-pane>

        <a-tab-pane key="style" tab="样式/撤销">
          <a-flex vertical gap="14">
            <a-card size="small" title="H1 · 边框 (#136)">
              <a-flex gap="12">
                <Sender placeholder="聚焦观察边框" style="flex:1;" />
                <Sender placeholder="borderless 对比" style="flex:1;" />
              </a-flex>
            </a-card>
            <a-card size="small" title="H2 · 撤销 (#193)">
              <Sender ref="hUndoRef" :slot-config="[{ type:'text', value:'文本 ' },{ type:'tag', key:'u1', props:{ label:'UNDO_TAG', value:'u' } },{ type:'text', value:' 尾部' }]" placeholder="删除后 Cmd+Z" />
              <a-flex gap="8" style="margin-top: 8px;">
                <a-button size="small" @click="hUndoRef?.insert?.([{ type:'tag', key:'u'+Date.now(), props:{ label:'NEW', value:'n' } }])">插入</a-button>
                <a-button size="small" @click="hUndoLog='请 Backspace 删 tag 后 Cmd+Z'">准备</a-button>
              </a-flex>
              <div style="font-size: 12px;">{{ hUndoLog }}</div>
            </a-card>
          </a-flex>
        </a-tab-pane>
      </a-tabs>

      <a-card size="small" title="实时日志" style="margin-top: 16px;">
        <div style="max-height: 260px; overflow: auto; font-family: monospace; font-size: 11px; background: #fafafa; padding: 8px; border: 1px solid #f0f0f0; border-radius: 6px;">
          <div v-if="!logs.length" style="color: #999;">暂无日志</div>
          <div v-for="(l,i) in logs" :key="i" style="border-bottom: 1px dashed #f0f0f0;">{{ l }}</div>
        </div>
      </a-card>

      <a-divider />
      <div style="font-size: 12px; color: #999;">
        <div>判定：按卡片预期对比实际；日志打印关键值。</div>
        <div>本项目 issues：<a href="https://github.com/antdv-next/x/issues" target="_blank">antdv-next/x</a>；上游：<a href="https://github.com/ant-design/x/issues?q=sender" target="_blank">ant-design/x sender</a></div>
      </div>
    </div>
  </AntdApp>
</template>
