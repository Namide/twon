import { type PathType } from "../types"
import { Path } from "./Path"

function _smoothPath (path: number[][], { step, keepStart, keepEnd, loop }): number[][] {
  if (step < 1) {
    return path
  }
  
  const newPath: number[][] = keepStart && !loop ? [path[0]] : []

  for (let i = 0; i < path.length - (loop ? 0 : 1); i++) {
    const prev = path[i]
    const next = path[(i + 1) % path.length]
    const a = [] as number[]
    const b = [] as number[]
    for (let unit = 0; unit < prev.length; unit++) {
      const from = prev[unit]
      const to = next[unit]
      a.push((to - from) * 0.28 + from)
      b.push((to - from) * 0.72 + from)
    }
    newPath.push(a, b)
  }

  if (keepEnd && !loop) {
    newPath.push(path[path.length - 1])
  }

  return _smoothPath(newPath, { step: step - 1, keepStart, keepEnd, loop })
}

export function SmoothPath<ValueType extends number[]> (path: ValueType[], { step = 1, keepStart = true, keepEnd = true, loop = false } = {}): PathType {
  return Path(_smoothPath(path, { step, keepStart, keepEnd, loop }), { loop })
}
