import { shallowRef, type ShallowRef } from "vue";

import type { ParserOptions } from "../interface";

import { Parser } from "../core/Parser";

export function useParser(initialOptions?: ParserOptions) {
  const parser: ShallowRef<Parser | null> = shallowRef(null);

  function createParser(options?: ParserOptions): Parser {
    return new Parser(options);
  }

  function parse(markdown: string, options?: ParserOptions): string {
    if (!parser.value) {
      parser.value = createParser(options || initialOptions);
    }

    if (options) {
      parser.value.setOptions(options);
    }

    return parser.value.parse(markdown);
  }

  function resetParser(options?: ParserOptions): void {
    parser.value = createParser(options);
  }

  return {
    parser,
    parse,
    resetParser,
  };
}
