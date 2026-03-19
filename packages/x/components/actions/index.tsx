import type { ActionsAudioProps } from "./ActionsAudio";
import type { ActionsCopyProps } from "./ActionsCopy";
import type { ActionsFeedbackProps } from "./ActionsFeedback";
import type { ActionsItemProps } from "./ActionsItem";

import Actions, { XActions } from "./Actions";
import ActionsAudio, { XActionsAudio } from "./ActionsAudio";
import ActionsCopy, { XActionsCopy } from "./ActionsCopy";
import ActionsFeedback, { XActionsFeedback } from "./ActionsFeedback";
import ActionsItem, { ACTIONS_ITEM_STATUS, XActionsItem } from "./ActionsItem";

export type {
  ActionsClickInfo,
  ActionsProps,
  ActionsRef,
  ItemType,
} from "./interface";

type ActionsType = typeof Actions & {
  Feedback: typeof ActionsFeedback;
  Copy: typeof ActionsCopy;
  Item: typeof ActionsItem;
  Audio: typeof ActionsAudio;
};

const ActionsWithSub = Actions as ActionsType;
ActionsWithSub.Feedback = ActionsFeedback;
ActionsWithSub.Copy = ActionsCopy;
ActionsWithSub.Item = ActionsItem;
ActionsWithSub.Audio = ActionsAudio;

export {
  ACTIONS_ITEM_STATUS,
  ActionsAudio,
  ActionsCopy,
  ActionsFeedback,
  ActionsItem,
  XActions,
  XActionsAudio,
  XActionsCopy,
  XActionsFeedback,
  XActionsItem,
};

export type {
  ActionsAudioProps,
  ActionsCopyProps,
  ActionsFeedbackProps,
  ActionsItemProps,
};

export default ActionsWithSub;
