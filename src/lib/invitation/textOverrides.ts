import type { TextRegionId, TuyChinhChu, TuyChinhVungChu } from './textTypes'

export function capNhatVungChu(
  hienTai: TuyChinhChu | undefined,
  id: TextRegionId,
  thayDoi: Partial<TuyChinhVungChu>,
): TuyChinhChu | undefined {
  const vungMoi = { ...hienTai?.[id], ...thayDoi }

  for (const key of Object.keys(vungMoi) as (keyof TuyChinhVungChu)[]) {
    if (vungMoi[key] === undefined) {
      delete vungMoi[key]
    }
  }

  const ketQua = { ...hienTai }
  if (Object.keys(vungMoi).length === 0) {
    delete ketQua[id]
  } else {
    ketQua[id] = vungMoi
  }

  return Object.keys(ketQua).length === 0 ? undefined : ketQua
}

export function xoaOverrideTheoPrefix(
  hienTai: TuyChinhChu | undefined,
  prefix: string,
): TuyChinhChu | undefined {
  if (!hienTai) return undefined

  const ketQua = Object.fromEntries(
    Object.entries(hienTai).filter(([id]) => !id.startsWith(prefix)),
  ) as TuyChinhChu

  return Object.keys(ketQua).length === 0 ? undefined : ketQua
}

const clamp = (n: number) => Math.max(-100, Math.min(100, Math.round(n * 10) / 10))

export function deltaSangToaDo(
  deltaX: number,
  deltaY: number,
  rongKhung: number,
  banDau: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: clamp(banDau.x + (deltaX / rongKhung) * 100),
    y: clamp(banDau.y + (deltaY / rongKhung) * 100),
  }
}
