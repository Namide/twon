# Twon

Tween js/ts library with timeline and cubic bezier support

> ⚠️ Alpha version, roadmap below

## Requirements

- Firefox: 52+
- Chrome: 52+
- Edge: 14+
- Opera: 39+
- Safari: 10.1+
- Android Browser: 109+
- Samsung Internet: 6.2+
- Firefox for Android: 110+
- iOS Safari: 10.3+
- Opera Mobile: 73+
- ~~Internet Explorer~~

## Install

```bash
npm install twon
```

## Examples

### Simple tween

```javascript
import { Tween, easeInOutCubic } from "twon"

const tween = new Tween(
  [
    5, // from value
    10 // to value
  ],
  {
    delay: 1000, // delay of 1 second before tween
    duration: 2000, // 2 seconds of animation
    ease: easeInOutCubic, // Cubic easing equation
  }
).on('update', console.log) // log on each frame

// or log once after 1.5 sec
setTimeout(() => {
  console.log(tween.getValue())
}, 1500)
```

### Path

```javascript
import { Tween } from "twon"

const tween = new Tween(
  [ // 2D path with 4 positions
    [0, 0],
    [0.25, 0.25],
    [0.25, 0.1],
    [0.5, 0.4]
  ],
  {
    delay: 1000, // delay of 1 second before tween
    duration: 2000, // 2 seconds of animation
  }
).on('update', console.log)
```

### Smooth path

```javascript
import { Tween, ErodeSmoothPath } from "twon"

const tween = new Tween(
  ErodeSmoothPath(
    [ // 2D smooth path with 4 positions
      [0, 0],
      [0.25, 0.25],
      [0.25, 0.1],
      [0.5, 0.4]
    ],
    { step: 3 }
  ),
  {
    duration: 1000, // 1 seconds of animation
  }
).on('update', console.log)
```

### Cubic-Bezier

```javascript
import { Tween, cubicBezier } from "twon"

const tween = new Tween(
  [
    5, // from value
    10 // to value
  ],
  {
    delay: 1000, // delay of 1 second before tween
    duration: 2000, // 2 seconds of animation
    ease: cubicBezier(0.435, 0.002, 0.075, 0.989), // Cubic bezier curve
  }
).on('update', console.log)
```

### Dynamic tween

```javascript
import { DynamicTween } from "twon";

const tween = new DynamicTween(
  [0, 0], // 2 dimention position
).on('update', console.log)

// Change position after 500ms
setTimeout(() =>
  tween.to([
    Math.random(),
    Math.random()
  ]),
  500
)
```

## Todo

- ☑️ Equations
- ☑️ Cubic-Bezier
- ☑️ Simple path
- ☑️ Smooth path
- ☑️ Ticker
- ☑️ Timeline
- ☑️ Simple tween
- ☑️ Dynamic tween
- CI
- Log errors
- Unit tests
- Code coverage
- Documentation
- Website

## License

Copyright (C) 2023 Damien Doussaud

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see https://www.gnu.org/licenses/.
