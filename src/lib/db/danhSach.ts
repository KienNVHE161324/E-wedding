import { taoSupabase } from './client'
import type { Invitation } from '@/lib/invitation/types'
import type { ThiepTomTat } from '@/lib/vongDoi/types'
import { tinhTrangThai } from '@/lib/vongDoi/tinhTrangThai'

interface DongDb {
  id: string
  public_slug: string | null
  theme_id: string
  noi_dung: Invitation
  spreadsheet_id: string | null
  trang_thai: 'nhap' | 'da-xuat-ban' | 'da-huy'
  ngay_xuat_ban: string | null
  ngay_dong: string | null
}

export async function layDanhSachThiep(bayGio: Date): Promise<ThiepTomTat[]> {
  const supabase = taoSupabase()
  const { data, error } = await supabase
    .from('invitations')
    .select(
      'id, public_slug, theme_id, noi_dung, spreadsheet_id, trang_thai, ngay_xuat_ban, ngay_dong',
    )
    .order('updated_at', { ascending: false })
  if (error) throw error

  const { data: dem, error: loiDem } = await supabase.from('rsvps').select('invitation_id')
  if (loiDem) throw loiDem

  const soLuot = new Map<string, number>()
  for (const r of dem as { invitation_id: string }[]) {
    soLuot.set(r.invitation_id, (soLuot.get(r.invitation_id) ?? 0) + 1)
  }

  return (data as DongDb[]).map((d) => ({
    id: d.id,
    publicSlug: d.public_slug,
    tenChuRe: d.noi_dung.chuRe.ten,
    tenCoDau: d.noi_dung.coDau.ten,
    ngayCuoi: d.noi_dung.ngayCuoi,
    themeId: d.theme_id,
    trangThai: tinhTrangThai(
      {
        trangThaiLuu: d.trang_thai,
        ngayXuatBan: d.ngay_xuat_ban,
        ngayDong: d.ngay_dong,
      },
      bayGio,
    ),
    ngayXuatBan: d.ngay_xuat_ban,
    ngayDong: d.ngay_dong,
    soLuotXacNhan: soLuot.get(d.id) ?? 0,
    spreadsheetId: d.spreadsheet_id,
  }))
}
