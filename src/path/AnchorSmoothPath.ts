import { type PathType } from "../types.js"
import { ErodeSmoothPath } from "./ErodeSmoothPath.js"

const POWER = 0.275

function _getDistances(p1: number[], p0: number[] = []) {

    let distance = 0
    for (let i = 0; i < p1.length; i++) {
        distance += (p1[i] - (p0[i] ?? 0)) ** 2 
    }
    distance = Math.sqrt(distance)  

    return distance
}

export function AnchorSmoothPath (path: number[][], { step = 1, keepStart = true, keepEnd = true, loop = false } = {}): PathType {
  
  if (step < 1) {
    return ErodeSmoothPath(path, { step, keepStart, keepEnd, loop })
  }

  const newPath: number[][] = !loop ? [path[0]] : []

  for (let i = (loop ? 0 : 1); i < path.length - (loop ? 0 : 1); i++) {
    const prev = path[(i + path.length - 1) % path.length]
    const current = path[i]
    const next = path[(i + 1) % path.length]

    const length = Math.min(_getDistances(prev, current), _getDistances(next, current)) * POWER

    let nextVector = prev.map((pr, i) => next[i] - pr)
    const vectorLength = _getDistances(nextVector)
    nextVector = nextVector.map(unit => unit * length / vectorLength)

    newPath.push(
      current.map((curr, i) => curr - nextVector[i]),
      current.map((curr, i) => curr + nextVector[i]),
    )
  }

  if (!loop) {
    newPath.push(path[path.length - 1])
  }

  return ErodeSmoothPath(newPath, { step: step - 1, keepStart, keepEnd, loop })
}