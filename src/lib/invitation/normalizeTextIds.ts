import type { Invitation } from './types'

export function damBaoIdVungChu(
  thiep: Invitation,
  taoId: () => string = () => crypto.randomUUID(),
): Invitation {
  return {
    ...thiep,
    suKien: thiep.suKien.map((item) => (item.id ? item : { ...item, id: taoId() })),
    chuyenChungMinh: thiep.chuyenChungMinh.map((item) =>
      item.id ? item : { ...item, id: taoId() },
    ),
  }
}
