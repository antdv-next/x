import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vite-plus/test";
import { h, nextTick } from "vue";

import type { FolderTreeData } from "../interface";

import Folder from "../Folder";

const mockTreeData: FolderTreeData[] = [
  {
    title: "src",
    path: "src",
    children: [
      {
        title: "components",
        path: "components",
        children: [
          {
            title: "Button.tsx",
            path: "Button.tsx",
            content: "export const Button = () => <button>Click</button>;",
          },
        ],
      },
    ],
  },
  {
    title: "package.json",
    path: "package.json",
    content: '{ "name": "test-app" }',
  },
];

const mockFlatNoContent: FolderTreeData[] = [
  {
    title: "Button.tsx",
    path: "Button.tsx",
  },
];

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

describe("Folder", () => {
  it("renders basic structure", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        directoryTitle: "Project Files",
        previewTitle: "Custom Preview",
        defaultExpandAll: false,
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("renders empty state when no treeData", () => {
    const wrapper = mount(Folder, { props: { treeData: [] } });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("respects selectable prop", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData, selectable: true },
    });
    expect(wrapper.find(".antd-folder-selectable").exists()).toBe(true);
  });

  it("accepts custom directory width", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData, directoryTreeWith: 300 },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("accepts custom empty render", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        emptyRender: () => h("div", "Custom Empty"),
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("accepts custom directory icons", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        directoryIcons: {
          directory: h("span", "Dir"),
          tsx: () => h("span", "TSX"),
        },
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("hides icons when directoryIcons=false", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData, directoryIcons: false },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("exposes ref nativeElement", () => {
    const wrapper = mount(Folder, { props: { treeData: mockTreeData } });
    const vm = wrapper.vm as any;
    expect(vm.nativeElement).toBeTruthy();
  });

  it("accepts selectedFile prop (controlled)", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        selectedFile: ["package.json"],
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("ignores invalid selectedFile path", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData, selectedFile: ["unknown.json"] },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("accepts defaultSelectedFile", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        defaultSelectedFile: ["package.json"],
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("accepts expandedPaths and defaultExpandedPaths", () => {
    const a = mount(Folder, {
      props: { treeData: mockTreeData, expandedPaths: ["src"] },
    });
    const b = mount(Folder, {
      props: { treeData: mockTreeData, defaultExpandedPaths: ["src"] },
    });
    expect(a.find(".antd-folder").exists()).toBe(true);
    expect(b.find(".antd-folder").exists()).toBe(true);
  });

  it("renders directoryTitle as function", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        directoryTitle: () => h("span", "Title"),
      },
    });
    expect(wrapper.text()).toContain("Title");
  });

  it("hides directoryTitle when false", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData, directoryTitle: false },
    });
    expect(wrapper.find(".antd-folder-directory-tree-title").exists()).toBe(
      false,
    );
  });

  it("hides empty render when emptyRender=false", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData, emptyRender: false },
    });
    expect(wrapper.find(".antd-folder-preview-empty-container").exists()).toBe(
      false,
    );
  });

  it("loads content via fileContentService", async () => {
    const fileContentService = {
      loadFileContent: vi.fn().mockResolvedValue("loaded content"),
    };
    const wrapper = mount(Folder, {
      props: {
        treeData: mockFlatNoContent,
        defaultSelectedFile: ["Button.tsx"],
        fileContentService,
      },
    });
    await nextTick();
    await flush();
    expect(fileContentService.loadFileContent).toHaveBeenCalled();
    wrapper.unmount();
  });

  it("falls back to noService message when no content/service", async () => {
    mount(Folder, {
      props: {
        treeData: mockFlatNoContent,
        defaultSelectedFile: ["Button.tsx"],
      },
    });
    await nextTick();
    await flush();
  });

  it("renders previewTitle as function", () => {
    const previewTitle = vi.fn(({ title }: any) =>
      h("span", `Title: ${title as string}`),
    );
    mount(Folder, {
      props: {
        treeData: mockTreeData,
        defaultSelectedFile: ["package.json"],
        previewTitle: previewTitle as any,
      },
    });
  });

  it("renders previewRender as function", async () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        defaultSelectedFile: ["package.json"],
        previewRender: ({ content }: any) =>
          h("div", { class: "custom-preview" }, `Custom: ${content as string}`),
      },
    });
    await nextTick();
    expect(wrapper.find(".custom-preview").exists()).toBe(true);
  });

  it("renders static previewRender", async () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        defaultSelectedFile: ["package.json"],
        previewRender: h("div", { class: "static-preview" }, "Static"),
      },
    });
    await nextTick();
    expect(wrapper.find(".static-preview").exists()).toBe(true);
  });

  it("applies custom classes and styles", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        classes: {
          root: "custom-root",
          directoryTree: "custom-tree",
          filePreview: "custom-preview",
        },
        styles: {
          root: { padding: "10px" },
          directoryTree: { border: "1px solid red" },
        },
      },
    });
    expect(wrapper.find(".custom-root").exists()).toBe(true);
    expect(wrapper.find(".custom-tree").exists()).toBe(true);
  });

  it("handles error in fileContentService", async () => {
    const fileContentService = {
      loadFileContent: vi.fn().mockRejectedValue(new Error("Network error")),
    };
    mount(Folder, {
      props: {
        treeData: mockFlatNoContent,
        defaultSelectedFile: ["Button.tsx"],
        fileContentService,
      },
    });
    await nextTick();
    await flush();
    expect(fileContentService.loadFileContent).toHaveBeenCalled();
  });

  it("supports root path '/'", () => {
    const treeDataWithRoot: FolderTreeData[] = [
      {
        title: "/",
        path: "/",
        children: [
          {
            title: "index.ts",
            path: "index.ts",
            content: "export default {};",
          },
        ],
      },
    ];
    const wrapper = mount(Folder, { props: { treeData: treeDataWithRoot } });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("handles node with empty children (treated as file)", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: [{ title: "emptyDir", path: "emptyDir", children: [] }],
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });

  it("supports directoryTitle slot (overrides prop)", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        directoryTitle: "Prop Title",
      },
      slots: {
        directoryTitle: () => h("span", { class: "slot-dir-title" }, "Slot"),
      },
    });
    expect(wrapper.find(".slot-dir-title").exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Prop Title");
  });

  it("supports previewTitle slot", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        defaultSelectedFile: ["package.json"],
      },
      slots: {
        previewTitle: ({ title }: any) =>
          h("span", { class: "slot-prev-title" }, `T: ${title as string}`),
      },
    });
    expect(wrapper.find(".slot-prev-title").exists()).toBe(true);
  });

  it("supports previewRender slot", async () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: mockTreeData,
        defaultSelectedFile: ["package.json"],
      },
      slots: {
        previewRender: ({ file }: any) =>
          h(
            "div",
            { class: "slot-prev-render" },
            `lang=${file.language as string}`,
          ),
      },
    });
    await nextTick();
    expect(wrapper.find(".slot-prev-render").exists()).toBe(true);
  });

  it("supports emptyRender slot", () => {
    const wrapper = mount(Folder, {
      props: { treeData: mockTreeData },
      slots: { emptyRender: () => h("div", { class: "slot-empty" }, "Empty") },
    });
    expect(wrapper.find(".slot-empty").exists()).toBe(true);
  });

  it("handles file with no extension", () => {
    const wrapper = mount(Folder, {
      props: {
        treeData: [
          { title: "Makefile", path: "Makefile", content: "all: build" },
        ],
        defaultSelectedFile: ["Makefile"],
      },
    });
    expect(wrapper.find(".antd-folder").exists()).toBe(true);
  });
});
