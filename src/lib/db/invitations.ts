import { taoSupabase } from './client'
import { invitationSchema } from '@/lib/invitation/schema'
import type { Invitation } from '@/lib/invitation/types'
import type { VongDoi } from '@/lib/vongDoi/types'

export interface BanThiep {
  id: string
  publicSlug: string | null
  thiep: Invitation
  vongDoi: VongDoi
  spreadsheetId: string | null
}

interface DongThiep {
  id: string
  public_slug: string | null
  noi_dung: unknown
  trang_thai: 'nhap' | 'da-xuat-ban' | 'da-huy'
  ngay_xuat_ban: string | null
  ngay_dong: string | null
  spreadsheet_id: string | null
}

const CAC_COT =
  'id, public_slug, noi_dung, trang_thai, ngay_xuat_ban, ngay_dong, spreadsheet_id'

function sangBanThiep(data: DongThiep): BanThiep {
  return {
    id: data.id,
    publicSlug: data.public_slug,
    thiep: invitationSchema.parse(data.noi_dung),
    spreadsheetId: data.spreadsheet_id,
    vongDoi: {
      trangThaiLuu: data.trang_thai,
      ngayXuatBan: data.ngay_xuat_ban,
      ngayDong: data.ngay_dong,
    },
  }
}

export async function layThiepTheoPublicSlug(slug: string): Promise<BanThiep | null> {
  const { data, error } = await taoSupabase()
    .from('invitations')
    .select(CAC_COT)
    .eq('public_slug', slug)
    .maybeSingle()

  if (error) throw error
  return data ? sangBanThiep(data as DongThiep) : null
}

export async function layThiepTheoId(id: string): Promise<BanThiep | null> {
  const { data, error } = await taoSupabase()
    .from('invitations')
    .select(CAC_COT)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? sangBanThiep(data as DongThiep) : null
}

/** Tên tương thích tạm thời cho các caller công khai; nguồn sự thật vẫn là public_slug. */
export const layThiepTheoSlug = layThiepTheoPublicSlug

export async function taoThiepTrongDb(thiep: Invitation, nguoiTao: string): Promise<string> {
  const hopLe = invitationSchema.parse(thiep)
  const { data, error } = await taoSupabase()
    .from('invitations')
    .insert({
      public_slug: hopLe.slug,
      theme_id: hopLe.themeId,
      noi_dung: hopLe,
      nguoi_tao: nguoiTao,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Đường dẫn đã tồn tại')
    throw error
  }
  return (data as { id: string }).id
}

export async function laySlugDaCo(): Promise<string[]> {
  const { data, error } = await taoSupabase()
    .from('invitations')
    .select('public_slug')
    .not('public_slug', 'is', null)
  if (error) throw error
  return (data as { public_slug: string }[]).map((d) => d.public_slug)
}

export async function luuThiep(id: string, thiep: Invitation): Promise<void> {
  const hopLe = invitationSchema.parse(thiep)
  const { error } = await taoSupabase()
    .from('invitations')
    .update({
      theme_id: hopLe.themeId,
      noi_dung: hopLe,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) throw error
}

export async function datLich(
  id: string,
  ngayXuatBan: string,
  ngayDong: string,
): Promise<void> {
  const { error } = await taoSupabase()
    .from('invitations')
    .update({
      trang_thai: 'da-xuat-ban',
      ngay_xuat_ban: ngayXuatBan,
      ngay_dong: ngayDong,
    })
    .eq('id', id)
  if (error) throw error
}

export async function huyUrl(id: string): Promise<void> {
  const { error } = await taoSupabase()
    .from('invitations')
    .update({ trang_thai: 'da-huy', public_slug: null })
    .eq('id', id)
  if (error) throw error
}

export async function laySpreadsheetId(id: string): Promise<string | null> {
  const { data, error } = await taoSupabase()
    .from('invitations')
    .select('spreadsheet_id')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data?.spreadsheet_id ?? null
}

export async function luuSpreadsheetId(id: string, spreadsheetId: string): Promise<void> {
  const { error } = await taoSupabase()
    .from('invitations')
    .update({ spreadsheet_id: spreadsheetId })
    .eq('id', id)
  if (error) throw error
}
