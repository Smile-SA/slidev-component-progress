# slidev-component-progress

[![NPM version](https://img.shields.io/npm/v/slidev-component-progress?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-component-progress)

Progress component for Slidev `Slidev`.  
Shows a progress bar that represents the completed percentage of the presentation.

![Progress demo](./assets/progress.gif)

## Installation

```bash
npm i slidev-component-progress
```

## Usage

Create a `./setup/main.ts` file in your `Slidev` project and register the plugin:
```js
import { defineAppSetup } from '@slidev/types'
import Progress from 'slidev-component-progress'

export default defineAppSetup(({ app, router }) => {
  app.use(Progress)
})
```

Create a `./global-top.vue` file in your `Slidev` project and use the component:
```vue
<template>
  <Progress level="2"/>
</template>
```

## Parameters

* `activeColor` (type: `string`, default: `'#ffffff'` (light) or `'#000000'` (dark)): The color of the active item
* `barColor` (type: `string`): The color of the progress bar, by default, it will use the `--slidev-theme-primary` CSS variable
* `height` (type: `string`): Height of the progress bar, by default it is the minimum possible height depending of the `level`
* `level` (type: `number | string`, default: `1`): Title level to show in the progress bar with informations from the Table Of Content
* `opacity`  (type: `number | string`, default: `0.5`): Opacity of the progress bar when not hovered
* `position` (type: `'top' | bottom'`, default: `'top'`): Position of the progress bar in the slide
* `strokeColor` (type: `string`, default: `'#000000'`(light) or `'#ffffff'` (dark)): The stroke color for the items
* `thickness` (type: `string`, default: `2px`)
* `transitionDuration` (type: `string`, default: `200ms`): CSS transition durations
