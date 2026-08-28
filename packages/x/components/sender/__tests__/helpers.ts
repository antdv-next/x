import { mount, type VueWrapper } from "@vue/test-utils";

import Sender from "..";

export function createHost(): HTMLDivElement {
  const host = document.createElement("div");
  document.body.appendChild(host);
  return host;
}

export async function mountSenderWithHost(
  props: Record<string, unknown> = {},
): Promise<{ host: HTMLDivElement; wrapper: VueWrapper<any>; editable: any }> {
  const host = createHost();
  const wrapper = mount(Sender as any, { attachTo: host, props } as any);
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  const editable = wrapper.find(".antd-sender-input-slot");
  return { host, wrapper, editable };
}

export function selectAllEditable(editable: any): void {
  const range = document.createRange();
  range.selectNodeContents(editable.element);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);
}

export async function triggerUndo(editable: any): Promise<void> {
  await editable.trigger("keydown", { ctrlKey: true, key: "z" });
}

export async function triggerRedo(editable: any): Promise<void> {
  await editable.trigger("keydown", {
    ctrlKey: true,
    key: "z",
    shiftKey: true,
  });
}

export function cleanup(host: HTMLDivElement, wrapper: VueWrapper<any>): void {
  wrapper.unmount();
  host.remove();
}
