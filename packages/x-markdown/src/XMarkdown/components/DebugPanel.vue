<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  className?: string;
}

defineProps<Props>();

interface PerformanceSnapshot {
  fps: number;
  memory: number;
  timestamp: number;
}

const isDragging = ref(false);
const position = ref({ x: 20, y: 20 });
const dragOffset = ref({ x: 0, y: 0 });

const fps = ref(0);
const memory = ref(0);
const snapshots = ref<PerformanceSnapshot[]>([]);
const maxSnapshots = 60;

let animationFrameId: number | null = null;
let lastFrameTime = 0;
let frameCount = 0;

function startMonitoring() {
  lastFrameTime = performance.now();
  frameCount = 0;

  function monitor() {
    frameCount++;
    const now = performance.now();
    const elapsed = now - lastFrameTime;

    if (elapsed >= 1000) {
      fps.value = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastFrameTime = now;

      if ("memory" in performance) {
        const memInfo = (performance as { memory?: { usedJSHeapSize: number } })
          .memory;
        memory.value = memInfo
          ? Math.round(memInfo.usedJSHeapSize / 1024 / 1024)
          : 0;
      }

      snapshots.value.push({
        fps: fps.value,
        memory: memory.value,
        timestamp: Date.now(),
      });

      if (snapshots.value.length > maxSnapshots) {
        snapshots.value.shift();
      }
    }

    animationFrameId = requestAnimationFrame(monitor);
  }

  animationFrameId = requestAnimationFrame(monitor);
}

function stopMonitoring() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function handleMouseDown(e: MouseEvent) {
  isDragging.value = true;
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y,
  };
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  position.value = {
    x: e.clientX - dragOffset.value.x,
    y: e.clientY - dragOffset.value.y,
  };
}

function handleMouseUp() {
  isDragging.value = false;
}

function getFpsColor(fpsValue: number): string {
  if (fpsValue >= 55) return "#52c41a";
  if (fpsValue >= 40) return "#faad14";
  return "#ff4d4f";
}

function getChartPath(): string {
  if (snapshots.value.length < 2) return "";

  const width = 200;
  const height = 60;
  const maxFps = 60;

  const points = snapshots.value.map((s, i) => {
    const x = (i / (maxSnapshots - 1)) * width;
    const y = height - (s.fps / maxFps) * height;
    return `${x},${y}`;
  });

  return `M ${points.join(" L ")}`;
}

onMounted(() => {
  startMonitoring();
  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
});

onUnmounted(() => {
  stopMonitoring();
  document.removeEventListener("mousemove", handleMouseMove);
  document.removeEventListener("mouseup", handleMouseUp);
});
</script>

<template>
  <div
    :class="['xmd-debug-panel', className]"
    :style="{ left: `${position.x}px`, top: `${position.y}px` }"
  >
    <div class="xmd-debug-header" @mousedown="handleMouseDown">
      <span>Debug Panel</span>
    </div>
    <div class="xmd-debug-content">
      <div class="xmd-debug-stat">
        <span class="xmd-debug-label">FPS:</span>
        <span :style="{ color: getFpsColor(fps) }">{{ fps }}</span>
      </div>
      <div class="xmd-debug-stat">
        <span class="xmd-debug-label">Memory:</span>
        <span>{{ memory }} MB</span>
      </div>
      <svg class="xmd-debug-chart" viewBox="0 0 200 60">
        <path
          :d="getChartPath()"
          fill="none"
          stroke="#1890ff"
          stroke-width="2"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.xmd-debug-panel {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 12px;
  min-width: 220px;
  color: #fff;
  font-size: 12px;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  user-select: none;
}

.xmd-debug-header {
  cursor: move;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 600;
}

.xmd-debug-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.xmd-debug-stat {
  display: flex;
  justify-content: space-between;
}

.xmd-debug-label {
  color: rgba(255, 255, 255, 0.7);
}

.xmd-debug-chart {
  width: 100%;
  height: 60px;
  margin-top: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>
