import type { TokenizerAndRendererExtension } from "marked";
import type { Component } from "vue";

export enum StreamCacheTokenType {
  Text = "text",
  Link = "link",
  Image = "image",
  Html = "html",
  Emphasis = "emphasis",
  List = "list",
  Table = "table",
  InlineCode = "inline-code",
}

export interface FenceState {
  /** Inside an open fence, considering completed lines only */
  inFenced: boolean;
  fenceChar: string;
  fenceLen: number;
  /**
   * Content indent of the list item the open fence belongs to, or null for a
   * top-level fence. A contained fence ends implicitly as soon as a non-blank
   * line dedents below this indent (the item ends there and the fence with
   * it), which the line-level scanner cannot see on its own — the section
   * tracker re-reads each completed line against the list-container stack and
   * applies such exits itself. The tracker likewise *opens* and *closes*
   * fences the scanner is blind to (0–3 spaces past an item's content indent
   * but 4+ spaces absolutely) by setting the scanner fields directly.
   */
  fenceCi: number | null;
  /**
   * The verdict the char-level scanner applied to the last completed line,
   * consumed (and reset to null) by the section tracker. The scanner is blind
   * to list containers and raw/HTML blocks, so some of its opens and closes
   * are phantoms the tracker has to undo or re-interpret.
   */
  lastVerdict: "opened" | "closed" | null;
  /** Spaces before the fence run of the current line; a fence may be indented up to 3 */
  lineIndent: number;
  /** Leading `` ` ``/`~` run of the current (possibly incomplete) line */
  lineFenceChar: string;
  lineFenceLen: number;
  lineFenceRunEnded: boolean;
  /** Whether every char after the leading run is whitespace (closing fences allow only whitespace) */
  lineTailBlank: boolean;
}

/**
 * Incremental table-shape state over `pending`, updated in O(1) per character —
 * the same trick FenceState already uses. Re-scanning the whole pending buffer
 * on every character is O(N²), and a table stays pending until its terminating
 * blank line, so a long table pays that cost in full.
 */
export interface TableState {
  /** Number of '\n' seen in pending */
  newlines: number;
  /** Whether the previous character was '\n' (used to detect the '\n\n' terminator) */
  lastWasNewline: boolean;
  /** pending contains a blank line, i.e. the table block already ended */
  hasBlankLine: boolean;
  /** pending's first line — the header row */
  firstLine: string;
  /** pending's second line — the delimiter row; may still be growing */
  secondLine: string;
  /**
   * Memoized header/delimiter verdict. Stays null while the delimiter row is
   * still being streamed (the verdict can change as it grows) and is frozen
   * once that row is terminated, after which it never changes again.
   */
  shape: boolean | null;
}

/**
 * Incremental section-boundary state for `streaming.incremental`. A section
 * boundary is an offset (into the input) where a new top-level block starts
 * and everything before it can be parsed on its own with the same result as
 * parsing the whole document. Only column-0 ATX headings qualify.
 */
