'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react'
import type { Anh, Ben } from '@/lib/invitation/types'
import { mauQrAnToan, resolveCauHinhQr } from '@/lib/qr/cauHinh'
import { taoPngQr } from '@/lib/qr/xuLyAnh'
import type { CauHinhQrTheme, KieuKhungQr, TuyChinhQr } from '@/lib/qr/types'
import styles from './QrTuyChinh.module.css'

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

const LOP_KIEU: Record<KieuKhungQr, string> = {
  'toi-gian': styles.toiGian,
  'hoa-mem': styles.hoaMem,
  'phong-bao': styles.phongBao,
}

export function QrTuyChinh({
  anh,
  themeQr,
  kieuKhungThiep,
  tuyChinh,
  ben,
  choTai = false,
  classNameTai,
}: {
  anh: Anh
  themeQr: CauHinhQrTheme
  kieuKhungThiep?: KieuKhungQr
  tuyChinh?: TuyChinhQr
  ben: Ben
  choTai?: boolean
  classNameTai?: string
}) {
  const kichHoat = Boolean(kieuKhungThiep || tuyChinh)
  const cauHinh = useMemo(
    () => mauQrAnToan(resolveCauHinhQr(themeQr, kieuKhungThiep, tuyChinh)),
    [themeQr, kieuKhungThiep, tuyChinh],
  )
  const [anhPreview, setAnhPreview] = useState<string>()

  useEffect(() => {
    if (!kichHoat) return
    let url: string | undefined
    let daHuy = false
    void taoPngQr(anh.url, cauHinh).then((blob) => {
      if (!blob || daHuy) return
      url = URL.createObjectURL(blob)
      setAnhPreview(url)
    })
    return () => {
      daHuy = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [anh.url, cauHinh, kichHoat])

  async function taiAnh(event: MouseEvent<HTMLAnchorElement>) {
    if (!kichHoat) return
    event.preventDefault()
    const blob = await taoPngQr(anh.url, cauHinh)
    if (!blob) {
      const link = document.createElement('a')
      link.href = anh.url
      link.download = `qr-${ben}.png`
      link.click()
      return
    }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-${ben}.png`
    link.click()
    URL.revokeObjectURL(url)
  }

  const noiDung = (
    <Image
      src={anhPreview ?? anh.url}
      alt={anh.moTa}
      width={220}
      height={220}
      unoptimized={Boolean(anhPreview)}
      className={kichHoat ? styles.anh : 'mx-auto h-28 w-28 object-contain md:h-36 md:w-36'}
    />
  )

  return (
    <>
      {kichHoat ? (
        <div
          data-testid="khung-qr-tuy-chinh"
          data-kieu-qr={cauHinh.kieuKhung}
          data-mau-fallback={String(cauHinh.coCanhBao)}
          className={`${styles.khung} ${LOP_KIEU[cauHinh.kieuKhung]}`}
          style={
            {
              '--qr-color': cauHinh.mauQr,
              '--qr-bg': cauHinh.mauNen,
            } as CSSProperties
          }
        >
          <div className={styles.quietZone}>{noiDung}</div>
        </div>
      ) : (
        noiDung
      )}
      {choTai && (
        <a
          href={anh.url}
          download={`qr-${ben}.png`}
          aria-label={`Tải QR ${TEN_BEN[ben]}`}
          onClick={taiAnh}
          className={classNameTai}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
            <path
              d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        </a>
      )}
    </>
  )
}
