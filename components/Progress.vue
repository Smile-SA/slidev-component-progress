<script setup lang="ts">
import { computed } from "vue";
import { useNav } from "@slidev/client"

import type { TocItem } from "@slidev/types";

import { slides } from "#slidev/slides";
import Titles from "#slidev/title-renderer";

const { currentPage, currentLayout, tocTree, total } = useNav()

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

const gradientWidth = computed(() =>
  currentPage.value === 1
    ? "var(--margin)"
    : (1 / (currentPage.value - 1)) * 100 + "%"
);

const rightMargin = computed(() =>
  tree.value[tree.value.length - 1]
    ? (height.value / 2 - (tree.value[tree.value.length - 1].level - 1) * 2) * 2
    : 0
);

const cssVars = computed(() =>
  removeEmptyValues({
    "--active-color": activeColor,
    "--bar-color": barColor,
    "--height": height.value + "px",
    "--opacity": opacity,
    "--stroke-color": strokeColor,
    "--thickness": thickness,
    "--transition-duration": transitionDuration,
    "--right-margin": rightMargin.value + "px",
    display:
      window.location.search.indexOf("print") !== -1 ? "none" : undefined,
  })
);

const lastActiveRoute = computed(() =>
  getLastActiveRoute(
    currentPage.value ?? 0
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

function getRouteIndex(no: number): number {
  return slides.value.findIndex((route) => route.no === no);
}

function isRouteActive(item: TocItem, no: number): boolean {
  if (item.no === no) {
    return true;
  }
  if (item.children && item.children.length > 0) {
    return item.children.some((child) => isRouteActive(child, no));
  }
  return false;
}

function getLastActiveRoute(no: number): TocItem {
  return tree.value.reduce(
    (acc: TocItem, item: TocItem) => (isRouteActive(item, no) ? item : acc),
    tree.value[0]
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
  --line-height: 1.5em;
  --margin: 2px;
  --padding: 8px;

  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 0 !important;
  padding-bottom: calc(var(--margin) * 2 + var(--height));
  overflow: visible;
  font-size: 80%;
  line-height: var(--line-height);
  background-color: inherit;
  background-clip: content-box;
  box-sizing: content-box;
  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1),
    rgba(0, 0, 0, 1)
      calc(
        var(--margin) + var(--height) + var(--padding) + var(--line-height) -
          5px
      ),
    transparent
      calc(
        var(--margin) * 2 + var(--height) * 2 + var(--padding) +
          var(--line-height)
      )
  );
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1),
    rgba(0, 0, 0, 1)
      calc(
        var(--margin) + var(--height) + var(--padding) + var(--line-height) -
          5px
      ),
    transparent
      calc(
        var(--margin) * 2 + var(--height) * 2 + var(--padding) +
          var(--line-height)
      )
  );
  opacity: var(--opacity);
  transition: opacity var(--transition-duration),
    padding var(--transition-duration), height var(--transition-duration);

  &:hover {
    padding: 0;
    opacity: 1;
    height: calc(
      var(--margin) * 2 + var(--height) * 2 + var(--padding) +
        var(--line-height)
    ) !important;
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
  left: 0;
  height: var(--height);
  margin: var(--margin);
  margin-right: calc(var(--margin) + var(--right-margin));
}

.progress__bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: var(--thickness);
  margin: 0 calc((var(--margin) + var(--right-margin)) * -1) 0
    calc(var(--margin) * -1);
  background-color: var(--bar-color, #000000);
  transition: width var(--transition-duration);
}

.progress--first .progress__bar,
.progress__bar--next {
  -webkit-mask-image: linear-gradient(
    to left,
    transparent,
    rgba(0, 0, 0, 1) calc(v-bind(gradientWidth) - var(--margin)),
    rgba(0, 0, 0, 1) 100%
  );
  mask-image: linear-gradient(
    to left,
    transparent,
    rgba(0, 0, 0, 1) calc(v-bind(gradientWidth) - var(--margin)),
    rgba(0, 0, 0, 1) 100%
  );
}

.progress__active {
  position: absolute;
  top: 50%;
  transform: translate(var(--height), -50%);
  border-radius: 50%;
  background-color: var(--bar-color, #000000);
}

.dark .progress__bar,
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

.progress__circle--active,
.progress__circle--next {
  fill: var(--active-color, #ffffff);
}

.dark .progress__circle--active,
.dark .progress__circle--next {
  fill: var(--active-color, #000000);
}

.progress__circle--prev {
  fill: var(--bar-color, #000000);
}

.dark .progress__circle--prev {
  fill: var(--bar-color, #ffffff);
}

.progress__link {
  position: relative;

  &::before {
    content: "";
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
  width: max-content;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 100%);
  white-space: nowrap;
  padding-top: var(--padding);
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
      'progress--first': currentPage === 1,
      [`progress--${currentLayout}`]: currentLayout,
    }"
    :style="cssVars"
  >
    <div class="progress__container">
      <div
        v-for="item in tree"
        :key="item.path"
        class="progress__part"
        :style="{
          width: (1 - getRouteIndex(item.no) / total) * 100 + '%',
        }"
      >
        <RouterLink
          class="progress__link"
          :class="{
            'progress__link--start':
              item.no - 1 < total / 5,
            'progress__link--end':
              item.no - 1 > (4 * total) / 5,
          }"
          :to="item.path"
          @click="handleClick()"
        >
          <svg class="progress__step" :width="height" :height="height">
            <circle
              v-for="level in maxLevel - item.level + 1"
              :key="level"
              class="progress__circle"
              :class="{
                'progress__circle--active': item === lastActiveRoute,
                'progress__circle--prev': previousRoutes.includes(item),
                'progress__circle--next':
                  !previousRoutes.includes(item) && item !== lastActiveRoute,
              }"
              :r="height / 2 - (item.level + level - 2) * 2"
              :cx="height / 2"
              :cy="height / 2"
            />
          </svg>
          <div class="progress__tooltip">
            <Titles :no="item.no" />
          </div>
        </RouterLink>
      </div>
      <div
        class="progress__active"
        :style="{
          right: `calc(${
            (1 - getRouteIndex(lastActiveRoute?.no) / total) * 100
          }% + ${(lastActiveRoute?.level - 2) * 2}px)`,
          width: `${height - (lastActiveRoute?.level - 1) * 4 + 4}px`,
          height: `${height - (lastActiveRoute?.level - 1) * 4 + 4}px`,
        }"
      ></div>
      <div
        class="progress__bar"
        :class="{
          'progress__bar--next':
            lastActiveRoute?.no < currentPage,
        }"
        :style="{
          width: `calc(${
            ((currentPage - 1) / total) * 100
          }% + 6px)`,
        }"
      ></div>
    </div>
  </div>
</template>
