import type { SectionId, SectionRef } from './types'

/**
 * Trộn thứ tự phần của theme với ghi đè của từng thiệp.
 * Thiệp có danh sách riêng thì danh sách đó thắng hoàn toàn.
 */
export function resolveSections(
  thuTuTheme: SectionRef[],
  thuTuThiep: SectionRef[],
): SectionId[] {
  const nguon = thuTuThiep.length > 0 ? thuTuThiep : thuTuTheme
  const daThay = new Set<SectionId>()
  const ketQua: SectionId[] = []

  for (const ref of nguon) {
    if (ref.enabled === false) continue
    if (daThay.has(ref.id)) continue
    daThay.add(ref.id)
    ketQua.push(ref.id)
  }

  return ketQua
}
