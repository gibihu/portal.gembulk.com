export function formatNumberShort(value: number): string {
  if (value >= 1_000_000) {
    const v = value / 1_000_000
    return v % 1 === 0 ? `${v}M` : `${v.toFixed(1)}M`
  }

  if (value >= 10_000) {
    const v = value / 1_000
    return v % 1 === 0 ? `${v}k` : `${v.toFixed(1)}k`
  }

  if (value >= 1_000) {
    return value.toLocaleString('en-US')
  }

  return value.toString()
}
