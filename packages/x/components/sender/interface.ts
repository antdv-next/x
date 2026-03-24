import type { ButtonProps } from "antdv-next";
import type {
  CSSProperties,
  DefineComponent,
  StyleValue,
  VNodeChild,
} from "vue";

import type { AllowSpeech } from "./hooks/use-speech";

export type { AllowSpeech };

export type SubmitType = "enter" | "shiftEnter";

export type SemanticType =
  | "root"
  | "prefix"
  | "input"
  | "suffix"
  | "footer"
  | "switch"
  | "content";

export type InsertPosition = "start" | "end" | "cursor";

export type ActionsComponents = {
  SendButton: DefineComponent<ButtonProps>;
  ClearButton: DefineComponent<ButtonProps>;
  LoadingButton: DefineComponent<ButtonProps>;
  SpeechButton: DefineComponent<ButtonProps>;
};

export type BaseNode = VNodeChild | false;

export type NodeRender = (
  oriNode: VNodeChild,
  info: {
    components: ActionsComponents;
  },
) => BaseNode;

export interface SenderProps {
  prefixCls?: string;
  defaultValue?: string;
  value?: string;
  loading?: boolean;
  readOnly?: boolean;
  submitType?: SubmitType;
  disabled?: boolean;
  onSubmit?: (message: string) => void;
  onChange?: (value: string, event?: Event) => void;
  onCancel?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void | false;
  onKeyUp?: (event: KeyboardEvent) => void;
  onPaste?: (event: ClipboardEvent) => void;
  onPasteFile?: (files: FileList) => void;
  onFocus?: (event: FocusEvent) => void;
  onBlur?: (event: FocusEvent) => void;
  classNames?: Partial<Record<SemanticType, string>>;
  styles?: Partial<Record<SemanticType, CSSProperties>>;
  rootClass?: string;
  style?: StyleValue;
  class?: string;
  allowSpeech?: AllowSpeech;
  prefix?: BaseNode | NodeRender;
  footer?: BaseNode | NodeRender;
  suffix?: BaseNode | NodeRender;
  header?: BaseNode | NodeRender;
  autoSize?: boolean | { minRows?: number; maxRows?: number };
  placeholder?: string;
}

export interface SenderFocusOptions extends FocusOptions {
  cursor?: "start" | "end" | "all";
}

export interface SenderRef {
  nativeElement: HTMLDivElement;
  focus: (options?: SenderFocusOptions) => void;
  blur: () => void;
  clear: () => void;
  insert: (text: string, position?: InsertPosition) => void;
  getValue: () => { value: string };
}
