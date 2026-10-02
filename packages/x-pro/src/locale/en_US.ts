import antEnUS from "antdv-next/locale/en_US";

import type { XProLocale } from "./types";

const xProLocale = {
  ...antEnUS,
  MessageScroller: {
    viewportLabel: "Conversation",
    navigationLabel: "Message navigation",
    backToLatest: "Back to latest",
    railItemLabel: "Go to message {index} of {total}",
  },
} satisfies XProLocale;

export default xProLocale;
