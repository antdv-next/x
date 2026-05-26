import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vite-plus/test";

import Attachments from "../index";

describe("Attachments", () => {
  it("emits update:items when file list changes", async () => {
    const wrapper = mount(Attachments);
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    Object.defineProperty(file, "uid", {
      value: "file-1",
      configurable: true,
    });

    await wrapper
      .findComponent({ name: "AUpload" })
      .vm.$emit("change", { file, fileList: [file] });

    expect(wrapper.emitted("update:items")).toEqual([[[file]]]);
    expect(wrapper.emitted("change")?.[0]?.[0]).toMatchObject({
      file,
      fileList: [file],
    });
  });
});
