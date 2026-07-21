<script setup lang="ts">
import { onMounted } from "vue";

import { useAppContext } from "@/composables/use-app-context";
import { useLocale } from "@/composables/use-locale";
import {
  getChinaMainlandRedirectDecision,
  redirectToCnSite,
  setGeoRedirectPreference,
} from "@/utils/geo-redirect";

defineOptions({
  name: "GeoRedirectHandler",
});

const { modal } = useAppContext();
const { t } = useLocale();

async function handleGeoRedirect() {
  const decision = await getChinaMainlandRedirectDecision();

  if (decision === "redirect") {
    redirectToCnSite();
    return;
  }

  if (decision !== "prompt") {
    return;
  }

  const confirmed = await modal.confirm({
    title: t("ui.geoRedirect.title"),
    content: t("ui.geoRedirect.content"),
    okText: t("ui.geoRedirect.okText"),
    cancelText: t("ui.geoRedirect.cancelText"),
  });

  if (confirmed) {
    setGeoRedirectPreference("accepted");
    redirectToCnSite();
    return;
  }

  setGeoRedirectPreference("rejected");
}

onMounted(() => {
  // 延迟一帧执行，避免阻塞首次渲染；geo-redirect 仅依赖 window.location，无需等待路由就绪。
  window.setTimeout(() => {
    void handleGeoRedirect();
  }, 0);
});
</script>

<template>
  <slot />
</template>
