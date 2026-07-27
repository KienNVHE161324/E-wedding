import { z } from 'zod'
import type { Invitation } from './types'

const anhSchema = z.object({
  url: z.string().min(1),
  moTa: z.string(),
})

const maMauSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải ở dạng #RRGGBB')

const dressCodeSchema = z.object({
  moTa: z.string(),
  mauSac: z.array(maMauSchema),
})

const nguoiCuoiSchema = z.object({
  ten: z.string().min(1),
  anh: anhSchema.optional(),
  gioiThieu: z.string().optional(),
  tenBo: z.string().optional(),
  tenMe: z.string().optional(),
  lienKetMangXaHoi: z.string().optional(),
})

export const sectionIdSchema = z.enum([
  'bia',
  'dem-nguoc',
  'co-dau-chu-re',
  'chuyen-chung-minh',
  'album',
  'su-kien',
  'dress-code',
  'rsvp',
  'mung-cuoi',
  'so-luu-but',
])

export const sectionRefSchema = z.object({
  id: sectionIdSchema,
  enabled: z.boolean().optional(),
})

export const slotHoaTietSchema = z.enum([
  'cover-frame',
  'section-header',
  'section-hero',
  'section-footer',
  'divider',
  'vertical-divider',
  'corner',
  'watermark',
  'seal',
])

export const tuyChinhGiaoDienSchema = z.object({
  mauChinh: z.string().optional(),
  mauNen: z.string().optional(),
  mauPhu: z.string().optional(),
  // partialRecord: khóa enum nhưng không bắt buộc có đủ mọi slot.
  doDam: z.partialRecord(slotHoaTietSchema, z.number().min(0).max(1)).optional(),
})

export const viTriChiTietSchema = z.enum(['tren', 'duoi', 'trai', 'phai', 'nen'])

export const chiTietTrangTriSchema = z.object({
  id: z.string().min(1),
  section: sectionIdSchema,
  viTri: viTriChiTietSchema,
  mau: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải ở dạng #RRGGBB'),
  doDam: z.number().min(0).max(1),
  kichThuoc: z.number().min(5).max(100),
})

export const invitationSchema: z.ZodType<Invitation> = z.object({
  slug: z.string().min(1),
  themeId: z.string().min(1),
  sections: z.array(sectionRefSchema),
  chuRe: nguoiCuoiSchema,
  coDau: nguoiCuoiSchema,
  ngayCuoi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày cưới phải theo dạng YYYY-MM-DD'),
  nhac: z.object({ url: z.string().min(1), ten: z.string() }).optional(),
  chuyenChungMinh: z.array(
    z.object({ anh: anhSchema, tieuDe: z.string(), noiDung: z.string() }),
  ),
  album: z.array(anhSchema),
  suKien: z.array(
    z.object({
      ngay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo dạng YYYY-MM-DD'),
      gio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải theo dạng HH:mm'),
      ten: z.string(),
      diaDiem: z.string(),
      diaChi: z.string(),
      banDoAnh: anhSchema.optional(),
      linkChiDuong: z.string().optional(),
    }),
  ),
  dressCode: dressCodeSchema.optional(),
  mungCuoiKieuHopQua: z.boolean().optional(),
  mungCuoi: z.array(
    z.object({
      ben: z.enum(['nha-trai', 'nha-gai']),
      chuTaiKhoan: z.string(),
      soTaiKhoan: z.string(),
      nganHang: z.string(),
      qrAnh: anhSchema.optional(),
    }),
  ),
  tuyChinhGiaoDien: tuyChinhGiaoDienSchema.optional(),
  chiTietTrangTri: z.array(chiTietTrangTriSchema).optional(),
})
