export function sec_to_hms(sec: number) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${h.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })}:${m.toLocaleString('en-US', {
    minimumIntegerDigits: 2,
  })}:${s.toLocaleString('en-US', { minimumIntegerDigits: 2 })}`
}
