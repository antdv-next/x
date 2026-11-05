import type { VueWrapper } from "@vue/test-utils";

import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";
import { h, nextTick } from "vue";

import type {
  QuestionnairePayload,
  QuestionnaireRef,
  QuestionnaireSubmission,
} from "../src";

import { Questionnaire, XProProvider, zhCN } from "../src";

const wrappers: VueWrapper[] = [];
function payload(
  overrides: Partial<QuestionnairePayload> = {},
): QuestionnairePayload {
  return {
    id: "scope",
    revision: 1,
    title: "Plan the work",
    questions: [
      {
        id: "stack",
        title: "Choose a stack",
        type: "single",
        allowCustom: true,
        options: [
          { value: "vue", label: "Vue", description: "Composition API" },
          { value: "react", label: "React" },
        ],
      },
      {
        id: "features",
        title: "Choose features",
        type: "multiple",
        minSelections: 1,
        maxSelections: 2,
        allowCustom: true,
        options: [
          { value: "docs", label: "Documentation" },
          { value: "tests", label: "Tests" },
          { value: "demo", label: "Demo" },
        ],
      },
    ],
    ...overrides,
  };
}
function render(props: Record<string, unknown> = {}) {
  const wrapper = mount(Questionnaire, {
    attachTo: document.body,
    props: { payload: payload(), ...props },
  });
  wrappers.push(wrapper);
  return wrapper;
}
function api(wrapper: VueWrapper) {
  return wrapper.vm as unknown as QuestionnaireRef;
}
function button(wrapper: VueWrapper, text: string) {
  return wrapper.findAll("button").find(b => b.text().includes(text))!;
}
function submissions(wrapper: VueWrapper) {
  return (
    wrapper.emitted("submit")?.map(e => e[0] as QuestionnaireSubmission) ?? []
  );
}

afterEach(() => {
  wrappers.splice(0).forEach(w => w.unmount());
  vi.useRealTimers();
  localStorage.clear();
});

