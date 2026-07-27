'use client'

import { useMemo, useState } from 'react'
import type { ChiTietTrangTri, SectionId, ViTriChiTiet } from '@/lib/invitation/types'
import { DANH_SACH_HOA_TIET, layHoaTiet } from '@/lib/motifs/danhSach'
import { HoaTiet } from '@/components/HoaTiet'
import { TEN_SECTION } from './SapXepSection'

const TEN_VI_TRI: Record<ViTriChiTiet, string> = {
  tren: 'Trên',
  duoi: 'Dưới',
  trai: 'Trái',
  phai: 'Phải',
  nen: 'Nền',
}

const MOI: Omit<ChiTietTrangTri, 'id' | 'section'> = {
  viTri: 'tren',
  mau: '#8B2F20',
  doDam: 1,
  kichThuoc: 25,
}

export function ChonChiTiet({
  giaTri,
  section,
  onDoi,
}: {
  giaTri: ChiTietTrangTri[]
  /** Đang sửa chi tiết cho phần nào. */
  section: SectionId
  onDoi: (v: ChiTietTrangTri[]) => void
}) {
  const [dangMoChon, setDangMoChon] = useState(false)
  const [nhomDangXem, setNhomDangXem] = useState(DANH_SACH_HOA_TIET[0]?.nhom ?? '')

  const nhom = useMemo(
    () => [...new Set(DANH_SACH_HOA_TIET.map((m) => m.nhom))],
    [],
  )
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

  function sua(viTriTrongMang: number, thayDoi: Partial<ChiTietTrangTri>) {
    onDoi(giaTri.map((ct, i) => (i === viTriTrongMang ? { ...ct, ...thayDoi } : ct)))
  }

  function xoa(viTriTrongMang: number) {
    onDoi(giaTri.filter((_, i) => i !== viTriTrongMang))
  }

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Chi tiết thêm vào phần <strong>{TEN_SECTION[section]}</strong>. Mỗi chi tiết chọn được
        màu riêng.
      </p>

      {cuaPhanNay.length > 0 && (
        <ul className="mt-3 space-y-3">
          {cuaPhanNay.map(({ ct, viTriTrongMang }) => {
            const muc = layHoaTiet(ct.id)
            return (
              <li key={viTriTrongMang} className="rounded border p-3">
                <div className="flex items-center gap-3">
                  {muc && (
                    <HoaTiet
                      tep={muc.tep}
                      mau={ct.mau}
                      doDam={ct.doDam}
                      className="block h-10 w-10 shrink-0"
                    />
                  )}
                  <span className="flex-1 text-sm">{muc?.nhan ?? `(thiếu: ${ct.id})`}</span>
                  <button
                    type="button"
                    aria-label={`Bỏ chi tiết ${muc?.nhan ?? ct.id}`}
                    onClick={() => xoa(viTriTrongMang)}
                    className="text-sm underline"
                  >
                    Bỏ
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <label>
                    Màu
                    <input
                      type="color"
                      aria-label={`Màu của ${muc?.nhan ?? ct.id}`}
                      value={ct.mau}
                      onChange={(e) => sua(viTriTrongMang, { mau: e.target.value })}
                      className="mt-1 h-9 w-full rounded border"
                    />
                  </label>

                  <label>
                    Vị trí
                    <select
                      aria-label={`Vị trí của ${muc?.nhan ?? ct.id}`}
                      value={ct.viTri}
                      onChange={(e) =>
                        sua(viTriTrongMang, { viTri: e.target.value as ViTriChiTiet })
                      }
                      className="mt-1 w-full rounded border px-2 py-1.5"
                    >
                      {Object.entries(TEN_VI_TRI).map(([giaTriVT, nhan]) => (
                        <option key={giaTriVT} value={giaTriVT}>
                          {nhan}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="col-span-2 flex items-center gap-2">
                    <span className="w-20">Độ đậm</span>
                    <input
                      type="range"
                      aria-label={`Độ đậm của ${muc?.nhan ?? ct.id}`}
                      min={0}
                      max={100}
                      step={5}
                      value={Math.round(ct.doDam * 100)}
                      onChange={(e) =>
                        sua(viTriTrongMang, { doDam: Number(e.target.value) / 100 })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right tabular-nums">
                      {Math.round(ct.doDam * 100)}%
                    </span>
                  </label>

                  <label className="col-span-2 flex items-center gap-2">
                    <span className="w-20">Kích thước</span>
                    <input
                      type="range"
                      aria-label={`Kích thước của ${muc?.nhan ?? ct.id}`}
                      min={5}
                      max={100}
                      step={5}
                      value={ct.kichThuoc}
                      onChange={(e) =>
                        sua(viTriTrongMang, { kichThuoc: Number(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right tabular-nums">{ct.kichThuoc}%</span>
                  </label>

                  <label className="col-span-2 flex items-center gap-2">
                    <span className="w-20">Dịch ngang</span>
                    <input
                      type="range"
                      aria-label={`Dịch ngang ${muc?.nhan ?? ct.id}`}
                      min={-50}
                      max={50}
                      step={1}
                      value={ct.dichNgang ?? 0}
                      onChange={(e) =>
                        sua(viTriTrongMang, { dichNgang: Number(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="w-12 text-right tabular-nums">{ct.dichNgang ?? 0}</span>
                  </label>

                  <label className="col-span-2 flex items-center gap-2">
                    <span className="w-20">Dịch dọc</span>
                    <input
                      type="range"
                      aria-label={`Dịch dọc ${muc?.nhan ?? ct.id}`}
                      min={-50}
                      max={50}
                      step={1}
                      value={ct.dichDoc ?? 0}
                      onChange={(e) => sua(viTriTrongMang, { dichDoc: Number(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="w-12 text-right tabular-nums">{ct.dichDoc ?? 0}</span>
                  </label>

                  <label className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      aria-label={`Đưa ${muc?.nhan ?? ct.id} ra sau chữ`}
                      checked={ct.raSauChu ?? false}
                      onChange={(e) =>
                        sua(viTriTrongMang, { raSauChu: e.target.checked || undefined })
                      }
                    />
                    Đưa ra sau chữ
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      sua(viTriTrongMang, { dichNgang: 0, dichDoc: 0 })
                    }
                    className="col-span-2 rounded border py-1 text-sm"
                  >
                    Đưa về vị trí gốc
                  </button>
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