export interface SectionState {
  /** Offsets where a new section starts. The first section implicitly starts at 0. */
  offsets: number[];
  /** Offset of the first character of the line currently being streamed */
  lineStart: number;
  /**
   * Inside an HTML block of CommonMark type 3–7, which ends at the next blank
   * line. A `#` line inside it is HTML text, not a heading.
   */
  inHtmlBlock: boolean;
  /**
   * Set once a construct that can be referenced from another section has been
   * seen (link reference / footnote definitions). Splitting is disabled for the
   * rest of the stream and any offsets recorded so far are discarded.
   */
  noSplit: boolean;
  /**
   * An open block whose body may contain blank lines and heading-looking lines
   * (`<pre>`, `<script>`, `<style>`, `<textarea>`, HTML comments, `$$` math,
   * `\[` math). No boundary is recorded until it closes. `bodyChars` matters
   * only for `exact` (`$$` math): the plugin's rule needs a non-empty body
   * between opener and closing run, so a closing run is body text while the
   * accumulated body (each consumed line plus its newline) is shorter than
   * two characters.
   */
  rawBlock: { close: string; exact: boolean; bodyChars?: number } | null;
  /**
   * A block opener the previous line held back because a paragraph was open
   * (a type 3–5 raw block, block math, or a type-7 HTML tag). marked's
   * paragraph rule stops *before* such a line whenever it heads a gfm table —
   * the table lookahead only needs this line plus a delimiter row — so the
   * opener actually interrupts the paragraph in that case. The delimiter row
   * activates the recorded state; any other next line discards it.
   */
  blockedOpener: {
    rawBlock: SectionState["rawBlock"];
    inHtmlBlock?: boolean;
  } | null;
  /**
   * Open list containers, innermost last. Maintained by the section tracker,
   * which re-implements marked's list-item continuation algorithm: the block
   * parser binds every line of a list item to the item's content indent,
   * while the char-level fence scanner reads lines in isolation — a fence
   * indented 1–3 spaces *inside a list item* is where the two would otherwise
   * disagree.
   */
  listStack: ListContainer[];
  /**
   * Whether the innermost open leaf block is a paragraph. Drives top-level
   * interruption rules (a fresh list may not interrupt a paragraph with a
   * tab-delimited or non-1 ordered marker, a type-7 HTML tag cannot interrupt
   * one, a blockquote attaches lazily). Inside a list item, continuation is
   * governed by the entry's `blank`/`lineVeto` instead.
   */
  paragraphOpen: boolean;
  /**
   * Whether the line that last joined the open paragraph is legal setext
   * content. marked matches a paragraph and its setext underline atomically,
   * and its paragraph rule stops at the first line the setext rule can start
   * matching from — so a pending underline fires exactly when the line right
   * before it is valid content (no column-0 marker followed by a space, no
   * 4-space/tab indent, no fence, no quote, no heading, no tag-only HTML
   * line); earlier lines of the run are irrelevant.
   */
  paragraphEligible: boolean;
  /**
   * The last line belonged to a top-level blockquote whose last `>` line had
   * non-empty content: marked's blockquote rule bakes the paragraph
   * continuation into its regex, so the quote lazily absorbs following lines
   * until a blank, a thematic break, an ATX heading, a fence, a quote line, a
   * bullet/`1.` marker followed by a space, or a block-tag HTML line ends it.
   * Absorbed lines start no block of their own (no raw block, no list, no
   * paragraph). Fences and nested quotes as the quote's last inner token void
   * the continuation (marked's tokenizer breaks there), as does an indented
   * code token.
   */
  bqLazy: boolean;
  /**
   * A fence opened inside a blockquote (the char-level scanner only sees the
   * `>`-prefixed lines, never the fence itself). While set, `>`-prefixed
   * lines are fence body (no paragraph state is derived from them), and the
   * first non-blockquote line ends the blockquote with no paragraph left
   * open — a fence cannot be lazily continued the way a paragraph can.
   */
  bqFence: { char: string; len: number } | null;
}

/**
 * One open list container; see SectionState.listStack. `blank` and `lineVeto`
 * mirror the two flags marked's list tokenizer maintains while collecting an
 * item's lines: a dedenting line ends the item when either is set, otherwise
 * it joins the item as a lazy continuation — even inside an open fence.
 */
export interface ListContainer {
  /** Absolute column the item's content starts at (the content indent) */
  ci: number;
  /** Absolute column of the list marker itself */
  mIndent: number;
  /**
   * Bullet character (`-`/`+`/`*`) or ordered delimiter (`.`/`)`): two
   * consecutive markers belong to the same list only when both match.
   */
  kind: string;
  /**
   * The item's first line was blank, or a blank line has been consumed into
   * it (marked's `blankLine` flag).
   */
  blank: boolean;
  /**
   * The item's first line was blank and no line has been consumed into it
   * since (marked's `R` at its pre-loop check): an immediately following
   * blank line ends the item there instead of only blank-tailing it.
   */
  empty: boolean;
  /**
   * The previous content line's slice matches one of marked's
   * lazy-continuation vetoes: indented code, or a fence/heading/thematic-
   * break begin.
   */
  lineVeto: boolean;
}

