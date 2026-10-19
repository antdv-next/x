import { mount } from "@vue/test-utils";
import { ConfigProvider, StyleProvider } from "antdv-next";
import { describe, expect, it } from "vitest";
import { h, nextTick } from "vue";

import { MessageScroller, TodoList } from "../src";

const VIEWPORT_SELECTOR = ".ant-message-scroller-viewport";
const TODO_CONTENT_SELECTOR = ".ant-todo-list-content";
const TODO_HEADER_SELECTOR = ".ant-todo-list-header";
const TODO_COUNTER_SELECTOR = ".ant-todo-list-header-counter";

function collectStyleText() {
  return [...document.querySelectorAll("style")]
    .map(style => style.textContent ?? "")
    .join("\n");
}

/**
 * 过渡选择器必须与元素上实际挂的类名逐字对应。Vue 把 `<Transition name="X">` 拼成
 * `X-enter-active` 这类类名加到元素上，而样式表是按前缀拼出选择器的；两边各写一遍，
 * 少一段就静默失效——元素照常挂载卸载，`transition-duration` 却恒为 0。
 */
function expectTransitionRuleFor(
  css: string,
  motionClass: string,
  property = "height",
) {
  expect(css).toMatch(
    new RegExp(`\\.${motionClass}\\s*\\{[^}]*transition:[^}]*${property}`),
  );
}

function mountScrollerIn(container: (children: unknown) => unknown) {
  return mount({
    render: () =>
      container(
        h(
          MessageScroller,
          { style: { height: "200px" } },
          { default: () => h("div", "message") },
        ),
      ),
  });
}

function mountTodoIn(container: (children: unknown) => unknown) {
  return mount({
    render: () =>
      container(
        h(TodoList, {
          items: [
            { id: "1", title: "First", status: "completed" },
            { id: "2", title: "Second", status: "in-progress" },
          ],
        }),
      ),
  });
}

/**
 * `@vue/test-utils` 默认把 `Transition` 换成直通 stub，过渡类名不会挂到元素上；
 * 而「类名与样式表是否对得上」正是要测的东西，所以这里关掉 stub。
 * jsdom 不做真实动画，但类名是在进入/离开一开始就同步挂上的，足够断言。
 */
function mountBareTodo() {
  return mount(TodoList, {
    attachTo: document.body,
    global: { stubs: { transition: false } },
    props: {
      items: [
        { id: "1", title: "First", status: "completed" },
        { id: "2", title: "Second", status: "pending" },
      ],
    },
  });
}

describe("x-pro theme registration", () => {
  /**
   * `zeroRuntime` 只覆盖 antdv-next 预构建的 `antd.css`，其中没有 x-pro 的组件样式；
   * 跟随它会让组件在文档站这类宿主里完全失去样式（滚动、导轨全部失效）。
   */
  it("keeps registering runtime styles when the host enables zeroRuntime", () => {
    mountScrollerIn(children =>
      h(
        ConfigProvider,
        { theme: { zeroRuntime: true } },
        { default: () => children },
      ),
    );

    const css = collectStyleText();
    expect(css).toContain(VIEWPORT_SELECTOR);
    expect(css).toMatch(
      new RegExp(`${VIEWPORT_SELECTOR}\\s*\\{[^}]*overflow-y:\\s*auto`),
    );
  });

  /**
   * 层名与 x 组件一致：宿主声明 `@layer ... antd, antdx ...` 时，x-pro 样式跟在 x 之后。
   */
  it("registers its styles in the antdx layer", () => {
    mountScrollerIn(children =>
      h(StyleProvider, { layer: true }, { default: () => children }),
    );

    expect(collectStyleText()).toContain("@layer antdx");
  });

  it("registers TodoList styles under zeroRuntime as well", () => {
    mountTodoIn(children =>
      h(
        ConfigProvider,
        { theme: { zeroRuntime: true } },
        { default: () => children },
      ),
    );

    const css = collectStyleText();
    expect(css).toContain(TODO_CONTENT_SELECTOR);
    expect(css).toMatch(
      new RegExp(`${TODO_CONTENT_SELECTOR}\\s*\\{[^}]*overflow-y:\\s*auto`),
    );
  });

  it("disables the status spin under reduced motion", () => {
    mountTodoIn(children => children);

    expect(collectStyleText()).toContain(
      "@media (prefers-reduced-motion: reduce)",
    );
  });

  it("writes the disclosure transition under the class name Vue actually applies", async () => {
    const wrapper = mountBareTodo();

    await wrapper.find(TODO_HEADER_SELECTOR).trigger("click");

    // 收起途中，内容层上挂的是 `<Transition name="ant-todo-list-content-motion">`
    // 拼出的类；样式表必须按同一个名字生成规则，否则过渡静默失效。
    expect(wrapper.find(TODO_CONTENT_SELECTOR).classes()).toContain(
      "ant-todo-list-content-motion-leave-active",
    );
    expectTransitionRuleFor(
      collectStyleText(),
      "ant-todo-list-content-motion-leave-active",
    );
  });

  it("writes the counter transition under the class name Vue actually applies", async () => {
    const wrapper = mountBareTodo();

    await wrapper.setProps({
      items: [{ id: "1", title: "First", status: "completed" }],
    });
    await nextTick();

    // 计数变化时，Vue 给新旧数字挂上 `-header-counter-motion-*`，同样要求样式表对齐。
    expect(wrapper.find(`${TODO_COUNTER_SELECTOR} span`).classes()).toContain(
      "ant-todo-list-header-counter-motion-leave-active",
    );
    expectTransitionRuleFor(
      collectStyleText(),
      "ant-todo-list-header-counter-motion-leave-active",
      "opacity",
    );
  });
});
