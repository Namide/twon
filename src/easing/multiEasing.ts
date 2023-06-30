import type { MultiEasing } from '../types.js'

export const multiEasing: MultiEasing = (...list) => {

  let progressTime = 0
  let progressValue = 0
  const clean = list.map(data => data instanceof Function ? { time: 1, ease: data, value: 1 } : { time: data.time ?? 1, value: (data.value ?? data.time ?? 1), ease: data.ease })

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

  console.log(all, clean, totalValue)

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
