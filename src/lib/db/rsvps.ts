import { taoSupabase } from './client'
import type { Rsvp, RsvpDauVao } from '@/lib/rsvp/types'

interface DongDb {
  id: string
  invitation_id: string
  ho_ten: string
  ben: 'nha-trai' | 'nha-gai'
  quan_he: string
  phuong_tien: string
  ngay_an: string
  loi_chuc: string | null
  tuy_chinh: Record<string, string> | null
  da_dong_bo_sheet: boolean
  ngay_dang_ky: string
}

function sangRsvp(d: DongDb): Rsvp {
  return {
    id: d.id,
    invitationId: d.invitation_id,
    hoTen: d.ho_ten,
    ben: d.ben,
    quanHe: d.quan_he,
    phuongTien: d.phuong_tien,
    ngayAn: d.ngay_an,
    loiChuc: d.loi_chuc ?? undefined,
    tuyChinh: d.tuy_chinh ?? {},
    daDongBoSheet: d.da_dong_bo_sheet,
    ngayDangKy: d.ngay_dang_ky,
  }
}

export async function taoRsvp(dauVao: RsvpDauVao & { invitationId: string }): Promise<Rsvp> {
  const { data, error } = await taoSupabase()
    .from('rsvps')
    .insert({
      invitation_id: dauVao.invitationId,
      ho_ten: dauVao.hoTen,
      ben: dauVao.ben,
      quan_he: dauVao.quanHe,
      phuong_tien: dauVao.phuongTien,
      ngay_an: dauVao.ngayAn,
      loi_chuc: dauVao.loiChuc ?? null,
      tuy_chinh: dauVao.tuyChinh,
    })
    .select()
    .single()

  if (error) throw error
  return sangRsvp(data as DongDb)
}

export async function layRsvpChuaDongBo(): Promise<Rsvp[]> {
  const { data, error } = await taoSupabase()
    .from('rsvps')
    .select()
    .eq('da_dong_bo_sheet', false)
    .order('ngay_dang_ky', { ascending: true })
    .limit(200)
  if (error) throw error
  return (data as DongDb[]).map(sangRsvp)
}

export async function danhDauDaDongBo(id: string): Promise<void> {
  const { error } = await taoSupabase()
    .from('rsvps')
    .update({ da_dong_bo_sheet: true })
    .eq('id', id)
  if (error) throw error
}
