import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { NextResponse } from 'next/server'

/**
 * Phục vụ ảnh đã tải lên khi NOI_LUU_ANH=o-dia.
 *
 * Không dùng thư mục public được vì Next chỉ đọc public lúc build,
 * còn ảnh khách thì đến sau khi deploy.
 */

const KIEU_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ duongDan: string[] }> },
) {
  const { duongDan } = await params
  const goc = path.resolve(process.env.THU_MUC_TAI_LEN ?? 'du-lieu/tai-len')
  const day = path.resolve(goc, ...duongDan)

  // Chặn đường dẫn kiểu "../../.env" đọc ra ngoài thư mục cho phép.
  if (day !== goc && !day.startsWith(goc + path.sep)) {
    return new NextResponse('Không hợp lệ', { status: 400 })
  }

  const kieu = KIEU_MIME[path.extname(day).toLowerCase()]
  if (!kieu) return new NextResponse('Không hỗ trợ', { status: 415 })

  try {
    const thongTin = await stat(day)
    if (!thongTin.isFile()) return new NextResponse('Không tìm thấy', { status: 404 })

    const noiDung = await readFile(day)
    return new NextResponse(new Uint8Array(noiDung), {
      headers: {
        'Content-Type': kieu,
        // Tên tệp có UUID nên nội dung không bao giờ đổi, cache thoải mái.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Không tìm thấy', { status: 404 })
  }
}
