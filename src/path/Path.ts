import type { PathType } from "../types.js"
import { cleanPathNumber } from "./pathHelper.js"

function _lerpUnit (from: number[], to: number[], t: number) {
  const values: number[] = []
  for (let i = 0; i < from.length; i++) {
    values.push((to[i] - from[i]) * t + from[i])
  }
  return values
}

function _getDistances(path: number[][]) {
  const distances: number[] = []
  let distance = 0

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const next = path[i]

    let dist = 0
    for (let unit = 0; unit < prev.length; unit++) {
      dist += (next[unit] - prev[unit]) ** 2 
    }
    dist = Math.sqrt(dist)

    distance += dist
    distances.push(dist)
  }

  return {
    distance,
    distances: distances.map(dist => dist / distance)
  }
}

export function Path (path: number[][], { loop = false } = {}): PathType {

  const { path: newPath, wasNumberList } = cleanPathNumber(loop ? [...path, path[0]] : path)
  const { distances, distance } = _getDistances(newPath)

  const getPath = (progress: number) => {
    if (progress <= 0) {
      return newPath[0]
    }

    if (progress >= 1) {
      return newPath[newPath.length - 1]
    }

    for (let i = 0, start = 0; i < distances.length; i++) {
      const current = distances[i]
      if (progress < start + current) {
        const v = (progress - start) / current
        return _lerpUnit(newPath[i], newPath[i + 1], v)
      }
      start += current
    }

    return newPath[0]
  }

  getPath.distance = distance
  getPath.wasNumberList = wasNumberList

  return getPath
}
