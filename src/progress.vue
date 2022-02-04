<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";
import type { UnwrapNestedRefs } from "@vue/reactivity";
import type { TocItem } from "@slidev/client/logic/nav";
import * as nav from "@slidev/client/logic/nav";
import { configs } from "@slidev/client/env";

const { rawRoutes, tree: tocTree } = nav;

interface ComponentCustomProperties {
  $slidev: {
    nav: UnwrapNestedRefs<typeof nav>;
    configs: typeof configs;
    themeConfigs: typeof configs["themeConfig"];
  };
}

const props = defineProps<{
  activeColor?: string;
  barColor?: string;
  height?: number;
  level?: number | string;
  opacity?: number | string;
  position?: "top" | "bottom";
  strokeColor?: string;
  thickness?: string;
  transitionDuration?: string;
}>();

const vm = getCurrentInstance();

const {
  activeColor,
  barColor,
  level = 1,
  opacity,
  strokeColor,
  thickness,
  transitionDuration,
} = props;

const tree = computed(() => getTree(tocTree.value));

const maxLevel = computed(() =>
  Math.max(...tree.value.map((item) => item.level))
);

const minHeight = computed(() => maxLevel.value * 4);

const height = computed(() => Math.max(props.height || 0, minHeight.value));

const cssVars = computed(() =>
  removeEmptyValues({
    "--active-color": activeColor,
    "--bar-color": barColor,
    "--height": height.value + "px",
    "--opacity": opacity,
    "--stroke-color": strokeColor,
    "--thickness": thickness,
    "--transition-duration": transitionDuration,
  })
);

const lastActiveRoute = computed(() =>
  getLastActiveRoute(
    (vm?.proxy as unknown as ComponentCustomProperties).$slidev.nav.currentPage
  )
);

const previousRoutes = computed(() => getPreviousRoutes(lastActiveRoute.value));

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

function getRouteIndex(path: string): number {
  return rawRoutes.findIndex((route) => route.path === path);
}

function isRouteActive(item: TocItem, path: number): boolean {
  if (Number(item.path) === path) {
    return true;
  }
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => isRouteActive(child, path));
  }
  return false;
}

function getLastActiveRoute(path: number): null | TocItem {
  return tree.value.reduce(
    (acc: null | TocItem, item) => (isRouteActive(item, path) ? item : acc),
    null
  );
}

function getPreviousRoutes(item: null | TocItem): TocItem[] {
  if (!item) {
    return [];
  }

  const index = tree.value.indexOf(item);
  return tree.value.reduce((acc, item) => {
    if (tree.value.indexOf(item) < index) {
      acc.push(item);
    }
    return acc;
  }, [] as TocItem[]);
}

function handleClick() {
  (document.activeElement as HTMLAnchorElement).blur();
}
</script>

<style>
.progress {
  --bar-color: var(--slidev-theme-primary);
  --opacity: 0.5;
  --thickness: 2px;
  --transition-duration: 200ms;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: var(--height);
  margin: 2px;
  opacity: var(--opacity);
  transition: opacity var(--transition-duration);

  &:hover {
    opacity: 1;
  }
}

.progress--bottom {
  top: initial;
  bottom: 0;
}

.progress--cover,
.progress--end {
  display: none;
}

.progress__container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.progress__bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: var(--thickness);
  margin: 0 -2px;
  background-color: var(--bar-color, #000000);
  transition: width var(--transition-duration);
}

.progress__bar--next {
  -webkit-mask-image: linear-gradient(
    to left,
    transparent,
    rgba(0, 0, 0, 1) 20px,
    rgba(0, 0, 0, 1) 100%
  );
  mask-image: linear-gradient(
    to left,
    transparent,
    rgba(0, 0, 0, 1) 20px,
    rgba(0, 0, 0, 1) 100%
  );
}

