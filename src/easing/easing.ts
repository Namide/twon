import type { Easing } from '../types.js'

const { PI, cos, sin, sqrt } = Math
const C1 = 1.70158
const C2 = C1 * 1.525
const C3 = C1 + 1
const C4 = (2 * PI) / 3
const C5 = (2 * PI) / 4.5

export const linear: Easing = x => x

export const easeInQuad: Easing = x => x * x

export const easeOutQuad: Easing = x => 1 - (1 - x) * (1 - x)

export const easeInOutQuad: Easing = x =>
  x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2

export const easeInCubic: Easing = x => x ** 3

export const easeOutCubic: Easing = x => 1 - (1 - x) ** 3

export const easeInOutCubic: Easing = x =>
  x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2

export const easeInQuart: Easing = x => x ** 4

export const easeOutQuart: Easing = x => 1 - (1 - x) ** 4

export const easeInOutQuart: Easing = x =>
  x < 0.5 ? 8 * x ** 4 : 1 - (-2 * x + 2) ** 4 / 2

export const easeInQuint: Easing = x => x ** 5

export const easeOutQuint: Easing = x => 1 - (1 - x) ** 5

export const easeInOutQuint: Easing = x =>
  x < 0.5 ? 16 * x ** 4 * x : 1 - (-2 * x + 2) ** 5 / 2

export const easeInSine: Easing = x => 1 - cos((x * PI) / 2)

export const easeOutSine: Easing = x => sin((x * PI) / 2)

export const easeInOutSine: Easing = x => -(cos(PI * x) - 1) / 2

export const easeInExpo: Easing = x => x === 0 ? 0 : 2 ** (10 * x - 10)

export const easeOutExpo: Easing = x => x === 1 ? 1 : 1 - 2 ** (-10 * x)

export const easeInOutExpo: Easing = x =>
  x === 0
    ? 0
    : x === 1
      ? 1
      : x < 0.5
        ? 2 ** (20 * x - 10) / 2
        : (2 - 2 ** (-20 * x + 10)) / 2

export const easeInCirc: Easing = x =>
  1 - sqrt(1 - x * x)

export const easeOutCirc: Easing = x =>
  sqrt(1 - (x - 1) ** 2)

export const easeInOutCirc: Easing = x =>
  x < 0.5
    ? (1 - sqrt(1 - (2 * x) ** 2)) / 2
    : (sqrt(1 - (-2 * x + 2) ** 2) + 1) / 2

export const easeInBack: Easing = x =>
  C3 * x ** 3 - C1 * x * x

export const easeOutBack: Easing = x =>
  1 + C3 * (x - 1) ** 3 + C1 * (x - 1) ** 2

export const easeInOutBack: Easing = x =>
  x < 0.5
    ? ((2 * x) ** 2 * ((C2 + 1) * 2 * x - C2)) / 2
    : ((2 * x - 2) ** 2 * ((C2 + 1) * (x * 2 - 2) + C2) + 2) / 2

export const easeInElastic: Easing = x =>
  x === 0
    ? 0
    : x === 1
      ? 1
      : -(2 ** (10 * x - 10)) * sin((x * 10 - 10.75) * C4)

export const easeOutElastic: Easing = x =>
  x === 0
    ? 0
    : x === 1
      ? 1
      : 2 ** (-10 * x) * sin((x * 10 - 0.75) * C4) + 1

export const easeInOutElastic: Easing = x =>
  x === 0
    ? 0
    : x === 1
      ? 1
      : x < 0.5
        ? -(2 ** (20 * x - 10) * sin((20 * x - 11.125) * C5)) / 2
        : (2 ** (-20 * x + 10) * sin((20 * x - 11.125) * C5)) / 2 + 1

export const easeOutBounce: Easing = x => {
  const n1 = 7.5625
  const d1 = 2.75

  if (x < 1 / d1) {
    return n1 * x * x
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375
  }
}

export const easeInBounce: Easing = x => 1 - easeOutBounce(1 - x)

export const easeInOutBounce: Easing = x => x < 0.5
  ? (1 - easeOutBounce(1 - 2 * x)) / 2
  : (1 + easeOutBounce(2 * x - 1)) / 2
