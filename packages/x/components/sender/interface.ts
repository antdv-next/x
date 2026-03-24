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

// ===================== SlotConfig =====================

export interface SlotConfigBaseType {
  type: "text" | "input" | "select" | "tag" | "custom" | "content" | "skill";
  formatResult?: (value: any) => string;
}

interface SlotConfigTextType extends SlotConfigBaseType {
  type: "text";
  value?: string;
  editable?: boolean;
  placeholder?: string;
  key?: string;
}

interface SlotConfigContentType extends SlotConfigBaseType {
  type: "content";
  key: string;
  props?: {
    defaultValue?: any;
    placeholder?: string;
  };
}

interface SlotConfigInputType extends SlotConfigBaseType {
  type: "input";
  key: string;
  props?: {
    defaultValue?: string;
    placeholder?: string;
  };
}

interface SlotConfigSelectType extends SlotConfigBaseType {
  type: "select";
  key: string;
  props?: {
    defaultValue?: string;
    options: string[];
    placeholder?: string;
  };
}

interface SlotConfigTagType extends SlotConfigBaseType {
  type: "tag";
  key: string;
  props?: {
    label: VNodeChild;
    value?: string;
  };
}

interface SlotConfigCustomType extends SlotConfigBaseType {
  type: "custom";
  key: string;
  props?: {
    defaultValue?: any;
    [key: string]: any;
  };
  customRender?: (
    value: any,
    onChange: (value: any) => void,
    props: {
      disabled?: boolean;
      readOnly?: boolean;
    },
    item: SlotConfigType,
  ) => VNodeChild;
}

export type SlotConfigType =
  | SlotConfigTextType
  | SlotConfigInputType
  | SlotConfigSelectType
  | SlotConfigTagType
  | SlotConfigCustomType
  | SlotConfigContentType;

// ===================== Skill =====================

export interface SkillType {
  title?: VNodeChild;
  value: string;
  toolTip?: {
    title?: VNodeChild;
  };
  closable?:
    | boolean
    | {
        closeIcon?: VNodeChild;
        onClose?: (event: MouseEvent) => void;
        disabled?: boolean;
      };
}

// ===================== SenderProps =====================

export interface SenderProps {
  prefixCls?: string;
  defaultValue?: string;
  value?: string;
  loading?: boolean;
  readOnly?: boolean;
  submitType?: SubmitType;
  disabled?: boolean;
  slotConfig?: Readonly<SlotConfigType[]>;
  skill?: SkillType;
  onSubmit?: (
    message: string,
    slotConfig?: SlotConfigType[],
    skill?: SkillType,
  ) => void;
  onChange?: (
    value: string,
    event?: Event,
    slotConfig?: SlotConfigType[],
    skill?: SkillType,
  ) => void;
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
  insert: (value: string | SlotConfigType[], position?: InsertPosition) => void;
  getValue: () => {
    value: string;
    slotConfig?: SlotConfigType[];
    skill?: SkillType;
  };
}
