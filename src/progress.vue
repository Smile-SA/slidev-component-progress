<script setup lang="ts">
import { computed } from "vue";
import { rawRoutes, rawTree, TocItem } from "@slidev/client/logic/nav";

const props = defineProps<{
  color?: string;
  height?: string;
  level?: number | string;
  opacity?: number | string;
  position?: "top" | "bottom";
  transitionDuration?: string;
}>();

const { color, height, level = 1, opacity, transitionDuration } = props;

const tree = computed(() => getTree(rawTree.value));

const cssVars = computed(() =>
  removeEmptyValues({
    "--color": color,
    "--height": height,
    "--opacity": opacity,
    "--transition-duration": transitionDuration,
  })
);

function removeEmptyValues(obj: Record<string, any>): Record<string, any> {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

function getTree(tree: TocItem[], lvl: number = 1): TocItem[] {
  if (lvl > Number(level)) {
    return [];
  }
  if (lvl === Number(level)) {
    return tree;
  }
  return tree.reduce((acc, item) => {
    acc.push(item);
    if (item.children) {
      acc = acc.concat(getTree(item.children, lvl + 1));
    }
    return acc;
  }, [] as TocItem[]);
}

function getRouteIndex(path: string) {
  return rawRoutes.findIndex((route) => route.path === path);
}
</script>

<style scoped>
.progress-container {
  --border-color: inherit;
  --color: var(--slidev-theme-primary, #000000);
  --height: 8px;
  --opacity: 0.5;
  --transition-duration: 200ms;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: var(--height);
}

.dark .progress-container {
  --color: var(--slidev-theme-primary, #ffffff);
}

.progress-container-bottom {
  top: initial;
  bottom: 0;
}

.progress-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  opacity: var(--opacity);
  background-color: var(--color);
  transition: width var(--transition-duration);
}

.progress-part {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  border-width: 0 0 0 1px;
  border-style: solid;
  border-color: var(--border-color);
  z-index: 1;
}

.progress-part:first-child {
  border-left: 0;
}
</style>

<template>
  <div
    class="progress-container"
    :class="{ 'progress-container-bottom': position === 'bottom' }"
    :style="cssVars"
  >
    <RouterLink
      v-for="item in tree"
      :key="item.path"
      :to="item.path"
      class="progress-part"
      :style="{
        width: (1 - getRouteIndex(item.path) / $slidev.nav.total) * 100 + '%',
      }"
      :title="item.title"
    ></RouterLink>
    <div
      class="progress-bar"
      :style="{
        width: (($slidev.nav.currentPage - 1) / $slidev.nav.total) * 100 + '%',
      }"
    ></div>
  </div>
</template>
