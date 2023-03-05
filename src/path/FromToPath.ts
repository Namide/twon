import { type FromToRawPath, type PathType } from "../types.js"
import { cleanPathNumber } from "./pathHelper.js"

/**
 * Path with only 2 values
 */
export function FromToPath (path: FromToRawPath): PathType {

  const { path: [from, to], wasNumberList } = cleanPathNumber(path)

  const getPath = (x: number) => {
    if (x <= 0) {
      return from
    }

    if (x >= 1) {
      return to
    }

    const value: number[] = []
    for (let i = 0; i < from.length; i++) {
      const first = from[i]
      const last = to[i]
      value.push(x * (last - first) + first)
    }
    return value
  }

  getPath.distance = -1
  getPath.wasNumberList = wasNumberList

  return getPath
}
