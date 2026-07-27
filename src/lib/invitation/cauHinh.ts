import { invitationSchema } from './schema'
import type { Invitation } from './types'

/** Tăng số này khi cấu trúc Invitation đổi kiểu không đọc ngược được. */
export const PHIEN_BAN_CAU_HINH = 1

export interface GoiCauHinh {
  phienBan: number
  xuatLuc: string
  slug: string
  thiep: Invitation
}

export function taoGoiCauHinh(thiep: Invitation, xuatLuc: Date): GoiCauHinh {
  return {
    phienBan: PHIEN_BAN_CAU_HINH,
    xuatLuc: xuatLuc.toISOString(),
    slug: thiep.slug,
    thiep,
  }
}

export function tenTepCauHinh(slug: string, xuatLuc: Date): string {
  return `${slug}-cau-hinh-${xuatLuc.toISOString().slice(0, 10)}.json`
}

/**
 * Đọc gói cấu hình đã xuất, trả về thiệp để nạp vào trình sửa.
 *
 * Slug luôn bị ép về thiệp đang mở: nhập nhầm tệp của đám cưới khác thì chỉ
 * mang nội dung sang, không bao giờ ghi đè nhầm sang thiệp khác.
 */
export function docGoiCauHinh(duLieu: unknown, slugDangMo: string): Invitation {
  if (typeof duLieu !== 'object' || duLieu === null) {
    throw new Error('Tệp không phải cấu hình thiệp hợp lệ')
  }

  const goi = duLieu as Partial<GoiCauHinh>

  if (typeof goi.phienBan !== 'number' || !goi.thiep) {
    throw new Error('Tệp không phải cấu hình thiệp hợp lệ')
  }
  if (goi.phienBan > PHIEN_BAN_CAU_HINH) {
    throw new Error(
      `Tệp thuộc phiên bản ${goi.phienBan}, mới hơn phiên bản ${PHIEN_BAN_CAU_HINH} mà bản này đọc được`,
    )
  }

  const kiemTra = invitationSchema.safeParse({ ...goi.thiep, slug: slugDangMo })
  if (!kiemTra.success) {
    throw new Error(`Nội dung không hợp lệ: ${kiemTra.error.issues[0]?.message ?? 'không rõ'}`)
  }

  return kiemTra.data
}
