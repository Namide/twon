export function smoothPath (path: number[][], { step = 1, keepStart = false, keepEnd = false, loop = false } = {}): number[][] {
  const newPath: number[][] = keepStart ? [path[0]] : []

  for (let i = 0; i < path.length - (loop ? 0 : 1); i++) {
    const prev = path[i]
    const next = path[(i + 1) % path.length]
    const a: number[] = []
    const b: number[] = []
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

  return step > -1 ? smoothPath(newPath, { step: step - 1, keepStart, keepEnd, loop }) : newPath
}