export interface StreamCache {
  pending: string;
  token: StreamCacheTokenType;
  processedLength: number;
  completeMarkdown: string;
  fence: FenceState;
  table: TableState;
  sections: SectionState;
}

export interface AnimationConfig {
  /**
   * @description 淡入动画的持续时间（毫秒）
   * @description The duration of the fade-in animation in milliseconds
   * @default 200
   */
  fadeDuration?: number;
  /**
   * @description 动画的缓动函数
   * @description Easing function for the animation
   * @default 'ease-in-out'
   */
  easing?: string;
  /**
   * @description 淡入的单位。`chunk` 每次新到的文本单独淡入；`sentence` 把新到的文本并入当前句子，到分隔符才开始下一个淡入单元。与 `typewriter` 同时使用时应选 `sentence`，否则每帧放出的几个字都会各自成为一个淡入节点
   * @description Unit of the fade-in. `chunk` fades in each newly arrived piece of text on its own; `sentence` appends new text to the current sentence and starts a new fade-in unit only after a delimiter. Use `sentence` together with `typewriter`, otherwise every few characters revealed per frame become their own fade-in node
   * @default 'chunk'
   */
  splitBy?: "chunk" | "sentence";
  /**
   * @description `splitBy` 为 `sentence` 时的句子分隔符
   * @description Sentence delimiters used when `splitBy` is `sentence`
   * @default ['。', '！', '？', '.', '!', '?', '\n']
   */
  delimiters?: string[];
  /**
   * @description `splitBy` 为 `sentence` 时一个淡入单元最多容纳的字符数，超过后新到的文本另起一个单元
   * @description With `splitBy: 'sentence'`, the most characters one fade-in unit holds; text arriving beyond it starts a new unit
   * @default 120
   */
  maxSentenceChars?: number;
}

export interface TypewriterConfig {
  /**
   * @description 放出文本的单位。`char` 逐字放出；`sentence` 攒到分隔符再一起放出（围栏代码和行内代码里的分隔符不算，换行总是分隔符）
   * @description Unit in which text is revealed. `char` reveals character by character; `sentence` reveals up to the next delimiter at once (delimiters inside fenced or inline code do not count, a newline always does)
   * @default 'char'
   */
  unit?: "char" | "sentence";
  /**
   * @description 句子分隔符
   * @description Sentence delimiters
   * @default ['。', '！', '？', '.', '!', '?', '\n']
   */
  delimiters?: string[];
  /**
   * @description 最低放出速度（字/秒）。速度会随 chunk 到达节奏自适应，这是下限
   * @description Minimum reveal speed in characters per second. The speed adapts to the chunk cadence; this is the floor
   * @default 24
   */
  minCps?: number;
  /**
   * @description 最高放出速度（字/秒）
   * @description Maximum reveal speed in characters per second
   * @default 3000
   */
  maxCps?: number;
  /**
   * @description `unit` 为 `char` 时，放出一个分隔符后停顿的毫秒数
   * @description With `unit: 'char'`, how many milliseconds to pause after revealing a delimiter
   * @default 0
   */
  pauseMs?: number;
  /**
   * @description `unit` 为 `sentence` 时，自上一个分隔符起最多攒多少个字符；超过后退回逐字放出，直到下一个分隔符出现。防止长 URL、单行 JSON 这类没有标点的内容长时间不显示
   * @description With `unit: 'sentence'`, the longest run since the previous delimiter that is held back; beyond it text is revealed character by character until the next delimiter appears. Prevents a long URL or a one-line JSON blob from staying invisible
   * @default 120
   */
  maxSentenceChars?: number;
}

export interface TailConfig {
  /**
   * @description 尾部显示的内容，默认为 `▋`
   * @description The content to display as tail, default is `▋`
   * @default '▋'
   */
  content?: string;
  /**
   * @description 自定义尾部组件，优先级高于 content
   * @description Custom tail component, takes precedence over content
   */
  component?: Component;
}

