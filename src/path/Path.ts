import { type PathType } from "../types"

function _lerpUnit<ValueType extends number[]> (from: ValueType, to: ValueType, t: number) {
  const values = [] as unknown as ValueType
  for (let i = 0; i < from.length; i++) {
    values.push((to[i] - from[i]) * t + from[i])
  }
  return values
}

function _getDistances<ValueType extends number[]> (path: ValueType[]) {
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

export function Path<ValueType extends number[]> (path: ValueType[], { loop = false } = {}): PathType<ValueType> {
  const newPath = loop ? [...path, path[0]] : path
  
  const { distances, distance } = _getDistances(newPath)

  const getPath = (x: number) => {
    if (x <= 0) {
      return newPath[0]
    }

    if (x >= 1) {
      return newPath[newPath.length - 1]
    }

    for (let i = 0, start = 0; i < distances.length; i++) {
      const current = distances[i]
      if (x < start + current) {
        const v = (x - start) / current
        return _lerpUnit(newPath[i], newPath[i + 1], v)
      }
      start += current
    }

    return newPath[0]
  }

  getPath.distance = distance

  return getPath
}
