import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";
import { h, nextTick } from "vue";

import FileCard from "../index";

describe("FileCard", () => {
  it("handles hidden file names", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: ".hiddenfile",
      },
    });

    expect(wrapper.find(".antdx-file-card-file-name-prefix").text()).toBe("");
    expect(wrapper.find(".antdx-file-card-file-name-suffix").text()).toBe(
      ".hiddenfile",
    );
  });

  it("renders file size description", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        byte: 1024,
      },
    });

    expect(wrapper.find(".antdx-file-card-file-description").text()).toBe(
      "1 KB",
    );
  });

  it("triggers onClick", async () => {
    const onClick = vi.fn();
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        byte: 1024,
        onClick,
      },
    });

    await wrapper.find(".antdx-file-card-file").trigger("click");
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "test.txt",
        namePrefix: "test",
        nameSuffix: ".txt",
        size: "1 KB",
      }),
      expect.any(MouseEvent),
    );
  });

  it("supports custom description", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        description: "Custom desc",
      },
    });

    expect(wrapper.find(".antdx-file-card-file-description").text()).toBe(
      "Custom desc",
    );
  });

  it("supports disabling description", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        byte: 1024,
        description: false,
      },
    });

    expect(wrapper.find(".antdx-file-card-file-description").exists()).toBe(
      false,
    );
  });

  it("renders image type", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.png",
        type: "image",
        src: "https://example.com/test.png",
      },
    });

    expect(wrapper.find(".antdx-file-card-image").exists()).toBe(true);
  });

  it("renders audio type", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.mp3",
        type: "audio",
        src: "https://example.com/test.mp3",
      },
    });

    expect(wrapper.find(".antdx-file-card-audio").exists()).toBe(true);
  });

  it("renders video type", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.mp4",
        type: "video",
        src: "https://example.com/test.mp4",
      },
    });

    expect(wrapper.find(".antdx-file-card-video").exists()).toBe(true);
  });

  it("renders default file type", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.pdf",
        type: "file",
      },
    });

    expect(wrapper.find(".antdx-file-card-file").exists()).toBe(true);
  });

  it("supports loading state", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.png",
        type: "image",
        loading: true,
      },
    });

    expect(wrapper.find(".antdx-file-card-loading").exists()).toBe(true);
  });

  it("supports custom semantic class", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        classes: {
          name: "custom-name",
        },
      },
    });

    expect(wrapper.find(".antdx-file-card-file-name").classes()).toContain(
      "custom-name",
    );
  });

  it("supports custom mask", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        mask: h("div", { class: "custom-mask" }, "Mask"),
      },
    });

    expect(wrapper.find(".custom-mask").exists()).toBe(true);
  });

  it("supports custom icon", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        icon: h("span", { class: "custom-icon" }, "ICON"),
      },
    });

    expect(wrapper.find(".custom-icon").exists()).toBe(true);
  });

  it("supports custom prefixCls", () => {
    const wrapper = mount(FileCard, {
      props: {
        name: "test.txt",
        prefixCls: "custom-prefix",
      },
    });

    expect(wrapper.find(".custom-prefix").exists()).toBe(true);
  });
});

describe("FileCard.List", () => {
  it("renders file list", () => {
    const wrapper = mount(FileCard.List, {
      props: {
        items: [
          { name: "file1.txt", byte: 1024 },
          { name: "file2.jpg", byte: 2048 },
        ],
      },
    });

    expect(wrapper.find(".antdx-file-card-list").exists()).toBe(true);
    expect(wrapper.findAll(".antdx-file-card")).toHaveLength(2);
  });

  it("supports removable", async () => {
    const onRemove = vi.fn();
    const wrapper = mount(FileCard.List, {
      props: {
        items: [{ name: "test.txt" }],
        removable: true,
        onRemove,
      },
    });

    await wrapper.find(".antdx-file-card-list-remove").trigger("click");
    await nextTick();

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll(".antdx-file-card")).toHaveLength(0);
  });

  it("supports overflow styles", () => {
    (["scrollX", "scrollY", "wrap"] as const).forEach(overflow => {
      const wrapper = mount(FileCard.List, {
        props: {
          items: [
            { name: "very-long-file-name-1.txt" },
            { name: "very-long-file-name-2.txt" },
            { name: "very-long-file-name-3.txt" },
          ],
          overflow,
        },
      });

      expect(
        wrapper.find(`.antdx-file-card-list-overflow-${overflow}`).exists(),
      ).toBe(true);
    });
  });

  it("supports custom image size styles", () => {
    const wrapper = mount(FileCard.List, {
      props: {
        items: [
          {
            name: "image-file.png",
            src: "https://example.com/test.png",
          },
        ],
        styles: {
          file: {
            width: "230px",
            height: "230px",
          },
        },
      },
    });

    const imageCard = wrapper.find(".antdx-file-card-image");
    expect(imageCard.attributes("style")).toContain("width: 230px;");
    expect(imageCard.attributes("style")).toContain("height: 230px;");
  });
});
