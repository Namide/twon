type Units = number[]

export class Path {
  public path: Units[]
  public distance: number = 0
  private _distances: number[] = []

  constructor (path: Units[]) {
    this.path = path
    this._updateDistances()
  }

  _updateDistances () {
    this._distances = []
    this.distance = 0

    for (let i = 1; i < this.path.length; i++) {
      const prev = this.path[i - 1]
      const next = this.path[i]
      let distance = 0
      for (let unit = 0; unit < prev.length; unit++) {
        distance += (next[unit] - prev[unit]) ** 2 
      }
      distance = Math.sqrt(distance)
      this.distance += distance
      this._distances.push(distance)
    }

    this._distances = this._distances.map(dist => dist / this.distance)
  }

  getValue (t: number) {
    return 1
  }

  smooth({ step = 1, keepStart = false, keepEnd = false, loop = false } = {}) {
    this.path = _smoothPath(this.path, { step, keepStart, keepEnd, loop })
    this._updateDistances()
  }

}

export function _smoothPath (path: number[][], { step, keepStart, keepEnd, loop }): number[][] {
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

  return step > -1 ? _smoothPath(newPath, { step: step - 1, keepStart, keepEnd, loop }) : newPath
}
