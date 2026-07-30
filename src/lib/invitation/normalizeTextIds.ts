import type { Invitation } from './types'

export function damBaoIdVungChu(
  thiep: Invitation,
  taoId?: () => string,
): Invitation {
  return {
    ...thiep,
    suKien: thiep.suKien.map((item, index) =>
      item.id ? item : { ...item, id: taoId?.() ?? `legacy-su-kien-${index}` },
    ),
    chuyenChungMinh: thiep.chuyenChungMinh.map((item, index) =>
      item.id
        ? item
        : { ...item, id: taoId?.() ?? `legacy-chuyen-chung-minh-${index}` },
    ),
  }
}
