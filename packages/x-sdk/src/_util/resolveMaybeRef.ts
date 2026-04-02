import type { MaybeRef } from "vue";

import { isRef } from "vue";

export default function resolveMaybeRef<T>(
  value: MaybeRef<T> | undefined,
): T | undefined {
  return isRef(value) ? value.value : value;
}
