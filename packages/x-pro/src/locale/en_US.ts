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
  Questionnaire: {
    title: "A few questions",
    progress: "Question {index} of {total}",
    required: "Required",
    optional: "Optional",
    other: "Other",
    customPlaceholder: "Enter your answer",
    previous: "Previous",
    next: "Next",
    submit: "Submit answers",
    skipQuestion: "Skip question",
    skip: "Skip questionnaire",
    dismiss: "Dismiss",
    revise: "Revise answers",
    retry: "Retry submission",
    pending: "Awaiting answers",
    submitting: "Submitting",
    submitted: "Answers submitted",
    expired: "This questionnaire has expired",
    cancelled: "This questionnaire was cancelled",
    error: "Submission failed. Your answers are preserved.",
    invalidConfig: "Invalid questionnaire configuration",
    requiredError: "Answer this required question.",
    minSelections: "Choose at least {min} answers.",
    maxSelections: "Choose up to {max} answers.",
    unanswered: "Unanswered",
    skipped: "Skipped",
    limitReached: "Character limit reached",
    showMore: "Show description",
    showLess: "Hide description",
  },
  TodoList: {
    title: "To-dos",
    counterLabel: "{completed} of {total} completed",
    toggleLabel: "Toggle {title}",
    statusPending: "Pending",
    statusInProgress: "In progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
  },
} satisfies XProLocale;

export default xProLocale;
