import { describe, it, expect, vi, beforeEach } from "vitest";

class MockNotification {
  title: string;
  options?: NotificationOptions;
  close: ReturnType<typeof vi.fn>;
  onclick: ((this: MockNotification, ev: Event) => any) | null;
  _onclose: ((this: MockNotification, ev: Event) => any) | null;
  private _onshow: ((this: Notification, ev: Event) => any) | null;
  _onerror: ((this: Notification, ev: Event) => any) | null;
  static permission: NotificationPermission = "default";

  constructor(title: string, options?: NotificationOptions) {
    this.title = title;
    this.options = options;
    this.close = vi.fn(() => {
      const event = new Event("close");
      this.onclose?.(event);
    });
    this.onclick = null;
    this._onclose = null;
    this._onshow = null;
    this._onerror = null;
  }

  get onshow(): ((this: Notification, ev: Event) => any) | null {
    return this._onshow;
  }

  set onshow(callback: ((this: Notification, ev: Event) => any) | null) {
    this._onshow = callback;
    if (this._onshow) {
      const event = new Event("show");
      this._onshow.call(this as unknown as Notification, event);
    }
  }

  get onclose(): ((this: any, ev: Event) => any) | null {
    return this._onclose;
  }

  set onclose(callback: ((this: MockNotification, ev: Event) => any) | null) {
    this._onclose = callback;
  }

  get onerror(): ((this: Notification, ev: Event) => any) | null {
    return this._onerror;
  }

  set onerror(callback: ((this: Notification, ev: Event) => any) | null) {
    this._onerror = callback;
    if (this._onerror) {
      const event = new Event("error");
      this._onerror.call(this as unknown as Notification, event);
    }
  }

  static requestPermission() {
    MockNotification.permission = "granted";
    return Promise.resolve("granted" as NotificationPermission);
  }
}

let notification: any = null;
let XNotification: any = null;

describe("XNotification", () => {
  beforeEach(() => {
    (globalThis.Notification as any) = MockNotification;
    vi.resetModules();
  });

  beforeEach(async () => {
    const mod = await import("../index");
    notification = mod.default;
    XNotification = mod.XNotification;
    (XNotification as any).permissionMap = new Map();
  });

  describe("open", () => {
    let instances: MockNotification[];

    beforeEach(() => {
      instances = [];
      const OriginalMock = MockNotification;
      const SpiedNotification = class extends OriginalMock {
        constructor(title: string, options?: NotificationOptions) {
          super(title, options);
          instances.push(this);
        }
      };
      (SpiedNotification as any).permission = "default";
      SpiedNotification.requestPermission = () =>
        MockNotification.requestPermission();
      globalThis.Notification = SpiedNotification as any;
    });

    it("should create notification with title", () => {
      notification.open({ title: "Test" });
      expect(instances.length).toBe(1);
      expect(instances[0]!.title).toBe("Test");
    });

    it("should not create duplicate notification with same tag", () => {
      notification.open({ title: "Test", tag: "test-tag" });
      notification.open({ title: "Test", tag: "test-tag" });
      expect(instances.length).toBe(1);
    });

    it("should call onClick callback", () => {
      const onClick = vi.fn();
      notification.open({ title: "Test", onClick });
      instances[0]?.onclick?.({} as any);
      expect(onClick).toHaveBeenCalled();
    });

    it("should auto close after duration", () => {
      vi.useFakeTimers();
      notification.open({ title: "Test", duration: 5 });
      vi.advanceTimersByTime(5000);
      expect(instances[0]!.close).toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe("close", () => {
    it("should close all notifications", () => {
      notification.open({ title: "Test1", tag: "key1" });
      notification.open({ title: "Test2", tag: "key2" });
      expect((XNotification as any).permissionMap.size).toBe(2);
      notification.close();
      expect((XNotification as any).permissionMap.size).toBe(0);
    });
  });

  describe("requestPermission", () => {
    it("should update permission state", async () => {
      const permission = await notification.requestPermission();
      expect(permission).toEqual("granted");
      expect(notification.permission).toEqual("granted");
    });
  });

  describe("useNotification", () => {
    beforeEach(() => {
      (globalThis as any).Notification = MockNotification;
      MockNotification.permission = "default";
      (XNotification as any).permissionMap = new Map();
    });

    it("should return permission state and methods", () => {
      const [state, methods] = notification.useNotification();
      expect(state.permission).toBeDefined();
      expect(typeof methods.open).toBe("function");
      expect(typeof methods.close).toBe("function");
      expect(typeof methods.requestPermission).toBe("function");
    });

    it("should return current permission", () => {
      const [{ permission }] = notification.useNotification();
      expect(permission.value).toBe("default");
    });
  });
});

describe("XNotification with not permissible", () => {
  beforeEach(() => {
    (globalThis.Notification as any) = null;
    vi.resetModules();
  });

  it("should permission is denied", async () => {
    const mod = await import("../index");
    const notification = mod.default;
    const XNotification = mod.XNotification;
    XNotification.permissible = !!globalThis.Notification;
    await notification.requestPermission();
    expect(notification.permission).toBe("denied");
  });
});
