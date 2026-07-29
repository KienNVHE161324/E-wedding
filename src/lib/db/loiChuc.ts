import { z } from 'zod'
import { taoSupabase } from './client'

export const loiChucDauVaoSchema = z.object({
  hoTen: z.string().trim().min(1, 'Vui lòng nhập tên của bạn').max(100),
  noiDung: z.string().trim().min(1, 'Vui lòng viết vài lời chúc').max(1000),
})

export type LoiChucDauVao = z.infer<typeof loiChucDauVaoSchema>

export interface LoiChucDayDu extends LoiChucDauVao {
  id: string
  ngayGui: string
}

interface DongDb {
  id: string
  ho_ten: string
  noi_dung: string
  ngay_gui: string
}

const sangLoiChuc = (d: DongDb): LoiChucDayDu => ({
  id: d.id,
  hoTen: d.ho_ten,
  noiDung: d.noi_dung,
  ngayGui: d.ngay_gui,
})

export async function taoLoiChuc(
  invitationId: string,
  dauVao: LoiChucDauVao,
): Promise<LoiChucDayDu> {
  const { data, error } = await taoSupabase()
    .from('loi_chuc')
    .insert({ invitation_id: invitationId, ho_ten: dauVao.hoTen, noi_dung: dauVao.noiDung })
    .select()
    .single()

  if (error) throw error
  return sangLoiChuc(data as DongDb)
}

/** Mới nhất lên đầu. */
export async function layLoiChuc(invitationId: string): Promise<LoiChucDayDu[]> {
  const { data, error } = await taoSupabase()
    .from('loi_chuc')
    .select('id, ho_ten, noi_dung, ngay_gui')
    .eq('invitation_id', invitationId)
    .order('ngay_gui', { ascending: false })
    .limit(300)

  if (error) throw error
  return (data as DongDb[]).map(sangLoiChuc)
}

export async function xoaLoiChuc(id: string): Promise<void> {
  const { error } = await taoSupabase().from('loi_chuc').delete().eq('id', id)
  if (error) throw error
}
