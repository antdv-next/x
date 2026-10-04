import type { CSSProperties, Ref } from "vue";

import { clsx } from "@v-c/util";
import { computed } from "vue";

type AnyObject = Record<string, any>;

export type SemanticClassNamesType<
  Props extends AnyObject,
  SemanticClassNames extends { [K in keyof SemanticClassNames]?: string },
> =
  | Readonly<SemanticClassNames>
  | ((info: { props: Props }) => Readonly<SemanticClassNames>);

export type SemanticStylesType<
  Props extends AnyObject,
  SemanticStyles extends { [K in keyof SemanticStyles]?: CSSProperties },
> =
  | Readonly<SemanticStyles>
  | ((info: { props: Props }) => Readonly<SemanticStyles>);

type MaybeFn<T, P> = T | ((info: { props: P }) => T) | undefined;

function resolveMaybeFn<T, P>(value: MaybeFn<T, P>, info: { props: P }) {
  return typeof value === "function"
    ? (value as (config: { props: P }) => T)(info)
    : value;
}

function mergeClassNames<T extends AnyObject>(
  ...values: (Partial<T> | undefined)[]
) {
  return values.filter(Boolean).reduce<T>((acc, current = {}) => {
    Object.keys(current).forEach(key => {
      acc[key as keyof T] = clsx(
        acc[key as keyof T],
        current[key],
      ) as T[keyof T];
    });
    return acc;
  }, {} as T);
}

function mergeStyles<T extends AnyObject>(
  ...values: (Partial<T> | undefined)[]
) {
  return values.filter(Boolean).reduce<T>((acc, current = {}) => {
    Object.keys(current).forEach(key => {
      acc[key as keyof T] = {
        ...(acc[key as keyof T] as CSSProperties | undefined),
        ...(current[key] as CSSProperties | undefined),
      } as T[keyof T];
    });
    return acc;
  }, {} as T);
}

export function useMergeSemantic<
  ClassNamesType extends AnyObject,
  StylesType extends AnyObject,
  Props extends AnyObject,
>(
  classNamesList: Ref<MaybeFn<ClassNamesType, Props>[]>,
  stylesList: Ref<MaybeFn<StylesType, Props>[]>,
  info: Ref<{ props: Props }>,
) {
  const resolvedClassNames = computed(() =>
    classNamesList.value.map(classNames =>
      resolveMaybeFn(classNames, info.value),
    ),
  );
  const resolvedStyles = computed(() =>
    stylesList.value.map(styles => resolveMaybeFn(styles, info.value)),
  );

  return [
    computed(() =>
      mergeClassNames<ClassNamesType>(...resolvedClassNames.value),
    ),
    computed(() => mergeStyles<StylesType>(...resolvedStyles.value)),
  ] as const;
}
