export type DisplayParams = {
  horizontal: number
  vertical: number
  diagonal: number
}

const displayParamsPattern = /horizontal=(\d+)\/vertical=(\d+)\/diagonal=([0-9.]+)/

export const parseDisplayParams = (search: string): DisplayParams | null => {
  const match = decodeURIComponent(search).match(displayParamsPattern)

  if (!match) {
    return null
  }

  const [, horizontal, vertical, diagonal] = match
  const displayParams = {
    horizontal: Number(horizontal),
    vertical: Number(vertical),
    diagonal: Number(diagonal),
  }

  return Object.values(displayParams).every(Number.isFinite) ? displayParams : null
}
