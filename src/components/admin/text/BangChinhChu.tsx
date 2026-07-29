'use client'

import {
  useMemo,
  useState,
  type ChangeEvent,
  type ReactElement,
} from 'react'
import { FONT_CHU_OPTIONS } from '@/lib/invitation/fonts'
import { capNhatVungChu } from '@/lib/invitation/textOverrides'
import {
  lietKeVungChu,
  type MoTaVungChu,
} from '@/lib/invitation/textRegions'
import type {
  FontChu,
  TextRegionId,
  TuyChinhVungChu,
} from '@/lib/invitation/textTypes'
import type { Invitation, SectionId } from '@/lib/invitation/types'
import { parseSoNhap } from './numberInput'

const TEN_NHOM: Record<SectionId | 'popup', string> = {
  bia: 'Bìa',
  'dem-nguoc': 'Đếm ngược',
  'co-dau-chu-re': 'Cô dâu và chú rể',
  'chuyen-chung-minh': 'Chuyện chúng mình',
  album: 'Album',
  'su-kien': 'Sự kiện',
  'dress-code': 'Dress code',
  rsvp: 'RSVP',
  'mung-cuoi': 'Mừng cưới',
  'so-luu-but': 'Sổ lưu bút',
  popup: 'Popup',
}

type Props = {
  thiep: Invitation
  dangChon: TextRegionId | null
  onChon: (id: TextRegionId | null) => void
  onDoi: (thiep: Invitation) => void
}

type BanNhap = {
  nguon: string
  raw: string
  nguonDuKien: string | null
}

/**
 * Giữ bản nhập dở dang khi nguồn chưa đổi. Một commit nội bộ được đánh dấu
 * bằng nguồn dự kiến để prop cập nhật không làm mất caret; mọi thay đổi nguồn
 * khác sẽ thay hẳn draft, kể cả khi nguồn sau đó quay về giá trị cũ.
 */
function useBanNhap(
  nguon: string,
): readonly [string, (raw: string, nguonDuKien?: string) => void] {
  const [banNhap, setBanNhap] = useState<BanNhap>({
    nguon,
    raw: nguon,
    nguonDuKien: null,
  })
  let hienTai = banNhap

  if (banNhap.nguon !== nguon) {
    hienTai = {
      nguon,
      raw: banNhap.nguonDuKien === nguon ? banNhap.raw : nguon,
      nguonDuKien: null,
    }
    setBanNhap(hienTai)
  }

  return [
    hienTai.raw,
    (raw, nguonDuKien) =>
      setBanNhap({
        nguon,
        raw,
        nguonDuKien: nguonDuKien ?? null,
      }),
  ]
}

function OSo({
  nhan,
  giaTri,
  min,
  max,
  onHopLe,
}: {
  nhan: string
  giaTri: number | undefined
  min: number
  max: number
  onHopLe: (giaTri: number) => void
}) {
  const nguon = giaTri === undefined ? '' : String(giaTri)
  const [raw, setRaw] = useBanNhap(nguon)

  function doi(event: ChangeEvent<HTMLInputElement>) {
    const rawMoi = event.target.value
    const so = parseSoNhap(rawMoi, min, max)
    if (so === null) {
      setRaw(rawMoi)
      return
    }
    setRaw(rawMoi, String(so))
    onHopLe(so)
  }

  return (
    <label className="block text-sm">
      {nhan}
      <input
        type="text"
        inputMode="decimal"
        aria-label={nhan}
        value={raw}
        onChange={doi}
        className="mt-1 w-full rounded border px-2 py-1.5"
      />
    </label>
  )
}

const MAU_HOP_LE = /^#[0-9a-fA-F]{6}$/

function OMau({
  giaTri,
  onHopLe,
}: {
  giaTri: string | undefined
  onHopLe: (giaTri: string) => void
}) {
  const nguon = giaTri ?? ''
  const [raw, setRaw] = useBanNhap(nguon)
  const coLoi = raw !== '' && !MAU_HOP_LE.test(raw)
  const mauPicker = MAU_HOP_LE.test(nguon) ? nguon : '#000000'

  function commit(rawMoi: string) {
    if (!MAU_HOP_LE.test(rawMoi)) {
      setRaw(rawMoi)
      return
    }
    setRaw(rawMoi, rawMoi)
    onHopLe(rawMoi)
  }

  return (
    <div className="text-sm">
      <label className="block">
        Màu chữ
        <div className="mt-1 flex gap-2">
          <input
            type="color"
            aria-label="Bộ chọn màu chữ vùng chữ"
            value={mauPicker}
            onChange={(event) => commit(event.target.value)}
            className="h-9 w-12 rounded border"
          />
          <input
            type="text"
            aria-label="Màu chữ vùng chữ"
            value={raw}
            placeholder="#RRGGBB"
            onChange={(event) => commit(event.target.value)}
            className="min-w-0 flex-1 rounded border px-2 py-1.5"
          />
        </div>
      </label>
      {coLoi && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          Mã màu phải có dạng #RRGGBB.
        </p>
      )}
    </div>
  )
}

