'use client'

import { useMemo, useState } from 'react'
import type { TuyChinhHoaTietTheme as GiaTriHoaTiet } from '@/lib/invitation/types'
import type { Theme } from '@/lib/themes/types'
import { DANH_SACH_HOA_TIET, layHoaTiet } from '@/lib/motifs/danhSach'
import { HoaTiet, MAC_DINH_HOA_TIET_BIA } from '@/components/HoaTiet'

export function TuyChinhHoaTietTheme({
  slot,
  nhan,
  theme,
  giaTri,
  doDamMacDinh,
  onDoi,
}: {
  slot: 'watermark' | 'corner'
  nhan: string
  theme: Theme
  giaTri?: GiaTriHoaTiet
  doDamMacDinh?: number
  onDoi: (v: GiaTriHoaTiet) => void
}) {
  const [dangChon, setDangChon] = useState(false)
  const [nhomDangXem, setNhomDangXem] = useState(DANH_SACH_HOA_TIET[0]?.nhom ?? '')
  const macDinh = MAC_DINH_HOA_TIET_BIA[slot]
  const mucDangChon = giaTri?.id ? layHoaTiet(giaTri.id) : undefined
  const tep = mucDangChon?.tep ?? theme.hoaTiet[slot]
  const nhom = useMemo(() => [...new Set(DANH_SACH_HOA_TIET.map((m) => m.nhom))], [])
  const trongNhom = useMemo(
    () => DANH_SACH_HOA_TIET.filter((m) => m.nhom === nhomDangXem),
    [nhomDangXem],
  )

  function sua(thayDoi: Partial<GiaTriHoaTiet>) {
    onDoi({ ...giaTri, ...thayDoi })
  }

  function boAnhTuyChinh() {
    const { id: _id, ...conLai } = giaTri ?? {}
    onDoi(conLai)
  }

  const x = giaTri?.x ?? macDinh.x
  const y = giaTri?.y ?? macDinh.y
  const kichThuoc = giaTri?.kichThuoc ?? macDinh.kichThuoc
  const gocXoay = giaTri?.gocXoay ?? macDinh.gocXoay
  const doDam = giaTri?.doDam ?? doDamMacDinh ?? theme.doDam[slot] ?? 1

  return (
    <div className="rounded border p-3">
      <div className="flex items-center gap-3">
        {tep && (
          <HoaTiet
            tep={tep}
            mau={giaTri?.mau}
            doDam={doDam}
            className="block h-12 w-12 shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{nhan}</p>
          <p className="truncate text-xs text-neutral-500">
            {mucDangChon?.nhan ?? 'Ảnh mặc định của giao diện'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDangChon((v) => !v)}
          className="rounded border px-2 py-1 text-sm"
        >
          {dangChon ? 'Đóng kho' : 'Thay ảnh'}
        </button>
      </div>

      {dangChon && (
        <div className="mt-3 rounded border p-2">
          <select
            aria-label={`Nhóm ảnh của ${nhan}`}
            value={nhomDangXem}
            onChange={(e) => setNhomDangXem(e.target.value)}
            className="w-full rounded border px-2 py-1.5 text-sm"
          >
            {nhom.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <div className="mt-2 grid max-h-56 grid-cols-4 gap-2 overflow-y-auto">
            {trongNhom.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-label={`Chọn ${m.nhan} cho ${nhan}`}
                onClick={() => {
                  sua({ id: m.id })
                  setDangChon(false)
                }}
                className="flex aspect-square items-center justify-center rounded border p-1 hover:bg-neutral-100"
              >
                <HoaTiet tep={m.tep} mau="#333333" className="block h-full w-full" />
              </button>
            ))}
          </div>
          {giaTri?.id && (
            <button
              type="button"
              onClick={boAnhTuyChinh}
              className="mt-2 w-full rounded border py-1.5 text-sm"
            >
              Dùng lại ảnh mặc định
            </button>
          )}
        </div>
      )}

      <div className="mt-3 space-y-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="w-16">Ngang</span>
          <input
            type="range"
            aria-label={`Vị trí ngang của ${nhan}`}
            min={0}
            max={100}
            value={x}
            onChange={(e) => sua({ x: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{x}%</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16">Dọc</span>
          <input
            type="range"
            aria-label={`Vị trí dọc của ${nhan}`}
            min={0}
            max={100}
            value={y}
            onChange={(e) => sua({ y: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{y}%</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16">Cỡ</span>
          <input
            type="range"
            aria-label={`Kích thước của ${nhan}`}
            min={5}
            max={100}
            value={kichThuoc}
            onChange={(e) => sua({ kichThuoc: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{kichThuoc}%</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16">Xoay</span>
          <input
            type="range"
            aria-label={`Góc xoay của ${nhan}`}
            min={-180}
            max={180}
            value={gocXoay}
            onChange={(e) => sua({ gocXoay: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{gocXoay}°</span>
        </label>
        <label className="flex items-center gap-2">
          <span className="w-16">Đậm</span>
          <input
            type="range"
            aria-label={`Độ đậm của ${nhan}`}
            min={0}
            max={100}
            step={5}
            value={Math.round(doDam * 100)}
            onChange={(e) => sua({ doDam: Number(e.target.value) / 100 })}
            className="flex-1"
          />
          <span className="w-10 text-right tabular-nums">{Math.round(doDam * 100)}%</span>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          Màu
          <input
            type="color"
            aria-label={`Màu của ${nhan}`}
            value={giaTri?.mau ?? theme.mau.phu}
            onChange={(e) => sua({ mau: e.target.value })}
            className="h-8 w-10 rounded border"
          />
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            aria-label={`Đưa ${nhan} ra sau chữ`}
            checked={giaTri?.raSauChu ?? macDinh.raSauChu}
            onChange={(e) => sua({ raSauChu: e.target.checked })}
          />
          Ra sau chữ
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            aria-label={`Ẩn ${nhan}`}
            checked={giaTri?.an ?? false}
            onChange={(e) => sua({ an: e.target.checked })}
          />
          Ẩn
        </label>
      </div>
    </div>
  )
}