export interface StreamingOption {
  /**
   * @description 指示是否还有后续内容块，为 false 时刷新所有缓存并完成渲染
   * @description Indicates whether more content chunks are expected. When false, flushes all cached content and completes rendering
   * @default false
   */
  hasNextChunk?: boolean;
  /**
   * @description 流式期间按标题把正文切成若干段，只有正在增长的最后一段随每个 chunk 重新解析、消毒和渲染，前面的段直接复用。只在顶格的 ATX 标题（`# ` ～ `###### `）前切分；围栏代码（含列表项、引用块内部的围栏）、HTML 块（`<div>`、`<pre>`、`<script>`、注释等）、`$$` 公式内的 `#` 行不算标题——切分器复刻 marked 的列表项延续、段落中断与容器规则。出现链接引用定义或脚注定义、或自定义组件标签跨越切点时不切分。`$$` 公式以自带的 Latex 插件规则为准，未注册该插件时用 `$$` 包住代码围栏的内容请关闭本选项。传对象可调整：短于 `minSectionChars` 的段并入下一段；`keepSectionsOnEnd`（默认 true）表示流结束（`hasNextChunk` 变为 false）后各段保持不变、已挂载的自定义组件不重新挂载，设为 false 则流结束时回到整篇一次性渲染，用了带全局状态的 marked 扩展（如标题 id 去重）时应关掉。
   * @description Splits the document into sections at headings while streaming so that only the last, still-growing section is re-parsed, sanitized and rendered per chunk; earlier sections are reused as-is. A boundary is only placed before a column-0 ATX heading (`# ` to `###### `); `#` lines inside fenced code (including fences nested in list items and blockquotes), HTML blocks (`<div>`, `<pre>`, `<script>`, comments, …) and `$$` math are not headings — the splitter mirrors marked's list-item continuation, paragraph-interruption and container rules. Splitting is disabled when a link reference or footnote definition appears, or when a custom component tag spans the boundary. The `$$` math model follows the bundled Latex plugin; without that plugin registered, turn this off for content that wraps code fences in `$$` delimiters. Pass an object to tune it: sections shorter than `minSectionChars` are merged into the next one; `keepSectionsOnEnd` (default true) keeps the sections once the stream ends (`hasNextChunk` becomes false) so mounted custom components are not remounted, while false re-renders the whole document at once when the stream ends — turn it off when using marked extensions with document-wide state (e.g. heading id de-duplication).
   * @default false
   */
  incremental?:
    | boolean
    | { minSectionChars?: number; keepSectionsOnEnd?: boolean };
  /**
   * @description 为块级元素（p、li、h1、h2、h3、h4）启用文字淡入动画
   * @description Enables text fade-in animation for block elements (p, li, h1, h2, h3, h4)
   * @default true
   */
  enableAnimation?: boolean;
  /**
   * @description 文字出现动画效果的配置
   * @description Configuration for text appearance animation effects
   */
  animationConfig?: AnimationConfig;
  /**
   * @description 是否启用尾部动画；传入 `true` 使用默认 `▋`，传入对象可自定义内容
   * @description Whether to enable tail animation; pass `true` for default `▋`, or object to customize content
   * @default false
   */
  tail?: boolean | TailConfig;
  /**
   * @description 未完成的 Markdown 格式转换为自定义加载组件的映射配置，用于在流式渲染过程中为未闭合的链接和图片提供自定义loading组件
   * @description Mapping configuration to convert incomplete Markdown formats to custom loading components, used to provide custom loading components for unclosed links and images during streaming rendering
   * @default { link: 'incomplete-link', image: 'incomplete-image' }
   */
  incompleteMarkdownComponentMap?: Partial<
    Record<StreamCacheTokenType, string>
  >;
  /**
   * @description 尚未写完的 Markdown 语法如何显示。`placeholder`：扣住不显示，或显示 `incompleteMarkdownComponentMap` 指定的占位组件；`complete`：把写到一半的强调、行内代码、链接文字、列表项当作已写完的文本立刻显示（`**加粗中` 显示为加粗，`[链接文字](https://` 先显示文字），图片、HTML、表格仍按 `placeholder` 处理。对某个语法显式配置了 `incompleteMarkdownComponentMap` 时以占位组件为准。
   * @description How markdown syntax that has not finished streaming is shown. `placeholder`: hold it back, or show the placeholder component from `incompleteMarkdownComponentMap`; `complete`: show half-written emphasis, inline code, link text and list items as finished text right away (`**bold so far` renders bold, `[link text](https://` shows its text), while images, HTML and tables still follow `placeholder`. A token with an explicit `incompleteMarkdownComponentMap` entry always uses its placeholder.
   * @default 'placeholder'
   */
  incompleteMarkdown?: "placeholder" | "complete";
  /**
   * @description 打字机效果：新到的内容不是整块出现，而是按 chunk 到达的节奏匀速放出。放出的永远是 `content` 的前缀，`hasNextChunk` 变为 false 时立即放完。传对象可配置单位、速度和分隔符
   * @description Typewriter effect: newly arrived content is revealed at a steady pace that follows the chunk cadence instead of appearing in blocks. What is shown is always a prefix of `content`; everything is revealed at once when `hasNextChunk` becomes false. Pass an object to configure the unit, speed and delimiters
   * @default false
   */
  typewriter?: boolean | TypewriterConfig;
}

