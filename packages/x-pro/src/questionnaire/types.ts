import type { CSSProperties } from "vue";

import type {
  SemanticClassNamesType,
  SemanticStylesType,
} from "../_util/semantic";

export type QuestionnaireStatus =
  | "pending"
  | "submitting"
  | "submitted"
  | "expired"
  | "error"
  | "cancelled";

export interface QuestionnaireOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface QuestionnaireQuestion {
  id: string;
  title: string;
  description?: string;
  /** @default true */
  required?: boolean;
  type: "single" | "multiple";
  options?: QuestionnaireOption[];
  minSelections?: number;
  maxSelections?: number;
  allowCustom?: boolean;
  customLabel?: string;
  customPlaceholder?: string;
  /** @default 500 */
  customMaxLength?: number;
  /** Single-choice questions only. @default true */
  autoAdvance?: boolean;
}

export interface QuestionnairePayload {
  id: string;
  revision: number;
  title?: string;
  description?: string;
  questions: QuestionnaireQuestion[];
  submitLabel?: string;
  allowSkip?: boolean;
  expiresAt?: string;
}

export interface QuestionnaireAnswer {
  selected: string[];
  custom?: string;
}
export type QuestionnaireAnswers = Record<string, QuestionnaireAnswer>;

export interface QuestionnaireSubmission {
  questionSetId: string;
  revision: number;
  answers: QuestionnaireAnswers;
  /** Questions explicitly skipped by the user. */
  skipped: string[];
  submissionId: string;
  submittedAt: string;
}

export type QuestionnaireSemanticName =
  | "root"
  | "header"
  | "title"
  | "progress"
  | "content"
  | "question"
  | "description"
  | "options"
  | "option"
  | "custom"
  | "error"
  | "footer"
  | "receipt"
  | "chip";
export type QuestionnaireSemanticClassNames = Partial<
  Record<QuestionnaireSemanticName, string>
>;
export type QuestionnaireSemanticStyles = Partial<
  Record<QuestionnaireSemanticName, CSSProperties>
>;
export type QuestionnaireClassNamesType = SemanticClassNamesType<
  QuestionnaireProps,
  QuestionnaireSemanticClassNames
>;
export type QuestionnaireStylesType = SemanticStylesType<
  QuestionnaireProps,
  QuestionnaireSemanticStyles
>;

export interface QuestionnaireProps {
  payload: QuestionnairePayload;
  status?: QuestionnaireStatus;
  answers?: QuestionnaireAnswers;
  defaultAnswers?: QuestionnaireAnswers;
  step?: number;
  defaultStep?: number;
  result?: string;
  error?: string;
  allowRevision?: boolean;
  draftKey?: string;
  disabled?: boolean;
  /** Show the dismiss action. @default false */
  dismissible?: boolean;
  prefixCls?: string;
  rootClass?: string;
  classes?: QuestionnaireClassNamesType;
  styles?: QuestionnaireStylesType;
}

export interface QuestionnaireEmits {
  "update:answers": (answers: QuestionnaireAnswers) => void;
  "update:step": (step: number) => void;
  submit: (submission: QuestionnaireSubmission) => void;
  skip: (identity: { questionSetId: string; revision: number }) => void;
  retry: () => void;
  dismiss: () => void;
}
export interface QuestionnaireSlotProps {
  answers: QuestionnaireAnswers;
  step: number;
  status: QuestionnaireStatus;
}
export interface QuestionnaireSlots {
  questionExtra?: (
    info: QuestionnaireSlotProps & { question: QuestionnaireQuestion },
  ) => any;
  receipt?: (info: QuestionnaireSlotProps) => any;
  footer?: (
    info: QuestionnaireSlotProps & {
      submit: () => void;
      goToStep: (step: number) => void;
    },
  ) => any;
}
export interface QuestionnaireRef {
  nativeElement: HTMLElement | null;
  submit: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}
