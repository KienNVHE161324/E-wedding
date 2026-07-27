'use client'

import type { NguoiCuoi } from '@/lib/invitation/types'
import { OAnh } from './OAnh'

/** Toàn bộ thông tin một bên: tên, ảnh, giới thiệu, tên bố mẹ. */
export function ONguoiCuoi({
  nhan,
  slug,
  giaTri,
  onDoi,
}: {
  nhan: string
  slug: string
  giaTri: NguoiCuoi
  onDoi: (v: NguoiCuoi) => void
}) {
  const o = 'mt-1 w-full rounded border px-3 py-2 text-sm'

  function sua(thayDoi: Partial<NguoiCuoi>) {
    onDoi({ ...giaTri, ...thayDoi })
  }

  return (
    <div className="rounded border p-3">
      <h4 className="font-medium">{nhan}</h4>

      <label className="mt-2 block text-sm">
        Họ và tên
        <input
          aria-label={`Họ và tên ${nhan}`}
          value={giaTri.ten}
          onChange={(e) => sua({ ten: e.target.value })}
          className={o}
        />
      </label>

      <label className="mt-2 block text-sm">
        Giới thiệu ngắn
        <textarea
          aria-label={`Giới thiệu ${nhan}`}
          rows={2}
          value={giaTri.gioiThieu ?? ''}
          onChange={(e) => sua({ gioiThieu: e.target.value || undefined })}
          placeholder="Sinh ra và lớn lên tại Từ Sơn, Bắc Ninh."
          className={o}
        />
      </label>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="text-sm">
          Tên bố
          <input
            aria-label={`Tên bố ${nhan}`}
            value={giaTri.tenBo ?? ''}
            onChange={(e) => sua({ tenBo: e.target.value || undefined })}
            placeholder="Ông Nguyễn Văn Bình"
            className={o}
          />
        </label>
        <label className="text-sm">
          Tên mẹ
          <input
            aria-label={`Tên mẹ ${nhan}`}
            value={giaTri.tenMe ?? ''}
            onChange={(e) => sua({ tenMe: e.target.value || undefined })}
            placeholder="Bà Trần Thị Hoa"
            className={o}
          />
        </label>
      </div>

      <div className="mt-3">
        <OAnh
          nhan={`Ảnh ${nhan}`}
          slug={slug}
          giaTri={giaTri.anh}
          onDoi={(a) => sua({ anh: a })}
        />
      </div>
    </div>
  )
}
