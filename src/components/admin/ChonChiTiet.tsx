'use client'

import { useMemo, useState } from 'react'
import type { ChiTietTrangTri, SectionId } from '@/lib/invitation/types'
import { DANH_SACH_HOA_TIET, layHoaTiet } from '@/lib/motifs/danhSach'
import { HoaTiet } from '@/components/HoaTiet'
import { TEN_SECTION } from './SapXepSection'

/** Vài vị trí hay dùng, bấm một cái là nhảy tới, sau đó vẫn kéo tinh chỉnh được. */
const VI_TRI_NHANH: { nhan: string; x: number; y: number }[] = [
  { nhan: 'Trên', x: 50, y: 4 },
  { nhan: 'Dưới', x: 50, y: 96 },
  { nhan: 'Trái', x: 8, y: 50 },
  { nhan: 'Phải', x: 92, y: 50 },
  { nhan: 'Giữa', x: 50, y: 50 },
]

const MOI: Omit<ChiTietTrangTri, 'id' | 'section'> = {
  x: 50,
  y: 8,
  mau: '#8B2F20',
  doDam: 1,
  kichThuoc: 25,
  raSauChu: true,
}

export function ChonChiTiet({
  giaTri,
  section,
  onDoi,
}: {
  giaTri: ChiTietTrangTri[]
  section: SectionId
  onDoi: (v: ChiTietTrangTri[]) => void
}) {
  const [dangMoChon, setDangMoChon] = useState(false)
  const [nhomDangXem, setNhomDangXem] = useState(DANH_SACH_HOA_TIET[0]?.nhom ?? '')

  const nhom = useMemo(() => [...new Set(DANH_SACH_HOA_TIET.map((m) => m.nhom))], [])
  const trongNhom = useMemo(
    () => DANH_SACH_HOA_TIET.filter((m) => m.nhom === nhomDangXem),
    [nhomDangXem],
  )

  const cuaPhanNay = giaTri
    .map((ct, viTriTrongMang) => ({ ct, viTriTrongMang }))
    .filter(({ ct }) => ct.section === section)

  function them(id: string) {
    onDoi([...giaTri, { ...MOI, id, section }])
    setDangMoChon(false)
  }

  function sua(i: number, thayDoi: Partial<ChiTietTrangTri>) {
    onDoi(giaTri.map((ct, j) => (j === i ? { ...ct, ...thayDoi } : ct)))
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Chi tiết thêm vào phần <strong>{TEN_SECTION[section]}</strong>. Kéo hai thanh trượt để
        đặt vào bất kỳ chỗ nào trong phần đó.
      </p>

      {cuaPhanNay.length > 0 && (
        <ul className="mt-3 space-y-3">
          {cuaPhanNay.map(({ ct, viTriTrongMang: i }) => {
            const muc = layHoaTiet(ct.id)
            const ten = muc?.nhan ?? ct.id

            return (
              <li key={i} className="rounded border p-3">
                <div className="flex items-center gap-3">
                  {muc && (
                    <HoaTiet
                      tep={muc.tep}
                      mau={ct.mau}
                      doDam={ct.doDam}
                      className="block h-10 w-10 shrink-0"
                    />
                  )}
                  <span className="flex-1 text-sm">{muc ? ten : `(thiếu: ${ct.id})`}</span>
                  <input
                    type="color"
                    aria-label={`Màu của ${ten}`}
                    value={ct.mau}
                    onChange={(e) => sua(i, { mau: e.target.value })}
                    className="h-8 w-10 rounded border"
                  />
                  <button
                    type="button"
                    aria-label={`Bỏ chi tiết ${ten}`}
                    onClick={() => onDoi(giaTri.filter((_, j) => j !== i))}
                    className="text-sm underline"
                  >
                    Bỏ
                  </button>
                </div>

                {/* Bản đồ thu nhỏ: chấm cho biết chi tiết đang nằm ở đâu trong phần. */}
                <div className="mt-3 flex gap-3">
                  <div
                    aria-hidden="true"
                    className="relative h-20 w-14 shrink-0 rounded border bg-neutral-50"
                  >
                    <span
                      className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{ left: `${ct.x}%`, top: `${ct.y}%`, backgroundColor: ct.mau }}
                    />
                  </div>

                  <div className="flex-1 space-y-2 text-sm">
                    <label className="flex items-center gap-2">
                      <span className="w-16">Ngang</span>
                      <input
                        type="range"
                        aria-label={`Vị trí ngang của ${ten}`}
                        min={0}
                        max={100}
                        value={ct.x}
                        onChange={(e) => sua(i, { x: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-10 text-right tabular-nums">{ct.x}%</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <span className="w-16">Dọc</span>
                      <input
                        type="range"
                        aria-label={`Vị trí dọc của ${ten}`}
                        min={0}
                        max={100}
                        value={ct.y}
                        onChange={(e) => sua(i, { y: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-10 text-right tabular-nums">{ct.y}%</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <span className="w-16">Cỡ</span>
                      <input
                        type="range"
                        aria-label={`Kích thước của ${ten}`}
                        min={5}
                        max={100}
                        value={ct.kichThuoc}
                        onChange={(e) => sua(i, { kichThuoc: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="w-10 text-right tabular-nums">{ct.kichThuoc}%</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <span className="w-16">Đậm</span>
                      <input
                        type="range"
                        aria-label={`Độ đậm của ${ten}`}
                        min={0}
                        max={100}
                        step={5}
                        value={Math.round(ct.doDam * 100)}
                        onChange={(e) => sua(i, { doDam: Number(e.target.value) / 100 })}
                        className="flex-1"
                      />
                      <span className="w-10 text-right tabular-nums">
                        {Math.round(ct.doDam * 100)}%
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {VI_TRI_NHANH.map((v) => (
                    <button
                      key={v.nhan}
                      type="button"
                      onClick={() => sua(i, { x: v.x, y: v.y })}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      {v.nhan}
                    </button>
                  ))}

                  <label className="ml-auto flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      aria-label={`Đưa ${ten} ra sau chữ`}
                      checked={ct.raSauChu ?? false}
                      onChange={(e) => sua(i, { raSauChu: e.target.checked || undefined })}
                    />
                    Ra sau chữ
                  </label>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {dangMoChon ? (
        <div className="mt-3 rounded border p-3">
          <select
            aria-label="Nhóm chi tiết"
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

          <div className="mt-3 grid max-h-64 grid-cols-4 gap-2 overflow-y-auto">
            {trongNhom.map((m) => (
              <button
                key={m.id}
                type="button"
                title={m.nhan}
                aria-label={`Thêm ${m.nhan}`}
                onClick={() => them(m.id)}
                className="flex aspect-square items-center justify-center rounded border p-1 hover:bg-neutral-100"
              >
                <HoaTiet tep={m.tep} mau="#333333" className="block h-full w-full" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDangMoChon(false)}
            className="mt-3 w-full rounded border py-1.5 text-sm"
          >
            Đóng
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDangMoChon(true)}
          className="mt-3 w-full rounded border py-2 text-sm"
        >
          Thêm chi tiết
        </button>
      )}
    </div>
  )
}