function DieuKhienVungChu({
  thiep,
  moTa,
  onDoi,
}: {
  thiep: Invitation
  moTa: MoTaVungChu
  onDoi: (thiep: Invitation) => void
}) {
  const override = thiep.tuyChinhChu?.[moTa.id]
  const noiDung = moTa.capNhatNoiDung
    ? moTa.noiDung
    : override?.noiDung ?? moTa.noiDung

  function suaOverride(thayDoi: Partial<TuyChinhVungChu>) {
    onDoi({
      ...thiep,
      tuyChinhChu: capNhatVungChu(
        thiep.tuyChinhChu,
        moTa.id,
        thayDoi,
      ),
    })
  }

  function suaNoiDung(giaTri: string) {
    if (!moTa.choSuaNoiDung) return
    if (moTa.capNhatNoiDung) {
      const daCapNhat = moTa.capNhatNoiDung(thiep, giaTri)
      onDoi({
        ...daCapNhat,
        tuyChinhChu: capNhatVungChu(
          daCapNhat.tuyChinhChu,
          moTa.id,
          { noiDung: undefined },
        ),
      })
      return
    }
    suaOverride({ noiDung: giaTri })
  }

  return (
    <div className="mt-4 rounded border bg-neutral-50 p-3">
      <p className="text-sm font-medium">{moTa.nhan}</p>
      <p className="text-xs text-neutral-500">{moTa.id}</p>

      <label className="mt-3 block text-sm">
        Nội dung
        <textarea
          aria-label="Nội dung vùng chữ"
          value={noiDung}
          disabled={!moTa.choSuaNoiDung}
          onChange={(event) => suaNoiDung(event.target.value)}
          className="mt-1 min-h-20 w-full rounded border px-2 py-1.5 disabled:bg-neutral-100"
        />
      </label>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="block text-sm">
          Phông chữ
          <select
            aria-label="Phông chữ vùng chữ"
            value={override?.font ?? ''}
            onChange={(event) =>
              suaOverride({
                font: (event.target.value || undefined) as
                  | FontChu
                  | undefined,
              })
            }
            className="mt-1 w-full rounded border px-2 py-1.5"
          >
            <option value="">Theo giao diện</option>
            {FONT_CHU_OPTIONS.map((luaChon) => (
              <option key={luaChon.id} value={luaChon.id}>
                {luaChon.nhan}
              </option>
            ))}
          </select>
        </label>

        <OSo
          nhan="Cỡ chữ vùng chữ"
          giaTri={override?.coChu}
          min={8}
          max={120}
          onHopLe={(coChu) => suaOverride({ coChu })}
        />
        <OSo
          nhan="Tọa độ X vùng chữ"
          giaTri={override?.x}
          min={-100}
          max={100}
          onHopLe={(x) => suaOverride({ x })}
        />
        <OSo
          nhan="Tọa độ Y vùng chữ"
          giaTri={override?.y}
          min={-100}
          max={100}
          onHopLe={(y) => suaOverride({ y })}
        />
      </div>

      <div className="mt-3">
        <OMau
          giaTri={override?.mauChu}
          onHopLe={(mauChu) => suaOverride({ mauChu })}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          aria-label="Đặt lại vị trí vùng chữ"
          onClick={() => suaOverride({ x: undefined, y: undefined })}
          className="rounded border px-2 py-1.5 text-sm"
        >
          Đặt lại vị trí
        </button>
        <button
          type="button"
          aria-label="Đặt lại kiểu chữ vùng chữ"
          onClick={() =>
            suaOverride({
              font: undefined,
              coChu: undefined,
              mauChu: undefined,
            })
          }
          className="rounded border px-2 py-1.5 text-sm"
        >
          Đặt lại kiểu chữ
        </button>
      </div>
    </div>
  )
}

export function BangChinhChu({
  thiep,
  dangChon,
  onChon,
  onDoi,
}: Props): ReactElement {
  const danhSach = useMemo(() => lietKeVungChu(thiep), [thiep])
  const theoNhom = useMemo(() => {
    const ketQua = new Map<MoTaVungChu['section'], MoTaVungChu[]>()
    for (const moTa of danhSach) {
      const nhom = ketQua.get(moTa.section) ?? []
      nhom.push(moTa)
      ketQua.set(moTa.section, nhom)
    }
    return [...ketQua.entries()]
  }, [danhSach])
  const moTaDangChon = danhSach.find((moTa) => moTa.id === dangChon)

  return (
    <div>
      <p className="text-sm text-neutral-500">
        Chọn chữ trên thiệp hoặc trong danh sách để chỉnh nội dung và kiểu.
      </p>
      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {theoNhom.map(([section, cacVung]) => (
          <fieldset key={section} className="rounded border p-2">
            <legend className="px-1 text-sm font-medium">
              {TEN_NHOM[section]}
            </legend>
            <div className="flex flex-wrap gap-1">
              {cacVung.map((moTa) => (
                <button
                  key={moTa.id}
                  type="button"
                  aria-label={`Chọn vùng chữ ${moTa.id}`}
                  aria-pressed={dangChon === moTa.id}
                  onClick={() => onChon(moTa.id)}
                  className="rounded border px-2 py-1 text-left text-xs aria-pressed:bg-black aria-pressed:text-white"
                >
                  {moTa.nhan}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      {moTaDangChon && (
        <DieuKhienVungChu
          key={moTaDangChon.id}
          thiep={thiep}
          moTa={moTaDangChon}
          onDoi={onDoi}
        />
      )}
    </div>
  )
}
