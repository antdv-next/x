import type { ComputedRef, InjectionKey } from "vue";

export interface AttachmentContextProps {
  disabled?: ComputedRef<boolean> | boolean;
}

export const AttachmentContextKey: InjectionKey<AttachmentContextProps> =
  Symbol("AttachmentContext");
