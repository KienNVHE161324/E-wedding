'use client'

import type { Ben, OMungCuoi as OMungCuoiData } from '@/lib/invitation/types'
import { OAnh } from './OAnh'

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

export function OMungCuoi({
  giaTri,
  slug,
  onDoi,
}: {
  giaTri: OMungCuoiData[]
  slug: string
  onDoi: (v: OMungCuoiData[]) => void
}) {
  const o = 'mt-1 w-full rounded border px-3 py-2 text-sm'

  function sua(i: number, thayDoi: Partial<OMungCuoiData>) {
    onDoi(giaTri.map((x, j) => (j === i ? { ...x, ...thayDoi } : x)))
  }

  return (
    <div className="space-y-3">
      {giaTri.map((box, i) => (
        <div key={box.ben} className="rounded border p-3">
          <h4 className="font-medium">{TEN_BEN[box.ben]}</h4>

          <label className="mt-2 block text-sm">
            Chủ tài khoản
            <input
              aria-label={`Chủ tài khoản ${TEN_BEN[box.ben]}`}
              value={box.chuTaiKhoan}
              onChange={(e) => sua(i, { chuTaiKhoan: e.target.value })}
              placeholder="NGUYEN HOAI NAM"
              className={o}
            />
          </label>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-sm">
              Ngân hàng
              <input
                aria-label={`Ngân hàng ${TEN_BEN[box.ben]}`}
                value={box.nganHang}
                onChange={(e) => sua(i, { nganHang: e.target.value })}
                placeholder="Vietcombank"
                className={o}
              />
            </label>
            <label className="text-sm">
              Số tài khoản
              <input
                aria-label={`Số tài khoản ${TEN_BEN[box.ben]}`}
                value={box.soTaiKhoan}
                onChange={(e) => sua(i, { soTaiKhoan: e.target.value })}
                placeholder="0123456789"
                className={o}
              />
            </label>
          </div>

          <div className="mt-3">
            <OAnh
              nhan={`Ảnh QR ${TEN_BEN[box.ben]}`}
              slug={slug}
              giaTri={box.qrAnh}
              onDoi={(a) => sua(i, { qrAnh: a })}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
