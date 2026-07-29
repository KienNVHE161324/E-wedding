import { z } from 'zod'
import type { Invitation } from './types'
import { FONT_CHU } from './textTypes'
import {
  laNoiDungVungChuBatBuoc,
  lietKeVungChu,
} from './textRegions'
import { KIEU_KHUNG_QR } from '@/lib/qr/types'

const anhSchema = z.object({
  url: z.string().min(1),
  moTa: z.string(),
})

const maMauSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải ở dạng #RRGGBB')
const tuyChinhVungChuSchema = z.object({
  noiDung: z.string().max(500).optional(),
  font: z.enum(FONT_CHU).optional(),
  coChu: z.number().min(8).max(120).optional(),
  mauChu: maMauSchema.optional(),
  x: z.number().min(-100).max(100).optional(),
  y: z.number().min(-100).max(100).optional(),
})

const tuyChinhChuSchema = z
  .record(z.string().min(1), tuyChinhVungChuSchema)
  .refine((v) => Object.keys(v).length <= 250, 'Tối đa 250 vùng chữ')

const kieuKhungQrSchema = z.enum(KIEU_KHUNG_QR)
const tuyChinhQrSchema = z.object({
  kieuKhung: kieuKhungQrSchema.optional(),
  mauQr: maMauSchema.optional(),
  mauNen: maMauSchema.optional(),
})

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
  hoaTiet: z
    .partialRecord(
      z.enum(['watermark', 'corner']),
      z.object({
        id: z.string().min(1).optional(),
        x: z.number().min(0).max(100).optional(),
        y: z.number().min(0).max(100).optional(),
        kichThuoc: z.number().min(5).max(100).optional(),
        gocXoay: z.number().min(-180).max(180).optional(),
        mau: maMauSchema.optional(),
        doDam: z.number().min(0).max(1).optional(),
        raSauChu: z.boolean().optional(),
        an: z.boolean().optional(),
      }),
    )
    .optional(),
})

export const chiTietTrangTriSchema = z.object({
  id: z.string().min(1),
  section: sectionIdSchema,
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  mau: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Màu phải ở dạng #RRGGBB'),
  doDam: z.number().min(0).max(1),
  kichThuoc: z.number().min(5).max(100),
  gocXoay: z.number().min(-180).max(180).optional(),
  raSauChu: z.boolean().optional(),
  chu: z
    .object({
      noiDung: z.string().max(500),
      font: z.enum(FONT_CHU),
      coChu: z.number().int().min(12).max(72),
      mauChu: maMauSchema,
      canLe: z.enum(['left', 'center', 'right']),
    })
    .optional(),
})

const truongRsvpChuanSchema = z.enum([
  'hoTen',
  'ben',
  'quanHe',
  'phuongTien',
  'ngayAn',
  'loiChuc',
])

export const cauHinhRsvpSchema = z.object({
  truongChuan: z.array(truongRsvpChuanSchema),
  truongTuyChinh: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/, 'Mã trường chỉ gồm chữ thường, số và dấu gạch ngang'),
      nhan: z.string().trim().min(1, 'Tên trường không được để trống'),
      kieu: z.enum(['text', 'textarea', 'select']),
      batBuoc: z.boolean().optional(),
      luaChon: z.array(z.string().trim().min(1)).optional(),
    }).refine((t) => t.kieu !== 'select' || (t.luaChon?.length ?? 0) > 0, {
      message: 'Trường lựa chọn phải có ít nhất một phương án',
    }),
  ).optional(),
}).refine((c) => new Set(c.truongChuan).size === c.truongChuan.length, {
  message: 'Không được lặp trường RSVP',
})

export const invitationSchema: z.ZodType<Invitation> = z.object({
  slug: z.string().min(1),
  themeId: z.string().min(1),
  kieuKhungQr: kieuKhungQrSchema.optional(),
  sections: z.array(sectionRefSchema),
  chuRe: nguoiCuoiSchema,
  coDau: nguoiCuoiSchema,
  ngayCuoi: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày cưới phải theo dạng YYYY-MM-DD'),
  ngayPhu: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày đầu phải theo dạng YYYY-MM-DD')
    .optional(),
  nhac: z
    .object({
      url: z.string().min(1),
      ten: z.string(),
      batDau: z.number().finite().nonnegative().optional(),
      thoiLuong: z.union([z.literal(30), z.literal(60)]).optional(),
    })
    .optional(),
  chuyenChungMinh: z.array(
    z.object({ id: z.string().uuid().optional(), anh: anhSchema, tieuDe: z.string(), noiDung: z.string() }),
  ),
  album: z.array(anhSchema),
  suKien: z.array(
    z.object({
      id: z.string().uuid().optional(),
      ngay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo dạng YYYY-MM-DD'),
      gio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Giờ phải theo dạng HH:mm'),
      ten: z.string(),
      diaDiem: z.string().optional(),
      banDoAnh: anhSchema.optional(),
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
      tuyChinhQr: tuyChinhQrSchema.optional(),
    }),
  ),
  tuyChinhGiaoDien: tuyChinhGiaoDienSchema.optional(),
  tuyChinhChu: tuyChinhChuSchema.optional(),
  chiTietTrangTri: z.array(chiTietTrangTriSchema).optional(),
  cauHinhRsvp: cauHinhRsvpSchema.optional(),
}).superRefine((thiep, ctx) => {
  for (const moTa of lietKeVungChu(thiep)) {
    if (!laNoiDungVungChuBatBuoc(moTa)) continue
    const noiDung = thiep.tuyChinhChu?.[moTa.id]?.noiDung
    if (noiDung === undefined || noiDung.trim().length > 0) continue

    ctx.addIssue({
      code: 'custom',
      message: 'Nội dung tiêu đề hoặc nút không được để trống',
      path: ['tuyChinhChu', moTa.id, 'noiDung'],
    })
  }
})
