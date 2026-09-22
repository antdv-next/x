// 必须从深路径导入：主入口会 re-export demo 插件模块，后者在顶层
// import "vite"（normalizePath / transformWithOxc），打进 client bundle
// 会在浏览器里炸（__vite-browser-external.createRequire is not a function）。
import { createMirrorRedirect } from "@antdv-next/docs-plugins/dist/mirror-redirect/index";

const mirror = createMirrorRedirect({
  mainHosts: ["x.antdv-next.com", "www.x.antdv-next.com"],
  mirrorOrigin: "https://x.antdv-next.cn",
  // .com 与 .cn 部署相同产物、路由规则一致，跳转只替换 origin。
  pathname: "same",
  // 保留 x 现有的三条 GeoIP 回退链，比 docs-plugins 默认的 boce 单接口更稳。
  geoApis: [
    {
      url: "https://myip.ipip.net",
      parse: text => {
        if (!text.includes("中国")) {
          return false;
        }
        return !["香港", "澳门", "台湾"].some(region => text.includes(region));
      },
    },
    {
      url: "https://api.ip.sb/geoip",
      parse: text => {
        try {
          const json = JSON.parse(text) as { country_code?: string };
          return json.country_code === "CN";
        } catch {
          return false;
        }
      },
    },
    {
      url: "https://v4_dx.boce.com:44433/ipaddr",
      parse: text => {
        try {
          const json = JSON.parse(text) as {
            data?: { from?: string };
          };
          const from = json.data?.from;
          return !!from && (from === "中国" || from.startsWith("中国/"));
        } catch {
          return false;
        }
      },
    },
  ],
  // 提示或跳转前先确认镜像站可访问，避免把用户送到打不开的站点。
  probeUrl: "https://x.antdv-next.cn/x.svg",
});

export type GeoRedirectPreference = "accepted" | "rejected";
export type GeoRedirectDecision = "redirect" | "prompt" | "skip";

export function getGeoRedirectPreference(): GeoRedirectPreference | null {
  return mirror.getPreference();
}

export function setGeoRedirectPreference(
  preference: GeoRedirectPreference,
): void {
  mirror.setPreference(preference);
}

export function buildCnRedirectUrl(): string | null {
  return mirror.buildRedirectUrl();
}

export function redirectToCnSite(): void {
  mirror.redirect();
}

export async function getChinaMainlandRedirectDecision(): Promise<GeoRedirectDecision> {
  return mirror.getDecision();
}
