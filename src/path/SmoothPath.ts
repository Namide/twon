import { type PathType } from "../types"
import { Path } from "./Path"

function _smoothPath<Units extends number[]> (path: Units[], { step, keepStart, keepEnd, loop }): Units[] {
  if (step < 1) {
    return path
  }
  
  const newPath: Units[] = keepStart && !loop ? [path[0]] : []

  for (let i = 0; i < path.length - (loop ? 0 : 1); i++) {
    const prev = path[i]
    const next = path[(i + 1) % path.length]
    const a = [] as unknown as Units
    const b = [] as unknown as Units
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

export function SmoothPath<Units extends number[]> (path: Units[], { step = 1, keepStart = true, keepEnd = true, loop = false } = {}): PathType<Units> {
  return Path<Units>(_smoothPath(path, { step, keepStart, keepEnd, loop }), { loop })
}
