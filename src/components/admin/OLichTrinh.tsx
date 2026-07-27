'use client'

import type { Anh, SuKien } from '@/lib/invitation/types'
import { sapXepLichTrinh } from '@/lib/invitation/lich'
import { OAnh } from './OAnh'

/** Mỗi mốc sửa độc lập; thứ tự hiển thị trên thiệp do giờ quyết định, không do vị trí trong danh sách. */
export function OLichTrinh({
  giaTri,
  ngayCuoi,
  slug,
  onDoi,
}: {
  giaTri: SuKien[]
  /** Mốc mới mặc định rơi vào ngày cưới cho đỡ phải gõ. */
  ngayCuoi: string
  slug: string
  onDoi: (v: SuKien[]) => void
}) {
  function sua(i: number, thayDoi: Partial<SuKien>) {
    onDoi(giaTri.map((sk, j) => (j === i ? { ...sk, ...thayDoi } : sk)))
  }

  function them() {
    onDoi([...giaTri, { ngay: ngayCuoi, gio: '09:00', ten: '', diaDiem: '', diaChi: '' }])
  }

  function xoa(i: number) {
    onDoi(giaTri.filter((_, j) => j !== i))
  }

  const o = 'mt-1 w-full rounded border px-2 py-1.5 text-sm'
  // Xem trước thứ tự thật để nhân viên biết mốc nào lên trước.
  const thuTuHienThi = sapXepLichTrinh(giaTri).map((sk) => `${sk.gio} ${sk.ten}`.trim())

  return (
    <div>
      {giaTri.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Chưa có mốc nào. Phần Lịch trình sẽ tự ẩn khỏi thiệp.
        </p>
      ) : (
        <>
          <p className="text-sm text-neutral-500">
            Thứ tự trên thiệp: {thuTuHienThi.join(' → ')}
          </p>

          <ul className="mt-3 space-y-4">
            {giaTri.map((sk, i) => (
              <li key={i} className="rounded border p-3">
                <div className="flex items-center gap-2">
                  <span className="flex-1 text-sm font-medium">{sk.ten || 'Mốc chưa đặt tên'}</span>
                  <button
                    type="button"
                    aria-label={`Bỏ mốc ${i + 1}`}
                    onClick={() => xoa(i)}
                    className="text-sm underline"
                  >
                    Bỏ
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="text-sm">
                    Ngày
                    <input
                      type="date"
                      aria-label={`Ngày của mốc ${i + 1}`}
                      value={sk.ngay}
                      onChange={(e) => sua(i, { ngay: e.target.value })}
                      className={o}
                    />
                  </label>
                  <label className="text-sm">
                    Giờ
                    <input
                      type="time"
                      aria-label={`Giờ của mốc ${i + 1}`}
                      value={sk.gio}
                      onChange={(e) => sua(i, { gio: e.target.value })}
                      className={o}
                    />
                  </label>
                </div>

                <label className="mt-2 block text-sm">
                  Tên mốc
                  <input
                    aria-label={`Tên của mốc ${i + 1}`}
                    value={sk.ten}
                    onChange={(e) => sua(i, { ten: e.target.value })}
                    placeholder="Đón dâu / Lễ Vu Quy / Tiệc cưới"
                    className={o}
                  />
                </label>

                <label className="mt-2 block text-sm">
                  Địa điểm
                  <input
                    aria-label={`Địa điểm của mốc ${i + 1}`}
                    value={sk.diaDiem}
                    onChange={(e) => sua(i, { diaDiem: e.target.value })}
                    placeholder="Tư gia nhà gái"
                    className={o}
                  />
                </label>

                <label className="mt-2 block text-sm">
                  Địa chỉ
                  <input
                    aria-label={`Địa chỉ của mốc ${i + 1}`}
                    value={sk.diaChi}
                    onChange={(e) => sua(i, { diaChi: e.target.value })}
                    placeholder="Thôn Đình Bảng, Từ Sơn, Bắc Ninh"
                    className={o}
                  />
                </label>

                <label className="mt-2 block text-sm">
                  Link chỉ đường
                  <input
                    aria-label={`Link chỉ đường của mốc ${i + 1}`}
                    value={sk.linkChiDuong ?? ''}
                    onChange={(e) => sua(i, { linkChiDuong: e.target.value || undefined })}
                    placeholder="Dán link Google Maps của địa điểm"
                    className={o}
                  />
                </label>

                <div className="mt-3">
                  <OAnh
                    nhan={`Ảnh bản đồ mốc ${i + 1}`}
                    slug={slug}
                    giaTri={sk.banDoAnh}
                    onDoi={(a: Anh | undefined) => sua(i, { banDoAnh: a })}
                  />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <button type="button" onClick={them} className="mt-3 w-full rounded border py-2 text-sm">
        Thêm mốc lịch trình
      </button>
    </div>
  )
}
