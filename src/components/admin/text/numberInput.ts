export function parseSoNhap(
  raw: string,
  min: number,
  max: number,
): number | null {
  const daCat = raw.trim()
  if (daCat === '' || daCat === '-' || daCat === '.') return null

  const giaTri = Number(daCat)
  if (!Number.isFinite(giaTri) || giaTri < min || giaTri > max) return null
  return giaTri
}
