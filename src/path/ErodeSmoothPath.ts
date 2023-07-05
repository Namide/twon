import type { PathType, SmoothPathOptions } from '../types.js'
import { Path } from './Path.js'

const POWER = 0.275

function _smoothPath (path: number[][], { step, keepStart, keepEnd, loop }: { step: number, keepStart: boolean, keepEnd: boolean, loop: boolean }): number[][] {
  if (step < 1) {
    return path
  }

  const newPath: number[][] = keepStart && !loop ? [path[0]] : []

  for (let i = 0; i < path.length - (loop ? 0 : 1); i++) {
    const prev = path[i]
    const next = path[(i + 1) % path.length]
    const a: number[] = []
    const b: number[] = []
    for (let unit = 0; unit < prev.length; unit++) {
      const from = prev[unit]
      const to = next[unit]
      a.push((to - from) * POWER + from)
      b.push((to - from) * (1 - POWER) + from)
    }
    newPath.push(a, b)
  }

  if (keepEnd && !loop) {
    newPath.push(path[path.length - 1])
  }

  return _smoothPath(newPath, { step: step - 1, keepStart, keepEnd, loop })
}

export function ErodeSmoothPath<ValueType extends number[]> (path: ValueType[], { step = 3, keepStart = true, keepEnd = true, loop = false }: SmoothPathOptions = {}): PathType {
  return Path(_smoothPath(path, { step, keepStart, keepEnd, loop }), { loop })
}
