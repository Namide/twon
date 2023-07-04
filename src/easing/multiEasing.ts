import type { MultiEasing } from '../types.js'

export const multiEasing: MultiEasing = (...list) => {

  let progressTime = 0
  let progressValue = 0
  const clean = list.map(data => data instanceof Function ? { time: 1, ease: data, value: 1 } : { time: data.time ?? 1, value: (data.value ?? data.time ?? 1), ease: data.ease })

  if (__DEV__) {
    clean.forEach((data) => {
      if (!(data.ease instanceof Function)) {
        console.warn(`"ease" of multiEasing need to be an Easing function, example: "[{ ease: EaseInExpo, time: 3, value: 2 }, { ease: cubicBezier(0.25, 0, 0.3, 1), time: 2 }, { ease: EaseOutExpo, value: 4 }]", and not a ${typeof data.ease}: ${ JSON.stringify(list) }`)
      }

      if (isNaN(data.time)) {
        console.warn(`"time" of multiEasing need to be a Number, example: "[{ ease: EaseInExpo, time: 3, value: 2 }, { ease: cubicBezier(0.25, 0, 0.3, 1), time: 2 }, { ease: EaseOutExpo, value: 4 }]", and not ${data.time}: ${ JSON.stringify(list) }`)
      }

      if (isNaN(data.value)) {
        console.warn(`"value" of multiEasing need to be a Number, example: "[{ ease: EaseInExpo, time: 3, value: 2 }, { ease: cubicBezier(0.25, 0, 0.3, 1), time: 2 }, { ease: EaseOutExpo, value: 4 }]", and not ${data.value}: ${ JSON.stringify(list) }`)
      }

      if (data.time <= 0 || data.time === Infinity) {
        console.warn(`"time" of multiEasing need to > 0 and < Infinity, example: "[{ ease: EaseInExpo, time: 3, value: 2 }, { ease: cubicBezier(0.25, 0, 0.3, 1), time: 2 }, { ease: EaseOutExpo, value: 4 }]", and not ${data.time}: ${ JSON.stringify(list) }`)
      }

      if (data.value <= 0 || data.value === Infinity) {
        console.warn(`"value" of multiEasing need to > 0 and < Infinity, example: "[{ ease: EaseInExpo, time: 3, value: 2 }, { ease: cubicBezier(0.25, 0, 0.3, 1), time: 2 }, { ease: EaseOutExpo, value: 4 }]", and not ${data.value}: ${ JSON.stringify(list) }`)
      }
    })
  }

  const totalTime = clean.reduce((total, data) => total + data.time, 0)
  const totalValue = clean.reduce((total, data) => total + data.value, 0)
  const all = clean.map(({ ease, time, value }) => {
    progressTime += time
    progressValue += value
    return {
      progress: progressTime / totalTime,
      value: progressValue / totalValue,
      ease
    }
  })

  return (progress: number) => {
    if (progress < 0) return 0
    if (progress > 1) return 1

    const currentIndex = all.findIndex(item => progress <= item.progress)
    const minTime = currentIndex > 0 ? all[currentIndex - 1].progress : 0
    const maxTime = all[currentIndex].progress
    const minValue = currentIndex > 0 ? all[currentIndex - 1].value : 0
    const maxValue = all[currentIndex].value

    return all[currentIndex].ease((progress - minTime) / (maxTime - minTime)) * (maxValue - minValue) + minValue
  }
}
