import { NextResponse } from 'next/server'
import { layKhoLuuTru } from '@/lib/luuTru'

const LOAI_CHO_PHEP = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg']
const KICH_THUOC_TOI_DA = 10 * 1024 * 1024
const DUOI_HOP_LE = /^[a-z0-9]{1,5}$/

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

  // Đuôi tệp do người dùng đặt, phải lọc trước khi ghép vào đường dẫn.
  const duoiThô = file.name.split('.').pop()?.toLowerCase() ?? ''
  const duoi = DUOI_HOP_LE.test(duoiThô) ? duoiThô : 'bin'
  const duongDan = `${slug}/${crypto.randomUUID()}.${duoi}`

  try {
    const kho = layKhoLuuTru()
    return NextResponse.json({ url: await kho.luu(duongDan, file) })
  } catch (loi) {
    console.error('Lỗi lưu tệp tải lên:', loi)
    return NextResponse.json({ loi: 'Không tải được tệp lên' }, { status: 500 })
  }
}
