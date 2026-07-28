'use client'

import type { Ben, OMungCuoi as OMungCuoiData } from '@/lib/invitation/types'
import type { CauHinhQrTheme, KieuKhungQr } from '@/lib/qr/types'
import { mauQrAnToan, resolveCauHinhQr } from '@/lib/qr/cauHinh'
import { MauQr } from '@/components/qr/MauQr'
import { OAnh } from './OAnh'

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

export function OMungCuoi({
  giaTri,
  slug,
  themeQr,
  kieuKhungThiep,
  onDoi,
}: {
  giaTri: OMungCuoiData[]
  slug: string
  themeQr: CauHinhQrTheme
  kieuKhungThiep?: KieuKhungQr
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

          {(() => {
            const hieuLuc = resolveCauHinhQr(themeQr, kieuKhungThiep, box.tuyChinhQr)
            const canhBao = mauQrAnToan(hieuLuc).coCanhBao
            return (
              <div className="mt-3 rounded-lg bg-neutral-50 p-3">
                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div>
                    <label className="block text-sm">
                      Kiểu QR
                      <select
                        aria-label={`Kiểu QR ${TEN_BEN[box.ben]}`}
                        value={box.tuyChinhQr?.kieuKhung ?? ''}
                        onChange={(e) =>
                          sua(i, {
                            tuyChinhQr: {
                              ...box.tuyChinhQr,
                              kieuKhung: (e.target.value || undefined) as
                                | KieuKhungQr
                                | undefined,
                            },
                          })
                        }
                        className={o}
                      >
                        <option value="">Theo giao diện</option>
                        <option value="toi-gian">Tối giản</option>
                        <option value="hoa-mem">Hoa mềm</option>
                        <option value="phong-bao">Phong bao</option>
                      </select>
                    </label>
                    <div className="mt-2 flex gap-4">
                      <label className="text-xs">
                        Màu QR
                        <input
                          type="color"
                          aria-label={`Màu QR ${TEN_BEN[box.ben]}`}
                          value={box.tuyChinhQr?.mauQr ?? hieuLuc.mauQr}
                          onChange={(e) =>
                            sua(i, {
                              tuyChinhQr: { ...box.tuyChinhQr, mauQr: e.target.value },
                            })
                          }
                          className="ml-2 h-8 w-10 align-middle"
                        />
                      </label>
                      <label className="text-xs">
                        Màu nền
                        <input
                          type="color"
                          aria-label={`Màu nền QR ${TEN_BEN[box.ben]}`}
                          value={box.tuyChinhQr?.mauNen ?? hieuLuc.mauNen}
                          onChange={(e) =>
                            sua(i, {
                              tuyChinhQr: { ...box.tuyChinhQr, mauNen: e.target.value },
                            })
                          }
                          className="ml-2 h-8 w-10 align-middle"
                        />
                      </label>
                    </div>
                  </div>
                  <MauQr
                    kieu={hieuLuc.kieuKhung}
                    mauQr={hieuLuc.mauQr}
                    mauNen={hieuLuc.mauNen}
                  />
                </div>
                {canhBao && (
                  <p role="alert" className="mt-2 text-xs text-red-600">
                    Độ tương phản quá thấp; khi hiển thị QR sẽ dùng màu đen trên nền trắng.
                  </p>
                )}
                <button
                  type="button"
                  aria-label={`Khôi phục QR ${TEN_BEN[box.ben]} theo giao diện`}
                  onClick={() => sua(i, { tuyChinhQr: undefined })}
                  className="mt-2 text-xs underline"
                >
                  Khôi phục theo giao diện
                </button>
              </div>
            )
          })()}
        </div>
      ))}
    </div>
  )
}
