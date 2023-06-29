import type { MultiEasing } from '../types.js'

export const multiEasing: MultiEasing = (...list) => {

  let total = 0
  const length = list.reduce((total, data) => total + (data.weight ?? 1), 0)
  const all = list.map(({ ease, weight }) => {
    total += weight ?? 1
    return {
      progress: total / length,
      ease
    }
  })

  return (progress: number) => {
    if (progress < 0) return 0
    if (progress > 1) return 1

    const currentIndex = all.findIndex(item => progress <= item.progress)
    const min = currentIndex > 0 ? all[currentIndex - 1].progress : 0
    const max = all[currentIndex].progress

    return all[currentIndex].ease((progress - min) / (max - min)) * (max - min) + min
  }
}