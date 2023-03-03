import { type PathType } from "../types"
import { Path } from "./Path"

function _smoothPath<Units extends number[]> (path: Units[], { step, keepStart, keepEnd, loop }): Units[] {
  const newPath: Units[] = keepStart ? [path[0]] : []

  for (let i = 0; i < path.length - (loop ? 0 : 1); i++) {
    const prev = path[i]
    const next = path[(i + 1) % path.length]
    const a = [] as unknown as Units
    const b = [] as unknown as Units
    for (let unit = 0; unit < prev.length; unit++) {
      const from = prev[unit]
      const to = next[unit]
      a.push((to - from) * 0.25 + from)
      b.push((to - from) * 0.75 + from)
    }
    newPath.push(a, b)
  }

  if (keepEnd) {
    newPath.push(path[path.length - 1])
  }

  return step > -1 ? _smoothPath(newPath, { step: step - 1, keepStart, keepEnd, loop }) : newPath
}

export function SmoothPath<Units extends number[]> (path: Units[], { step = 1, keepStart = true, keepEnd = true, loop = false } = {}): PathType<Units> {
  return Path<Units>(_smoothPath(path, { step, keepStart, keepEnd, loop }))
}
