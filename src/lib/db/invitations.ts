import { taoSupabase } from './client'
import { invitationSchema } from '@/lib/invitation/schema'
import type { Invitation } from '@/lib/invitation/types'
import type { VongDoi } from '@/lib/vongDoi/types'

export async function layThiepTheoSlug(
  slug: string,
): Promise<{ thiep: Invitation; vongDoi: VongDoi; spreadsheetId: string | null } | null> {
  const { data, error } = await taoSupabase()
    .from('invitations')
    .select('noi_dung, trang_thai, ngay_xuat_ban, ngay_het_han, spreadsheet_id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return {
    thiep: invitationSchema.parse(data.noi_dung),
    spreadsheetId: data.spreadsheet_id,
    vongDoi: {
      trangThaiLuu: data.trang_thai as 'nhap' | 'da-xuat-ban',
      ngayXuatBan: data.ngay_xuat_ban,
      ngayHetHan: data.ngay_het_han,
    },
  }
}

export async function taoThiepTrongDb(thiep: Invitation, nguoiTao: string): Promise<void> {
  const hopLe = invitationSchema.parse(thiep)
  const { error } = await taoSupabase().from('invitations').insert({
    slug: hopLe.slug,
    theme_id: hopLe.themeId,
    noi_dung: hopLe,
    nguoi_tao: nguoiTao,
  })
  if (error) {
    if (error.code === '23505') throw new Error('Đường dẫn này đã có người dùng rồi')
    throw error
  }
}

/** Toàn bộ đường dẫn đang dùng, để đề xuất tên thay thế khi bị trùng. */
export async function laySlugDaCo(): Promise<string[]> {
  const { data, error } = await taoSupabase().from('invitations').select('slug')
  if (error) throw error
  return (data as { slug: string }[]).map((d) => d.slug)
}

export async function luuThiep(thiep: Invitation): Promise<void> {
  const hopLe = invitationSchema.parse(thiep)
  const { error } = await taoSupabase()
    .from('invitations')
    .update({
      theme_id: hopLe.themeId,
      noi_dung: hopLe,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', hopLe.slug)
  if (error) throw error
}

export async function xuatBan(slug: string, ngayHetHan: string): Promise<void> {
  const { error } = await taoSupabase()
    .from('invitations')
    .update({
      trang_thai: 'da-xuat-ban',
      ngay_xuat_ban: new Date().toISOString(),
      ngay_het_han: ngayHetHan,
    })
    .eq('slug', slug)
  if (error) throw error
}

export async function giaHan(slug: string, ngayHetHanMoi: string): Promise<void> {
  const { error } = await taoSupabase()
    .from('invitations')
    .update({ ngay_het_han: ngayHetHanMoi })
    .eq('slug', slug)
  if (error) throw error
}

export async function laySpreadsheetId(slug: string): Promise<string | null> {
  const { data, error } = await taoSupabase()
    .from('invitations')
    .select('spreadsheet_id')
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data?.spreadsheet_id ?? null
}

export async function luuSpreadsheetId(slug: string, spreadsheetId: string): Promise<void> {
  const { error } = await taoSupabase()
    .from('invitations')
    .update({ spreadsheet_id: spreadsheetId })
    .eq('slug', slug)
  if (error) throw error
}
