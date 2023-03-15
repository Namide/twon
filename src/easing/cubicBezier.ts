import type { Easing } from '../types.js'

// export const defaultCubicBezier = {
//   steps: 100
// }

// // https://javascript.info/bezier-curve
// // P = (1-t)3P1 + 3(1-t)2tP2 +3(1-t)t2P3 + t3P4
// // (1 - progress) ** 3 * P1 + 3 * (1 - progress) ** 2 * progress * P2 + 3 * (1 - progress) * progress ** 2 * P3 + progress ** 3 * P4
// export const cubicBezier: (x1: number, y1: number, x2: number, y2: number, accuracy?: number) => Easing = (x1, y1, x2, y2, steps = defaultCubicBezier.steps) => {
//   const list: number[][] = [[0, 0]]
//   for (let i = 1; i < steps; i++) {
//     const t = i / (steps - 1)
//     const x = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3
//     const y = 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3
//     list.push([x, y])
//   }
//   list.push([1, 1])

//   return (progress: number) => {
//     if (progress <= 0) {
//       return 0
//     }
//     if (progress >= 1) {
//       return 1
//     }
//     const nextIndex = list.findIndex(([x]) => x > progress)
//     const [x1, y1] = list[nextIndex]
//     const [x2, y2] = list[nextIndex - 1]

//     return (progress - x1) * (y2 - y1) / (x2 - x1) + y1
//   }
// }

export const cubicBezier: (x1: number, y1: number, x2: number, y2: number) => Easing = (x1, y1, x2, y2) => {
  const a = (a1: number, a2: number) => 1 - 3 * a2 + 3 * a1
  const b = (a1: number, a2: number) => 3 * a2 - 6 * a1
  const c = (a1: number) => 3 * a1

  const calcBezier = (t: number, a1: number, a2: number) => ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t

  const getSlope = (t: number, a1: number, a2: number) => 3 * a(a1, a2) * t * t + 2 * b(a1, a2) * t + c(a1)

  const getTforX = (x: number) => {
    let aGuessT = x

    for (let i = 0; i < 4; ++i) {
      const currentSlope = getSlope(aGuessT, x1, x2)
      if (currentSlope === 0)
        return aGuessT
      const currentX = calcBezier(aGuessT, x1, x2) - x
      aGuessT -= currentX / currentSlope
    }

    return aGuessT
  }

  return (x: number) => (x1 === y1 && x2 === y2) ? x : calcBezier(getTforX(x), y1, y2)
}