.progress__previous,
.progress__active {
  position: absolute;
  top: 50%;
  transform: translate(var(--height), -50%);
  border-radius: 50%;
  background-color: var(--bar-color, #000000);
}

.dark .progress__bar,
.dark .progress__previous,
.dark .progress__active {
  background-color: var(--bar-color, #ffffff);
}

.progress__part {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.progress__link,
.progress__step {
  display: block;
  width: var(--height);
}

.progress__circle {
  fill: transparent;
  stroke: var(--stroke-color, #000000);
  transition: fill var(--transition-duration);
}

.dark .progress__circle {
  stroke: var(--stroke-color, #ffffff);
}

.progress__circle--active {
  fill: var(--active-color, #ffffff);
}

.dark .progress__circle--active {
  fill: var(--active-color, #000000);
}

.progress__link {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 1px;
    height: 5px;
    background-color: var(--stroke-color, #000000);
    transform: translate(-50%, 7px);
    visibility: hidden;
    opacity: 0;
    transition: visibility var(--transition-duration),
      opacity var(--transition-duration);
  }
}

.dark .progress__link::before {
  background-color: var(--stroke-color, #ffffff);
}

.progress__tooltip {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 100%);
  white-space: nowrap;
  font-size: 80%;
  padding-top: 5px;
  visibility: hidden;
  opacity: 0;
  transition: visibility var(--transition-duration),
    opacity var(--transition-duration);
}

.progress__link:hover::before,
.progress__link:hover .progress__tooltip {
  visibility: visible;
  opacity: 1;
}

.progress__link--start .progress__tooltip {
  left: 0;
  transform: translate(0, 100%);
}

.progress__link--end .progress__tooltip {
  left: 100%;
  transform: translate(-100%, 100%);
}
</style>

<template>
  <div
    class="progress"
    :class="{
      'progress--bottom': position === 'bottom',
      [`progress--${$slidev.nav.currentLayout}`]: $slidev.nav.currentLayout
    }"
    :style="cssVars"
  >
    <div class="progress__container">
      <div
        v-for="item in tree"
        :key="item.path"
        class="progress__part"
        :style="{
          width: (1 - getRouteIndex(item.path) / $slidev.nav.total) * 100 + '%',
        }"
      >
        <RouterLink
          class="progress__link"
          :class="{
            'progress__link--start': Number(item.path) - 1 < $slidev.nav.total / 4,
            'progress__link--end':
              Number(item.path) - 1 > (3 * $slidev.nav.total) / 4,
          }"
          :to="item.path"
          @click="handleClick()"
        >
          <svg class="progress__step" :width="height" :height="height">
            <circle
              v-for="level in maxLevel - item.level + 1"
              :key="level"
              class="progress__circle"
              :class="{ 'progress__circle--active': item === lastActiveRoute }"
              :r="height / 2 - (maxLevel - level) * 2"
              :cx="height / 2"
              :cy="height / 2"
            />
          </svg>
          <div class="progress__tooltip" v-html="item.title"></div>
        </RouterLink>
      </div>
      <div
        v-for="item in previousRoutes"
        :key="item.path"
        class="progress__previous"
        :style="{
          right: `calc(${
            (1 - getRouteIndex(item.path) / $slidev.nav.total) * 100
          }% + ${(item.level - 1) * 2}px)`,
          width: `${height - (item.level - 1) * 4}px`,
          height: `${height - (item.level - 1) * 4}px`,
        }"
      ></div>
      <div
        class="progress__active"
        :style="{
          right: `calc(${
            (1 - getRouteIndex(lastActiveRoute?.path) / $slidev.nav.total) * 100
          }% + ${(lastActiveRoute?.level - 2) * 2}px)`,
          width: `${height - (lastActiveRoute?.level - 1) * 4 + 4}px`,
          height: `${height - (lastActiveRoute?.level - 1) * 4 + 4}px`,
        }"
      ></div>
      <div
        class="progress__bar"
        :class="{
          'progress__bar--next':
            Number(lastActiveRoute?.path) < $slidev.nav.currentPage,
        }"
        :style="{
          width: `calc(${
            (($slidev.nav.currentPage - 1) / $slidev.nav.total) * 100
          }% + 6px)`,
        }"
      ></div>
    </div>
  </div>
</template>
