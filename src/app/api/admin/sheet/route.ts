import { NextResponse } from 'next/server'
import { z } from 'zod'
import { luuSpreadsheetId } from '@/lib/db/invitations'
import { taoSheetsApi } from '@/lib/sheets/client'
import { chuanBiBangTinh } from '@/lib/sheets/dongBo'
import { tachSpreadsheetId } from '@/lib/sheets/tachId'

const dauVaoSchema = z.object({
  slug: z.string().min(1),
  /** Nhận cả ID trần lẫn URL đầy đủ của Google Sheet. */
  idHoacUrl: z.string().trim().min(1, 'Vui lòng dán ID hoặc đường dẫn Google Sheet'),
})

export async function POST(req: Request) {
  const kiemTra = dauVaoSchema.safeParse(await req.json())
  if (!kiemTra.success) {
    return NextResponse.json(
      { loi: kiemTra.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ' },
      { status: 400 },
    )
  }

  const spreadsheetId = tachSpreadsheetId(kiemTra.data.idHoacUrl)
  if (!spreadsheetId) {
    return NextResponse.json(
      { loi: 'Không nhận ra ID bảng tính. Hãy dán đường dẫn Google Sheet đầy đủ.' },
      { status: 400 },
    )
  }

  // Dựng hai tab ngay để phát hiện sớm việc quên chia sẻ quyền,
  // thay vì để khách mời gửi xác nhận rồi mới vỡ.
  try {
    await chuanBiBangTinh(spreadsheetId, taoSheetsApi())
  } catch (loi) {
    console.error('Không truy cập được bảng tính:', loi)
    return NextResponse.json(
      {
        loi:
          'Không mở được bảng tính. Kiểm tra đã chia sẻ file cho email service account ' +
          'với quyền Editor chưa.',
      },
      { status: 400 },
    )
  }

  try {
    await luuSpreadsheetId(kiemTra.data.slug, spreadsheetId)
    return NextResponse.json({ ok: true, spreadsheetId })
  } catch (loi) {
    console.error('Lỗi lưu spreadsheet id:', loi)
    return NextResponse.json({ loi: 'Không lưu được' }, { status: 500 })
  }
}
