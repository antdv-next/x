# Sender 全量 Issues 最小复现目录 — 本项目优先

> 生成 2026-08-24 更新：新增本项目 antdv-next/x 特有 Bug 专区 | playground 入口 `src/App.vue` 默认 `local` 标签

## 1. 本项目（antdv-next/x）Sender Bug — 必须复现

> 这些是本仓库真实出现过的 Bug，来自 `issues` 与 `PR` 修复历史，与上游无关。已在 `App.vue → 本项目 Bugs (6)` 提供最小复现。

| ID | 状态 | 标题 | 根因 | 最小复现（见 App.vue） |
|---|---|---|---|---|
| #193 | open bug | Sender 在词槽模式下撤销存在多个问题 | 手写 contenteditable + 分散快照，删除/粘贴 undo 不一致 | L1：插入 TAG → Backspace 删 → Cmd+Z；粘贴后 Cmd+Z |
| #194 | open PR | fix(Sender): fix slot mode undo for paste and deletion (对应 #193) | 用 ProseMirror 统一文档/历史/选区 | 同 L1，R193 修复后应完整恢复 |
| #109 | closed PR | fix(sender): fix content slot backspace deletion | content 内字符删除误删整个节点 | L2：content 内 HelloWorld 中间 Backspace |
| #103 | closed PR | fix(sender): 修复受控模式下 onRecordingChange 始终 true | 用内部 ref 取反而非受控值 | L3：切换 recording 观察交替 |
| #104 | closed PR | fix(sender): sync controlled speech recording state | 同 #103 配套同步 | 同 L3 |
| #99 | closed PR | feat(sender): expose replaceCharacters parameter in insert API | 暴露替换参数 | L4：hello@ → 插入 TAG 替换 @ |
| #101 | closed PR | fix(sender): replaceCharacters not working for collapsed caret | 折叠光标 toString() 为空 | 同 L4，验证 @ 被删 |
| #98 | closed PR | fix(sender): remove slot before cursor when backspacing at editor boundary | 边界空节点未跳过 | L5：空文本后 Backspace 删 TAG |
| #100 | closed PR | fix(sender): skip non-slot nodes when backspacing at editor boundary + placeholder | 同 #98 + isEmpty 误判 | 同 L5，placeholder 不应显示 |
| #96 | closed PR | fix(sender): preserve cursor and user input when skill slot config changes | skill 切换丢光标/输入 | L5：skill 文本输入中切换 |
| #137 | closed PR | fix(sender): suppress borderless focus outline | borderless 被 antd 新增 outline | H1：聚焦无蓝色描边 |
| #163 | closed PR | [sync] fix(sender): support formatResult for content slots (#1986) | content 跳过 formatResult | C1：content 输入 → Get Value 应含 [] |
| #165 | closed PR | [sync] fix(suggestion): scroll long option lists (#1983) | 无 maxHeight/overflow | E2：20 条 option 应滚动 |
| #177 / #183 | closed PR | fix(suggestion): stop/narrow trigger keyboard guard | BaseSelect 吞空格/回车 | E1：Suggestion 内空格 |

**本项目未标记 bug 但属 Sender 修复的历史 PR 也已覆盖：** #101 已上，#96/#98/#100 边界类已合并至 L5。

## 2. 上游（ant-design/x）Sender 相关 — 239 条中去重 38 项

> 上游搜索 `repo:ant-design/x sender in:title,body` 239 命中，去重后在 App.vue 其余 7 个标签中复现。

| 分类 | 代表 Issues | 复现位置 |
|---|---|---|
| 粘贴/剪贴板 | #1946 pasteFilter、#1626 换行丢失、#1965 Chrome150 仅首行、#1510 content 错位 | A1-A3 |
| 词槽生命周期 | #1899 运行时丢槽、#1623 无限更新、#1682 插入取不到、#1723 replace、#1539 变 input、#1609 tag 内插入 | B1-B4 |
| 词槽交互 | #1906 选中删除、#1889 回车删不掉、#1898 未居中、#1878 x-image 多行 | C2-C3 |
| Skill/Placeholder | #1938/#1955 Backspace 未触发 onClose、#1897 i18n placeholder、#1809 中文首字 | D1-D3 |
| Suggestion | #1873 空格被吞、#1999 保留空格 | E1 |
| 输入法/提交 | #872/#1732 组合回车误提交、#1151 maxLength、#741 仅附件、#900 submitType | F1-F3 |
| Props/样式 | #893 prefix 聚焦、#1944 components、#869 loading、#1903 主题、#1963 边框 | G1-G4, H1 |

## 3. Playground 使用

```
pnpm --filter playground dev   # 或 vp dev
# 打开 http://localhost:5173，默认 本项目 Bugs 标签
```

- 每个卡片标题含 `本项目 #xxx` 或 `上游 #xxx` 明确来源
- 底部实时日志打印 `getValue().slotConfig.length`、`onRecordingChange`、`onClose` 等判定值
- 判定标准：卡片内“预期 vs 实际”；符合“预期”即已修复

## 4. 验证

- `pnpm --filter playground build` ✅ 5407 modules, 2.5M JS, 1.10s
- `vp check` 对 Sender 相关 5 测试文件 152 用例通过（见 PR #194）

## 5. 链接

- 本项目 issues：https://github.com/antdv-next/x/issues
- 上游 sender 搜索：https://github.com/ant-design/x/issues?q=sender
- 同步游标：`.sync-upstream.json` last 25aad7b / 2.9.0
