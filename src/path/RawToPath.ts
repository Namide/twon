import { type  PathType, type TweenPathInput } from "../types";
import { FromToPath } from "./FromToPath";
import { Path } from "./Path";

export function RawToPath<ValueType extends number[] | number>(rawPath: TweenPathInput<ValueType>) {

  // Is an array
  if (Array.isArray(rawPath)) {

    // From-to path
    if (rawPath.length = 2) {
      if (Array.isArray(rawPath[0])) {
        return FromToPath(rawPath as [number[], number[]])
      } else {
        const [from, to] = rawPath as [number, number]
        const path = FromToPath([[from], [to]])
        path.wasNumberList = true
        return path
      }

    // Multi values path
    } else {

      if (Array.isArray(rawPath[0])) {
        return Path(rawPath as number[][])
      } else {
        const path = Path((rawPath as number[]).map(val => [val]))
        path.wasNumberList = true
        return path
      }
    }
  }

  return rawPath as PathType
}