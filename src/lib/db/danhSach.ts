import { taoSupabase } from './client'
import type { Invitation } from '@/lib/invitation/types'
import type { ThiepTomTat } from '@/lib/vongDoi/types'
import { tinhTrangThai, soNgayConLai } from '@/lib/vongDoi/tinhTrangThai'

interface DongDb {
  slug: string
  theme_id: string
  noi_dung: Invitation
  spreadsheet_id: string | null
  trang_thai: 'nhap' | 'da-xuat-ban'
  ngay_xuat_ban: string | null
  ngay_het_han: string | null
}

/** Danh sách đám cưới cho bảng điều khiển, kèm số lượt xác nhận của từng đơn. */
export async function layDanhSachThiep(bayGio: Date): Promise<ThiepTomTat[]> {
  const supabase = taoSupabase()

  const { data, error } = await supabase
    .from('invitations')
    .select('slug, theme_id, noi_dung, spreadsheet_id, trang_thai, ngay_xuat_ban, ngay_het_han')
    .order('updated_at', { ascending: false })
  if (error) throw error

  const { data: dem, error: loiDem } = await supabase.from('rsvps').select('slug')
  if (loiDem) throw loiDem

  const soLuot = new Map<string, number>()
  for (const r of dem as { slug: string }[]) {
    soLuot.set(r.slug, (soLuot.get(r.slug) ?? 0) + 1)
  }

  return (data as DongDb[]).map((d) => ({
    slug: d.slug,
    tenChuRe: d.noi_dung.chuRe.ten,
    tenCoDau: d.noi_dung.coDau.ten,
    ngayCuoi: d.noi_dung.ngayCuoi,
    themeId: d.theme_id,
    trangThai: tinhTrangThai(
      {
        trangThaiLuu: d.trang_thai,
        ngayXuatBan: d.ngay_xuat_ban,
        ngayHetHan: d.ngay_het_han,
      },
      bayGio,
    ),
    ngayHetHan: d.ngay_het_han,
    soNgayConLai: soNgayConLai(d.ngay_het_han, bayGio),
    soLuotXacNhan: soLuot.get(d.slug) ?? 0,
    spreadsheetId: d.spreadsheet_id,
  }))
}
