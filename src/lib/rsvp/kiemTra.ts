import type { Invitation } from '@/lib/invitation/types'
import { rsvpDauVaoSchema, type RsvpDauVao } from './types'

const MAC_DINH = ['hoTen', 'ben', 'quanHe', 'ngayAn'] as const
const LOI_THIEU: Record<string, string> = {
  hoTen: 'Vui lòng nhập họ tên',
  ben: 'Vui lòng chọn bạn là khách của bên nào',
  quanHe: 'Vui lòng cho biết quan hệ với cô dâu chú rể',
  phuongTien: 'Vui lòng chọn phương tiện di chuyển',
  ngayAn: 'Vui lòng chọn ngày đến dự',
  loiChuc: 'Vui lòng nhập lời chúc',
}

export function kiemTraRsvp(
  body: unknown,
  thiep: Invitation,
): { success: true; data: RsvpDauVao } | { success: false; loi: string } {
  const ketQua = rsvpDauVaoSchema.safeParse(body)
  if (!ketQua.success) {
    return { success: false, loi: ketQua.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' }
  }

  const cauHinh = thiep.cauHinhRsvp
  const truongChuan = cauHinh?.truongChuan ?? [...MAC_DINH]
  for (const id of truongChuan) {
    if (!ketQua.data[id]?.trim()) return { success: false, loi: LOI_THIEU[id] }
  }

  const idHopLe = new Set((cauHinh?.truongTuyChinh ?? []).map((t) => t.id))
  ketQua.data.tuyChinh = Object.fromEntries(
    Object.entries(ketQua.data.tuyChinh).filter(([id]) => idHopLe.has(id)),
  )
  for (const truong of cauHinh?.truongTuyChinh ?? []) {
    const giaTri = ketQua.data.tuyChinh[truong.id] ?? ''
    if (truong.batBuoc && !giaTri) {
      return { success: false, loi: `Vui lòng nhập ${truong.nhan.toLowerCase()}` }
    }
    if (truong.kieu === 'select' && giaTri && !truong.luaChon?.includes(giaTri)) {
      return { success: false, loi: `${truong.nhan} không hợp lệ` }
    }
  }
  return { success: true, data: ketQua.data }
}
