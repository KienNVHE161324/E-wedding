#!/usr/bin/env node
/**
 * Đồng bộ họa tiết từ Image_collections sang ứng dụng.
 *
 * Chạy: npm run hoa-tiet
 *
 * Việc script làm:
 *   1. Quét các thư mục asset đã duyệt trong Image_collections
 *   2. Chép PNG sang public/hoa-tiet giữ nguyên cấu trúc thư mục
 *   3. Sinh src/lib/motifs/danhSach.ts để trang quản trị liệt kê ra cho nhân viên chọn
 *
 * Thêm asset mới: bỏ PNG vào đúng nhóm trong Image_collections rồi chạy lại lệnh này.
 * Không sửa tay danhSach.ts — chạy lại là bị ghi đè.
 */

import { readdir, mkdir, copyFile, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'

const GOC_ASSET = 'Image_collections'
const GOC_PUBLIC = 'public/hoa-tiet'
const TEP_DANH_SACH = 'src/lib/motifs/danhSach.ts'

/** Thư mục được coi là asset production, kèm tên nhóm hiển thị cho nhân viên. */
const NHOM = [
  { duongDan: 'watermarks/florals/single-flowers', ten: 'Hoa nền' },
  { duongDan: 'primary-decor/florals/horizontal-dividers', ten: 'Cụm hoa ngang' },
  { duongDan: 'primary-decor/florals/small-bouquets', ten: 'Cụm hoa nhỏ' },
  { duongDan: 'primary-decor/florals', ten: 'Hoa' },
  { duongDan: 'primary-decor/architecture', ten: 'Kiến trúc' },
  { duongDan: 'primary-decor/attire-accessories', ten: 'Trang phục và phụ kiện' },
  { duongDan: 'primary-decor/wedding-ritual', ten: 'Nghi lễ cưới' },
  { duongDan: 'primary-decor/nature', ten: 'Thiên nhiên' },
  { duongDan: 'primary-decor/symbols', ten: 'Biểu tượng' },
  { duongDan: 'people/bride-groom/primary-decor', ten: 'Cô dâu chú rể' },
]

/** Đổi tên tệp thành nhãn tiếng Việt dễ đọc: 'F01-lotus-front' -> 'F01 lotus front'. */
function nhanTuTenTep(ten) {
  return ten.replace(/\.png$/i, '').replace(/-/g, ' ')
}

async function quetThuMuc(duongDan) {
  try {
    const muc = await readdir(path.join(GOC_ASSET, duongDan), { withFileTypes: true })
    return muc
      .filter((m) => m.isFile() && m.name.toLowerCase().endsWith('.png'))
      .map((m) => m.name)
      .sort()
  } catch (loi) {
    if (loi.code === 'ENOENT') return []
    throw loi
  }
}

async function main() {
  await rm(GOC_PUBLIC, { recursive: true, force: true })

  const muc = []

  for (const nhom of NHOM) {
    const tepTrongNhom = await quetThuMuc(nhom.duongDan)
    if (tepTrongNhom.length === 0) continue

    await mkdir(path.join(GOC_PUBLIC, nhom.duongDan), { recursive: true })

    for (const ten of tepTrongNhom) {
      await copyFile(
        path.join(GOC_ASSET, nhom.duongDan, ten),
        path.join(GOC_PUBLIC, nhom.duongDan, ten),
      )
      muc.push({
        id: `${nhom.duongDan}/${ten}`.replace(/\.png$/i, ''),
        tep: `${nhom.duongDan}/${ten}`,
        nhom: nhom.ten,
        nhan: nhanTuTenTep(ten),
      })
    }

    console.log(`${nhom.ten.padEnd(28)} ${tepTrongNhom.length} chi tiết`)
  }

  const noiDung = `// TỆP SINH TỰ ĐỘNG — đừng sửa tay.
// Chạy \`npm run hoa-tiet\` để cập nhật sau khi thêm asset vào Image_collections.

export interface MucHoaTiet {
  /** Định danh bền, dùng để lưu trong dữ liệu thiệp. */
  id: string
  /** Đường dẫn tệp dưới /hoa-tiet. */
  tep: string
  /** Nhóm hiển thị trong trang quản trị. */
  nhom: string
  /** Nhãn hiển thị cho nhân viên. */
  nhan: string
}

export const DANH_SACH_HOA_TIET: MucHoaTiet[] = ${JSON.stringify(muc, null, 2)}

export const HOA_TIET_THEO_ID = new Map(DANH_SACH_HOA_TIET.map((m) => [m.id, m]))

export function layHoaTiet(id: string): MucHoaTiet | undefined {
  return HOA_TIET_THEO_ID.get(id)
}
`

  await mkdir(path.dirname(TEP_DANH_SACH), { recursive: true })
  await writeFile(TEP_DANH_SACH, noiDung, 'utf8')
  console.log(`\nTổng ${muc.length} chi tiết -> ${TEP_DANH_SACH}`)
}

main()