export interface XMarkdownProps {
  content?: string;
  components?: Record<string, Component>;
  /**
   * 按标签名向 `components` 中的自定义组件传递额外的 props，使组件引用保持稳定，避免内联函数导致的重复挂载
   * Extra props passed to custom components in `components` by tag name, keeping component references stable and avoiding remounts caused by inline functions
   */
  componentsProps?: Record<string, Record<string, unknown>>;
  /**
   * @description 流式渲染行为的配置。传布尔值即开启预设：`true` 表示还有后续内容（等同 `hasNextChunk: true`）并打开 `incremental`、`incompleteMarkdown: 'complete'`、`typewriter`；`false` 表示流已结束，按最终内容一次性渲染。传对象则逐项配置
   * @description Configuration for streaming rendering behavior. A boolean enables the preset: `true` means more content is coming (same as `hasNextChunk: true`) with `incremental`, `incompleteMarkdown: 'complete'` and `typewriter` switched on; `false` means the stream has ended and the final content is rendered at once. Pass an object to configure each option
   */
  streaming?: boolean | StreamingOption;
  config?: MarkedConfig;
  debug?: boolean;
  protectCustomTagNewlines?: boolean;
  escapeRawHtml?: boolean;
  className?: string;
  style?: Record<string, string>;
  openLinksInNewTab?: boolean;
  paragraphTag?: string;
}

export interface MarkedConfig {
  breaks?: boolean;
  gfm?: boolean;
  extensions?: TokenizerAndRendererExtension[] | null;
}

export interface ComponentProps {
  domNode?: HTMLElement;
  streamStatus?: "loading" | "done";
  lang?: string;
  block?: boolean;
  [key: string]: unknown;
}

export interface AnimationTextProps {
  text: string;
  fadeDuration?: number;
  easing?: string;
  splitBy?: "chunk" | "sentence";
  delimiters?: string[];
  maxSentenceChars?: number;
}

export interface DebugPanelProps {
  className?: string;
}

export interface TailIndicatorProps {
  content?: string;
}

export interface ParserOptions {
  openLinksInNewTab?: boolean;
  paragraphTag?: string;
  injectTail?: boolean;
  protectCustomTags?: boolean;
  escapeRawHtml?: boolean;
  config?: MarkedConfig;
  components?: Record<string, Component>;
  streamStatus?: "loading" | "done";
  codeBlockStatus?: Record<string, "loading" | "done">;
}

export interface RendererOptions {
  components?: Record<string, Component>;
  componentsProps?: Record<string, Record<string, unknown>>;
  enableAnimation?: boolean;
  animationConfig?: AnimationConfig;
}

/** 与上游 `TypewriterOption` 对齐的导出名。 Alias export matching the upstream name. */
export type { TypewriterConfig as TypewriterOption };