describe("Questionnaire", () => {
  it("renders plain text with separate option names and descriptions", () => {
    const w = render({ payload: payload({ title: "<img src=x>" }) });
    expect(w.find("h2").text()).toBe("<img src=x>");
    expect(w.find("img").exists()).toBe(false);
    expect(w.find('[role="radiogroup"]').attributes("aria-required")).toBe(
      "true",
    );
    const radio = w.find('input[type="radio"]');
    expect(
      document.getElementById(radio.attributes("aria-labelledby")!)
        ?.textContent,
    ).toBe("Vue");
    expect(
      document.getElementById(radio.attributes("aria-describedby")!)
        ?.textContent,
    ).toBe("Composition API");
  });

  it("auto advances after 240ms and focuses the next title; the last answer never submits", async () => {
    vi.useFakeTimers();
    const w = render();
    await w.findAll("input")[0]!.setValue(true);
    await vi.advanceTimersByTimeAsync(239);
    expect(w.find("h3").text()).toBe("Choose a stack");
    await vi.advanceTimersByTimeAsync(1);
    expect(w.find("h3").text()).toBe("Choose features");
    expect(document.activeElement).toBe(w.find("h3").element);
    await w.findAll("input")[0]!.setValue(true);
    await vi.advanceTimersByTimeAsync(1000);
    expect(submissions(w)).toHaveLength(0);
  });

  it("cancels auto advance on manual navigation, custom focus and unmount", async () => {
    vi.useFakeTimers();
    const w = render();
    await w.findAll("input")[0]!.setValue(true);
    api(w).goToStep(0);
    await vi.advanceTimersByTimeAsync(250);
    expect(w.find("h3").text()).toBe("Choose a stack");
    await w.findAll("input")[1]!.setValue(true);
    await w.find("textarea").trigger("focus");
    await vi.advanceTimersByTimeAsync(250);
    expect(w.find("h3").text()).toBe("Choose a stack");
    await w.find("textarea").trigger("blur");
    await w.findAll("input")[0]!.setValue(true);
    const events = w.emitted("update:step");
    const previous = events?.length;
    w.unmount();
    wrappers.splice(wrappers.indexOf(w), 1);
    await vi.advanceTimersByTimeAsync(250);
    expect(events?.length).toBe(previous);
  });

  it("enforces required gates and focuses a visible, associated error", async () => {
    const w = render();
    api(w).goToStep(1);
    await nextTick();
    await button(w, "Submit answers").trigger("click");
    expect(submissions(w)).toHaveLength(0);
    expect(w.find("h3").text()).toBe("Choose a stack");
    expect(w.find('[role="alert"]').text()).toBe(
      "Answer this required question.",
    );
    expect(document.activeElement).toBe(w.find('[role="alert"]').element);
    expect(
      w.find('[role="radiogroup"]').attributes("aria-describedby"),
    ).toContain(w.find('[role="alert"]').attributes("id"));
  });

  it("makes custom single answers exclusive, but preserves multiple selections", async () => {
    const w = render();
    await w.findAll("input")[0]!.setValue(true);
    await w.find("textarea").setValue("Svelte");
    expect(
      w.findAll("input").every(i => !(i.element as HTMLInputElement).checked),
    ).toBe(true);
    api(w).goToStep(1);
    await nextTick();
    await w.findAll("input")[0]!.setValue(true);
    await w.find("textarea").setValue("Accessibility");
    expect((w.findAll("input")[0]!.element as HTMLInputElement).checked).toBe(
      true,
    );
    expect(w.findAll("input")[1]!.attributes("disabled")).toBeDefined();
    await button(w, "Submit answers").trigger("click");
    const submission = submissions(w)[0]!;
    expect(submission.answers.stack).toEqual({
      selected: [],
      custom: "Svelte",
    });
    expect(submission.answers.features).toEqual({
      selected: ["docs"],
      custom: "Accessibility",
    });
  });

  it("does not submit or trim during IME composition", async () => {
    const w = render({
      payload: payload({
        questions: [
          { id: "text", title: "Notes", type: "single", allowCustom: true },
        ],
      }),
    });
    await w.find("textarea").trigger("compositionstart");
    await w.find("textarea").setValue("  中文  ");
    api(w).submit();
    expect(submissions(w)).toHaveLength(0);
    await w.find("textarea").trigger("compositionend");
    api(w).submit();
    expect(submissions(w)[0]?.answers.text?.custom).toBe("  中文  ");
  });

  it("locks immediately, ignores controlled changes while submitting and reuses the submission on retry", async () => {
    const initial = {
      stack: { selected: ["vue"] },
      features: { selected: ["docs"] },
    };
    const w = render({ answers: initial, step: 1 });
    api(w).submit();
    api(w).submit();
    api(w).goToStep(0);
    api(w).reset();
    await w.setProps({ answers: {}, step: 0 });
    expect(w.attributes("data-status")).toBe("submitting");
    expect(w.find("h3").text()).toBe("Choose features");
    expect(submissions(w)).toHaveLength(1);
    expect(w.emitted("update:step")).toBeUndefined();
    await w.setProps({ status: "error", error: "Offline" });
    expect(document.activeElement).toBe(w.find('[role="alert"]').element);
    await button(w, "Retry submission").trigger("click");
    expect(submissions(w)).toHaveLength(2);
    expect(submissions(w)[1]).toEqual(submissions(w)[0]);
    expect(w.emitted("retry")).toHaveLength(1);
    await w.setProps({
      status: "submitted",
      result: "Already submitted on another device",
    });
    expect(w.find('[role="status"]').text()).toContain("Vue");
    expect(w.text()).toContain("Already submitted on another device");
    expect(w.find("input").exists()).toBe(false);
    expect(document.activeElement).toBe(w.find('[role="status"] h3').element);
    await w.setProps({ status: "pending" });
    expect(w.attributes("data-status")).toBe("submitted");
  });

  it("replays an initially submitting questionnaire at its supplied step", () => {
    const w = render({ status: "submitting", defaultStep: 1 });
    expect(w.find("h3").text()).toBe("Choose features");
    expect(
      w
        .findAll("input")
        .every(input => input.attributes("disabled") !== undefined),
    ).toBe(true);
  });

  it("retains uncontrolled answers after failure and only creates a new intent after edits", async () => {
    const w = render({
      defaultAnswers: {
        stack: { selected: ["vue"] },
        features: { selected: ["docs"] },
      },
      defaultStep: 1,
    });
    api(w).submit();
    await w.setProps({ status: "error" });
    expect((w.findAll("input")[0]!.element as HTMLInputElement).checked).toBe(
      true,
    );
    await w.findAll("input")[1]!.setValue(true);
    api(w).submit();
    expect(submissions(w)[1]?.submissionId).not.toBe(
      submissions(w)[0]?.submissionId,
    );
  });

  it("supports explicit optional skips and min/max visible reasons", async () => {
    const w = render({
      payload: payload({
        questions: [
          {
            id: "optional",
            title: "Optional",
            type: "single",
            required: false,
            allowCustom: true,
          },
          {
            id: "multi",
            title: "Minimum",
            type: "multiple",
            minSelections: 2,
            options: [
              { value: "a", label: "A" },
              { value: "b", label: "B" },
            ],
          },
        ],
      }),
    });
    await button(w, "Skip question").trigger("click");
    await w.findAll("input")[0]!.setValue(true);
    api(w).submit();
    await nextTick();
    expect(w.find('[role="alert"]').text()).toBe("Choose at least 2 answers.");
    await w.findAll("input")[1]!.setValue(true);
    api(w).submit();
    expect(submissions(w)[0]?.skipped).toEqual(["optional"]);
  });

  it("expires at the deadline, preserves answers and refuses reset", async () => {
    vi.useFakeTimers();
    const w = render({
      payload: payload({ expiresAt: new Date(Date.now() + 500).toISOString() }),
      defaultAnswers: { stack: { selected: ["vue"] } },
    });
    await vi.advanceTimersByTimeAsync(500);
    expect(w.attributes("data-status")).toBe("expired");
    expect(w.find('[role="status"]').text()).toContain("Vue");
    api(w).reset();
    api(w).submit();
    expect(w.emitted("submit")).toBeUndefined();
    await w.setProps({ status: "pending" });
    expect(w.attributes("data-status")).toBe("expired");
  });

  it("allows explicit revision, while a new payload revision resets terminal state", async () => {
    const w = render({
      status: "submitted",
      allowRevision: true,
      defaultAnswers: { stack: { selected: ["vue"] } },
    });
    await button(w, "Revise answers").trigger("click");
    expect(w.attributes("data-status")).toBe("pending");
    expect((w.findAll("input")[0]!.element as HTMLInputElement).checked).toBe(
      true,
    );
    await w.setProps({ status: "cancelled" });
    await w.setProps({
      payload: payload({ revision: 2, questions: [payload().questions[0]!] }),
      status: "pending",
      defaultStep: 99,
      defaultAnswers: {},
    });
    expect(w.attributes("data-status")).toBe("pending");
    expect(w.text()).toContain("1/1");
    expect((w.findAll("input")[0]!.element as HTMLInputElement).checked).toBe(
      false,
    );
  });

  it("restores drafts for the matching identity, with controlled state taking precedence", async () => {
    const w = render({ draftKey: "draft" });
    await w.find("textarea").setValue("Saved answer");
    api(w).goToStep(1);
    await nextTick();
    const restored = render({ draftKey: "draft" });
    expect(restored.find("h3").text()).toBe("Choose features");
    api(restored).goToStep(0);
    await nextTick();
    expect(
      (restored.find("textarea").element as HTMLTextAreaElement).value,
    ).toBe("Saved answer");
    const controlled = render({ draftKey: "draft", answers: {}, step: 0 });
    expect(
      (controlled.find("textarea").element as HTMLTextAreaElement).value,
    ).toBe("");
    const revised = render({
      draftKey: "draft",
      payload: payload({ revision: 3 }),
    });
    expect(
      (revised.find("textarea").element as HTMLTextAreaElement).value,
    ).toBe("");
  });

  it("disables all mutations, clamps invalid steps and renders malformed data safely", async () => {
    const w = render({ disabled: true, step: -10 });
    api(w).goToStep(1);
    api(w).submit();
    api(w).reset();
    expect(w.emitted()).toEqual({});
    expect(
      w
        .findAll("input")
        .every(input => input.attributes("disabled") !== undefined),
    ).toBe(true);
    await w.setProps({
      payload: {
        id: "bad",
        revision: 1,
        questions: [null],
      } as unknown as QuestionnairePayload,
    });
    expect(w.find('[role="alert"]').text()).toContain("Invalid questionnaire");
    await w.setProps({ payload: null as unknown as QuestionnairePayload });
    expect(w.find('[role="alert"]').text()).toContain("Invalid questionnaire");
  });

  it("integrates provider locale, RTL, semantic classes and token styles", () => {
    const w = mount(XProProvider, {
      props: {
        locale: zhCN,
        direction: "rtl",
        questionnaire: {
          classes: { option: "global-option" },
          dismissible: true,
        },
      },
      slots: {
        default: () =>
          h(Questionnaire, {
            payload: payload(),
            classes: { option: "local-option" },
          }),
      },
    });
    wrappers.push(w);
    expect(w.text()).toContain("下一题");
    expect(w.find('button[aria-label="关闭"]').exists()).toBe(true);
    expect(w.find(".ant-questionnaire-rtl").exists()).toBe(true);
    expect(w.find(".global-option.local-option").exists()).toBe(true);
    const css = [...document.querySelectorAll("style")]
      .map(s => s.textContent)
      .join("");
    expect(css).toContain(".ant-questionnaire-disclosure-leave-active");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("makes leaving controls inert and hidden during the real collapse transition", async () => {
    const w = mount(Questionnaire, {
      attachTo: document.body,
      global: { stubs: { transition: false } },
      props: {
        payload: payload(),
        defaultAnswers: {
          stack: { selected: ["vue"] },
          features: { selected: ["docs"] },
        },
      },
    });
    wrappers.push(w);
    expect(w.find("[inert]").exists()).toBe(false);
    api(w).submit();
    await w.setProps({ status: "submitted" });
    const leaving = w.find(".ant-questionnaire-disclosure-leave-active");
    expect(leaving.attributes("inert")).toBeDefined();
    expect(leaving.attributes("aria-hidden")).toBe("true");
    expect(document.activeElement).toBe(w.find('[role="status"] h3').element);
  });

  it("supports scoped extension slots and host-owned dismissal", async () => {
    const w = mount(Questionnaire, {
      props: { payload: payload(), dismissible: true },
      slots: {
        questionExtra: ({ question }) =>
          h("p", { class: "extra" }, question.title),
        footer: ({ goToStep }) =>
          h("button", { onClick: () => goToStep(1) }, "Custom next"),
        receipt: ({ status }) => h("p", { class: "custom-receipt" }, status),
      },
    });
    wrappers.push(w);
    expect(w.find(".extra").text()).toBe("Choose a stack");
    await button(w, "Custom next").trigger("click");
    expect(w.find(".extra").text()).toBe("Choose features");
    await w.find('button[aria-label="Dismiss"]').trigger("click");
    expect(w.emitted("dismiss")).toHaveLength(1);
    await w.setProps({ status: "cancelled" });
    expect(w.find(".custom-receipt").text()).toBe("cancelled");
  });
});
