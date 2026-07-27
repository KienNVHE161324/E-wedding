import { mkdir, writeFile, unlink } from 'node:fs/promises'
import path from 'node:path'
import type { KhoLuuTru } from './types'

/**
 * Lưu vào ổ đĩa máy chủ, mặc định là thư mục `du-lieu/tai-len` cạnh mã nguồn.
 *
 * CHỈ dùng khi tự host trên VPS có ổ đĩa lâu dài. Trên Vercel hay các nền tảng
 * serverless khác, ổ đĩa là tạm và bị xóa sau mỗi lần deploy — ảnh sẽ mất.
 *
 * Tệp được phục vụ qua route /tai-len/[...duongDan] chứ không phải thư mục public,
 * vì public chỉ được đọc lúc build.
 */
export function taoKhoODia(thuMucGoc = process.env.THU_MUC_TAI_LEN ?? 'du-lieu/tai-len'): KhoLuuTru {
  const goc = path.resolve(thuMucGoc)

  function duongDanThat(duongDan: string): string {
    const day = path.resolve(goc, duongDan)
    // Chặn duongDan kiểu "../../etc/passwd" ghi ra ngoài thư mục cho phép.
    if (day !== goc && !day.startsWith(goc + path.sep)) {
      throw new Error('Đường dẫn tệp không hợp lệ')
    }
    return day
  }

  return {
    ten: 'ổ đĩa máy chủ',

    async luu(duongDan, tep) {
      const day = duongDanThat(duongDan)
      await mkdir(path.dirname(day), { recursive: true })
      await writeFile(day, Buffer.from(await tep.arrayBuffer()))
      return `/tai-len/${duongDan}`
    },

    async xoa(duongDan) {
      try {
        await unlink(duongDanThat(duongDan))
      } catch (loi) {
        if ((loi as NodeJS.ErrnoException).code !== 'ENOENT') throw loi
      }
    },
  }
}
