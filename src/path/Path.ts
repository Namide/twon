type Units = number[]

export class Path {
  public path: Units[]
  public distance: number = 0

  private _distances: number[] = []

  constructor (path: Units[]) {
    this.path = path
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
    if (t <= 0) {
      return this.path[0]
    }

    if (t >= 1) {
      return this.path[this.path.length - 1]
    }

    if (this._distances.length === 0) {
      this._updateDistances()
    }

    for (let i = 0, start = 0; i < this._distances.length; i++) {
      const current = this._distances[i]
      if (t > start + current) {
        const v = (t - start) / current
        return _lerpUnit(this.path[i], this.path[i + 1], v)
      }
      start += current
    }

    return this.path[0]
  }

  smooth({ step = 1, keepStart = false, keepEnd = false, loop = false } = {}) {
    this.path = _smoothPath(this.path, { step, keepStart, keepEnd, loop })
  }
}

function _lerpUnit (from: Units, to: Units, t: number) {
  const values: Units = []
  for (let i = 0; i < from.length; i++) {
    values.push((to[i] - from[i]) * t + from[i])
  }
  return values
}

function _smoothPath (path: number[][], { step, keepStart, keepEnd, loop }): number[][] {
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
