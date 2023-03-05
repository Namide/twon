import { type PathType } from "../types.js"

export function MultiPath (...paths: PathType[]): PathType {
  const distance = paths.reduce((total, path) => total + path.distance, 0)

  const getPath = (progress: number) => {
    if (progress <= 0) {
      return paths[0](0)
    }

    if (progress >= 1) {
      return paths[paths.length - 1](1)
    }

    for (let i = 0, start = 0; i < paths.length; i++) {
      const current = paths[i].distance / distance
      if (progress > start + current) {
        const v = (progress - start) / current
        return paths[i](v)
      }
      start += current
    }

    return paths[0](0)
  }

  getPath.distance = distance
  getPath.wasNumberList = paths[0].wasNumberList

  return getPath
}