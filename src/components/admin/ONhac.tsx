'use client'

import { useState } from 'react'
import type { Invitation, ThoiLuongDoanNhac } from '@/lib/invitation/types'
import {
  dinhDangThoiGian,
  gioiHanBatDau,
  layKetThucDoan,
} from '@/lib/nhac/doanNhac'
import { DANH_SACH_NHAC_MAC_DINH } from '@/lib/nhac/macDinh'

export function ONhac({
  giaTri,
  slug,
  onDoi,
}: {
  giaTri: Invitation['nhac']
  slug: string
  onDoi: (v: Invitation['nhac']) => void
}) {
  const [dangTai, setDangTai] = useState(false)
  const [loi, setLoi] = useState('')
  const [tongThoiLuong, setTongThoiLuong] = useState<number | null>()

  async function taiLen(e: React.ChangeEvent<HTMLInputElement>) {
    const tep = e.target.files?.[0]
    e.target.value = ''
    if (!tep) return

    setLoi('')
    setDangTai(true)

    const fd = new FormData()
    fd.append('file', tep)
    fd.append('slug', slug)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    setDangTai(false)

    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      setTongThoiLuong(undefined)
      onDoi({ url: data.url, ten: tep.name.replace(/\.mp3$/i, '') })
    } else {
      setLoi(data.loi ?? 'Không tải được tệp nhạc')
    }
  }

  function chonThoiLuong(thoiLuong?: ThoiLuongDoanNhac) {
    if (!giaTri) return
    if (!thoiLuong) {
      onDoi({ url: giaTri.url, ten: giaTri.ten })
      return
    }

    const batDau =
      typeof tongThoiLuong === 'number'
        ? gioiHanBatDau(giaTri.batDau ?? 0, thoiLuong, tongThoiLuong)
        : 0
    onDoi({ ...giaTri, batDau, thoiLuong })
  }

  const coMetadata = typeof tongThoiLuong === 'number' && Number.isFinite(tongThoiLuong)
  const batDau =
    giaTri?.thoiLuong && coMetadata
      ? gioiHanBatDau(giaTri.batDau ?? 0, giaTri.thoiLuong, tongThoiLuong)
      : 0
  const ketThuc =
    giaTri?.thoiLuong && coMetadata
      ? layKetThucDoan(batDau, giaTri.thoiLuong, tongThoiLuong)
      : 0

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Nhạc chỉ phát sau khi khách bấm Mở thiệp, và tắt được bất cứ lúc nào.
      </p>

      {giaTri ? (
        <div className="mt-2 rounded border p-3">
          <p className="text-sm font-medium">{giaTri.ten}</p>
          <audio
            data-testid="nghe-thu-nhac"
            controls
            src={giaTri.url}
            onLoadedMetadata={(e) => {
              const duration = e.currentTarget.duration
              setTongThoiLuong(Number.isFinite(duration) ? duration : null)
            }}
            onError={() => setTongThoiLuong(null)}
            onTimeUpdate={(e) => {
              if (!giaTri.thoiLuong || !coMetadata) return
              if (e.currentTarget.currentTime >= ketThuc) {
                e.currentTarget.currentTime = batDau
              }
            }}
            className="mt-2 w-full"
          />

          <fieldset className="mt-3">
            <legend className="text-sm font-medium">Thời lượng phát</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { nhan: 'Cả bài', giaTri: undefined },
                { nhan: '1 phút', giaTri: 60 as const },
                { nhan: '30 giây', giaTri: 30 as const },
              ].map((luaChon) => (
                <label
                  key={luaChon.nhan}
                  className="flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm"
                >
                  <input
                    type="radio"
                    name="thoi-luong-nhac"
                    checked={
                      luaChon.giaTri
                        ? giaTri.thoiLuong === luaChon.giaTri
                        : !giaTri.thoiLuong
                    }
                    disabled={Boolean(luaChon.giaTri) && !coMetadata}
                    onChange={() => chonThoiLuong(luaChon.giaTri)}
                  />
                  {luaChon.nhan}
                </label>
              ))}
            </div>
          </fieldset>

          {tongThoiLuong === undefined && (
            <p className="mt-2 text-xs text-neutral-500">Đang tải thông tin nhạc...</p>
          )}
          {tongThoiLuong === null && (
            <p className="mt-2 text-xs text-amber-700">
              Không đọc được thời lượng. Bạn vẫn có thể chọn phát cả bài.
            </p>
          )}

          {giaTri.thoiLuong && coMetadata && (
            <div className="mt-3 rounded-lg bg-neutral-50 p-3">
              <input
                type="range"
                aria-label="Điểm bắt đầu đoạn nhạc"
                min={0}
                max={Math.max(0, tongThoiLuong - giaTri.thoiLuong)}
                step={1}
                value={batDau}
                onChange={(e) => {
                  const moi = Number(e.target.value)
                  onDoi({ ...giaTri, batDau: moi })
                }}
                className="w-full accent-current"
              />
              <p className="mt-1 text-center text-sm font-medium">
                Đoạn phát: {dinhDangThoiGian(batDau)} – {dinhDangThoiGian(ketThuc)}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setTongThoiLuong(undefined)
              onDoi(undefined)
            }}
            className="mt-3 text-sm underline"
          >
            Bỏ nhạc này
          </button>
        </div>
      ) : (
        <p className="mt-2 text-sm text-neutral-500">Chưa chọn nhạc. Thiệp sẽ im lặng.</p>
      )}

      <label className="mt-3 block text-sm">
        Tải lên tệp MP3 riêng
        <input
          type="file"
          aria-label="Tệp nhạc"
          accept="audio/mpeg"
          onChange={taiLen}
          className="mt-1 w-full text-sm"
        />
      </label>

      <label className="mt-3 block text-sm">
        Hoặc chọn bản gợi ý
        <select
          aria-label="Bản nhạc gợi ý"
          value=""
          onChange={(e) => {
            const chon = DANH_SACH_NHAC_MAC_DINH.find((g) => g.url === e.target.value)
            if (chon) {
              setTongThoiLuong(undefined)
              onDoi({ ...chon })
            }
          }}
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="">Chọn một bản</option>
          {DANH_SACH_NHAC_MAC_DINH.map((g) => (
            <option key={g.url} value={g.url}>
              {g.ten}
            </option>
          ))}
        </select>
      </label>

      {dangTai && <p className="mt-1 text-sm">Đang tải lên...</p>}
      {loi && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {loi}
        </p>
      )}
    </div>
  )
}
