import { NextResponse } from 'next/server'
import { taoSupabase } from '@/lib/db/client'

const LOAI_CHO_PHEP = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg']
const KICH_THUOC_TOI_DA = 10 * 1024 * 1024

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file')
  const slug = form.get('slug')

  if (!(file instanceof File) || typeof slug !== 'string' || !slug) {
    return NextResponse.json({ loi: 'Thiếu tệp hoặc mã thiệp' }, { status: 400 })
  }
  if (!LOAI_CHO_PHEP.includes(file.type)) {
    return NextResponse.json({ loi: 'Chỉ nhận ảnh JPG, PNG, WEBP hoặc nhạc MP3' }, { status: 400 })
  }
  if (file.size > KICH_THUOC_TOI_DA) {
    return NextResponse.json({ loi: 'Tệp vượt quá 10MB' }, { status: 400 })
  }

  const duoi = file.name.split('.').pop() ?? 'bin'
  const duongDan = `${slug}/${crypto.randomUUID()}.${duoi}`

  const supabase = taoSupabase()
  const { error } = await supabase.storage
    .from('thiep')
    .upload(duongDan, file, { contentType: file.type, upsert: false })

  if (error) {
    console.error('Lỗi upload:', error)
    return NextResponse.json({ loi: 'Không tải được tệp lên' }, { status: 500 })
  }

  const { data } = supabase.storage.from('thiep').getPublicUrl(duongDan)
  return NextResponse.json({ url: data.publicUrl })
}
