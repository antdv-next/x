interface IpAddrResponse {
  code?: number;
  message?: string;
  data?: {
    from?: string;
    ip?: string;
  };
}

interface IpSbResponse {
  country_code?: string;
}

const CN_SITE_ORIGIN = "https://x.antdv-next.cn";
const GEO_IP_TIMEOUT = 1500;
const GEO_REDIRECT_PREFERENCE_KEY = "cn-site-redirect-preference";

interface GeoIpApi {
  url: string;
  /** 解析响应文本并判断是否为国内（中国大陆）访问。 */
  parse: (text: string) => boolean;
}

/**
 * IP 地理定位接口回退链，按顺序尝试，首个成功响应即采用。
 * - myip.ipip.net：国内服务、响应快、CORS 放行，返回纯文本（如“当前 IP：… 来自于：中国 福建 福州 电信”）；
 * - api.ip.sb/geoip：JSON 返回 country_code（HK/TW/MO 均不为 CN），国内一般可达；
 * - v4_dx.boce.com：antdv-next 主站同款接口，可能不可用，仅作最后兜底。
 */
const GEO_IP_APIS: GeoIpApi[] = [
  {
    url: "https://myip.ipip.net",
    parse: text => {
      if (!text.includes("中国")) {
        return false;
      }
      // ipip.net 对港澳台也以“中国香港/中国澳门/中国台湾”表述，需排除。
      return !["香港", "澳门", "台湾"].some(region => text.includes(region));
    },
  },
  {
    url: "https://api.ip.sb/geoip",
    parse: text => {
      try {
        const json = JSON.parse(text) as IpSbResponse;
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
        const json = JSON.parse(text) as IpAddrResponse;
        const from = json.data?.from;
        return !!from && (from === "中国" || from.startsWith("中国/"));
      } catch {
        return false;
      }
    },
  },
];

export type GeoRedirectPreference = "accepted" | "rejected";
export type GeoRedirectDecision = "redirect" | "prompt" | "skip";

function isComHost(hostname: string): boolean {
  const normalizedHostname = hostname.trim().toLowerCase().replace(/\.$/, "");

  return (
    normalizedHostname === "x.antdv-next.com" ||
    normalizedHostname === "www.x.antdv-next.com"
  );
}

export function getGeoRedirectPreference(): GeoRedirectPreference | null {
  if (typeof window === "undefined") {
    return null;
  }

  const preference = window.localStorage.getItem(GEO_REDIRECT_PREFERENCE_KEY);

  return preference === "accepted" || preference === "rejected"
    ? preference
    : null;
}

export function setGeoRedirectPreference(
  preference: GeoRedirectPreference,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GEO_REDIRECT_PREFERENCE_KEY, preference);
}

export function buildCnRedirectUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const { location } = window;

  if (
    !isComHost(location.hostname) ||
    location.pathname.startsWith("/~demos")
  ) {
    return null;
  }

  // .com 与 .cn 部署相同产物、路由规则一致（zh-CN 默认无后缀，en-US 使用 -en 后缀），
  // 因此跳转时仅替换站点 origin，保持当前 pathname/search/hash，以尊重用户当前的语言选择。
  const targetUrl = new URL(CN_SITE_ORIGIN);
  targetUrl.pathname = location.pathname;
  targetUrl.search = location.search;
  targetUrl.hash = location.hash;

  return targetUrl.href === location.href ? null : targetUrl.href;
}

export function redirectToCnSite(): void {
  const targetUrl = buildCnRedirectUrl();

  if (targetUrl) {
    window.location.replace(targetUrl);
  }
}

export async function getChinaMainlandRedirectDecision(): Promise<GeoRedirectDecision> {
  if (typeof window === "undefined") {
    return "skip";
  }

  const targetUrl = buildCnRedirectUrl();

  if (!targetUrl) {
    return "skip";
  }

  const preference = getGeoRedirectPreference();

  if (preference === "accepted") {
    return "redirect";
  }

  if (preference === "rejected") {
    return "skip";
  }

  // 逐个尝试回退链，任一接口成功即返回判定结果；全部失败则静默跳过。
  for (const api of GEO_IP_APIS) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      GEO_IP_TIMEOUT,
    );

    try {
      const response = await fetch(api.url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        continue;
      }

      const text = await response.text();

      if (api.parse(text)) {
        return "prompt";
      }

      // 接口成功但判定为非国内访问，直接结束探测，不再尝试后续接口。
      return "skip";
    } catch {
      // Ignore network and CORS failures; try the next API in the chain.
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  return "skip";
}
