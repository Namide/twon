import { type PathType } from "../types"

export function MultiPath<ValueType extends number[]> (...paths: PathType<ValueType>[]): PathType<ValueType> {
  const distance = paths.reduce((total, path) => total + path.distance, 0)

  const getPath = (x: number) => {
    if (x <= 0) {
      return paths[0](0)
    }

    if (x >= 1) {
      return paths[paths.length - 1](1)
    }

    for (let i = 0, start = 0; i < paths.length; i++) {
      const current = paths[i].distance / distance
      if (x > start + current) {
        const v = (x - start) / current
        return paths[i](v)
      }
      start += current
    }

    return paths[0](0)
  }

  getPath.distance = distance

  return getPath
}