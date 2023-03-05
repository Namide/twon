export function cleanPathNumber (path: number[] | number[][]): { path: number[][], wasNumberList: boolean } {
  const wasNumberList = !Array.isArray(path[0])
  return {
    wasNumberList,
    path: wasNumberList ? (path as number[]).map(val => [val]) : (path as number[][])
  }
}