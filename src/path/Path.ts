import { type PathType } from "../types"

function _lerpUnit<Units extends number[]> (from: Units, to: Units, t: number) {
  const values = [] as unknown as Units
  for (let i = 0; i < from.length; i++) {
    values.push((to[i] - from[i]) * t + from[i])
  }
  return values
}

function _getDistances<Units extends number[]> (path: Units[]) {
  const distances: number[] = []
  const distance = 0

  for (let i = 1; i < path.length; i++) {
    const prev = path[i - 1]
    const next = path[i]

    let distance = 0
    for (let unit = 0; unit < prev.length; unit++) {
      distance += (next[unit] - prev[unit]) ** 2 
    }
    distance = Math.sqrt(distance)

    distance += distance
    distances.push(distance)
  }

  return {
    distance,
    distances: distances.map(dist => dist / distance)
  }
}

export function Path<Units extends number[]> (path: Units[]): PathType<Units> {
  const { distances, distance } = _getDistances(path)

  const getPath = (x: number) => {
    if (x <= 0) {
      return path[0]
    }

    if (x >= 1) {
      return path[path.length - 1]
    }

    for (let i = 0, start = 0; i < distances.length; i++) {
      const current = distances[i]
      if (x > start + current) {
        const v = (x - start) / current
        return _lerpUnit(path[i], path[i + 1], v)
      }
      start += current
    }

    return path[0]
  }

  getPath.distance = distance

  return getPath
}
