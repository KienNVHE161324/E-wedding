'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { SectionProps } from './types'
import type { Ben, OMungCuoi } from '@/lib/invitation/types'
import type { TextRegionId } from '@/lib/invitation/textTypes'
import { QrTuyChinh } from '@/components/qr/QrTuyChinh'
import { VungChu } from '@/components/text/VungChu'
import styles from './MungCuoi.module.css'

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

function VungMungCuoi({
  choDangKy,
  id,
  thiep,
  noiDung,
  className,
}: {
  choDangKy: boolean
  id: TextRegionId
  thiep: SectionProps['thiep']
  noiDung: ReactNode
  className?: string
}) {
  if (!choDangKy) {
    return <span className={className}>{noiDung}</span>
  }

  return (
    <VungChu
      id={id}
      thiep={thiep}
      noiDung={noiDung}
      className={className}
    />
  )
}

function BieuTuSaoChep({ daChep }: { daChep: boolean }) {
  return daChep ? (
    <span aria-hidden="true" className="text-sm">
      ✓
    </span>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function ThongTin({
  o,
  thiep,
  choDangKyVung,
  themeQr,
  kieuKhungThiep,
  kieuGon = false,
}: {
  o: OMungCuoi
  thiep: SectionProps['thiep']
  choDangKyVung: boolean
  themeQr: SectionProps['theme']['qr']
  kieuKhungThiep?: SectionProps['thiep']['kieuKhungQr']
  kieuGon?: boolean
}) {
  const [daChep, setDaChep] = useState(false)

  async function saoChep() {
    if (!navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(o.soTaiKhoan)
      setDaChep(true)
    } catch {
      setDaChep(false)
    }
  }

  return (
    <>
      {o.qrAnh && (
        <div className={kieuGon ? styles.khungQr : undefined}>
          <QrTuyChinh
            anh={o.qrAnh}
            themeQr={themeQr}
            kieuKhungThiep={kieuKhungThiep}
            tuyChinh={o.tuyChinhQr}
            ben={o.ben}
            choTai={kieuGon}
            classNameTai={styles.nutIconQr}
          />
        </div>
      )}
      <p className="mt-3 text-sm font-medium">
        <VungMungCuoi
          choDangKy={choDangKyVung}
          id={`mung-cuoi.${o.ben}.chu-tai-khoan`}
          thiep={thiep}
          noiDung={o.chuTaiKhoan}
        />
      </p>
      <p className={`${styles.dongNganHang} text-sm`} style={{ color: 'var(--mau-phu)' }}>
        <VungMungCuoi
          choDangKy={choDangKyVung}
          id={`mung-cuoi.${o.ben}.ngan-hang`}
          thiep={thiep}
          noiDung={o.nganHang}
          className={styles.dongNganHang}
        />
      </p>
      {kieuGon ? (
        <div className={styles.hangSoTaiKhoan}>
          <VungMungCuoi
            choDangKy={choDangKyVung}
            id={`mung-cuoi.${o.ben}.so-tai-khoan`}
            thiep={thiep}
            noiDung={o.soTaiKhoan}
            className={`${styles.giaTriSoTaiKhoan} text-sm tracking-wider`}
          />
          <button
            type="button"
            onClick={saoChep}
            aria-label={daChep ? 'Đã sao chép' : 'Sao chép số tài khoản'}
            className={styles.nutIcon}
          >
            <BieuTuSaoChep daChep={daChep} />
          </button>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm tracking-wider">
            <VungMungCuoi
              choDangKy={choDangKyVung}
              id={`mung-cuoi.${o.ben}.so-tai-khoan`}
              thiep={thiep}
              noiDung={o.soTaiKhoan}
            />
          </p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(o.soTaiKhoan)}
            className="mt-3 rounded-full border px-4 py-1.5 text-sm"
            style={{ borderColor: 'var(--mau-phu)', color: 'var(--mau-phu)' }}
          >
            <VungMungCuoi
              choDangKy={choDangKyVung}
              id={`mung-cuoi.${o.ben}.nut-sao-chep`}
              thiep={thiep}
              noiDung="Chép số tài khoản"
            />
          </button>
        </>
      )}
    </>
  )
}

function PhongBao({
  o,
  thiep,
  choDangKyVung,
  onMo,
}: {
  o: OMungCuoi
  thiep: SectionProps['thiep']
  choDangKyVung: boolean
  onMo: (o: OMungCuoi, nut: HTMLButtonElement) => void
}) {
  return (
    <button
      type="button"
      onClick={(event) => onMo(o, event.currentTarget)}
      aria-label={`Mở phong bao ${TEN_BEN[o.ben]}`}
      className={`${styles.nutPhongBao} ${o.ben === 'nha-gai' ? styles.lechNhip : ''}`}
    >
      <span className={styles.phongBao} aria-hidden="true">
        <span className={styles.thanPhongBao} />
        <span className={styles.napPhongBao} />
        <span className={styles.conDau}>囍</span>
      </span>
      <VungMungCuoi
        choDangKy={choDangKyVung}
        id={`mung-cuoi.${o.ben}.goi-y-mo`}
        thiep={thiep}
        noiDung="Chạm để mở"
        className={styles.goiY}
      />
    </button>
  )
}

function PopupMungCuoi({
  o,
  thiep,
  choDangKyVung,
  themeQr,
  kieuKhungThiep,
  onDong,
  noiRender,
}: {
  o: OMungCuoi
  thiep: SectionProps['thiep']
  choDangKyVung: boolean
  themeQr: SectionProps['theme']['qr']
  kieuKhungThiep?: SectionProps['thiep']['kieuKhungQr']
  onDong: () => void
  noiRender: Element
}) {
  const nutDongRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const overflowCu = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    nutDongRef.current?.focus()

    function xuLyBanPhim(event: KeyboardEvent) {
      if (event.key === 'Escape') onDong()
    }

    document.addEventListener('keydown', xuLyBanPhim)
    return () => {
      document.body.style.overflow = overflowCu
      document.removeEventListener('keydown', xuLyBanPhim)
    }
  }, [onDong])

  return createPortal(
    <div
      className={styles.nenPopup}
      data-testid="nen-popup-mung-cuoi"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDong()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Mừng cưới ${TEN_BEN[o.ben]}`}
        className={styles.popup}
      >
        <button
          ref={nutDongRef}
          type="button"
          onClick={onDong}
          aria-label="Đóng"
          className={styles.nutDong}
        >
          ×
        </button>
        <p className={styles.tieuDePopup}>
          <VungChu
            id="popup-mung-cuoi.tieu-de"
            thiep={thiep}
            noiDung="Mừng cưới"
          />
          <span> · {TEN_BEN[o.ben]}</span>
        </p>
        <ThongTin
          o={o}
          thiep={thiep}
          choDangKyVung={choDangKyVung}
          themeQr={themeQr}
          kieuKhungThiep={kieuKhungThiep}
          kieuGon
        />
      </div>
    </div>,
    noiRender,
  )
}

export function MungCuoi({ thiep, theme }: SectionProps) {
  const [dangMo, setDangMo] = useState<OMungCuoi | null>(null)
  const [noiRender, setNoiRender] = useState<Element | null>(null)

  function moPhongBao(o: OMungCuoi, nut: HTMLButtonElement) {
    setNoiRender(
      nut.closest('[data-invitation-root]') ?? nut.closest('section') ?? document.body,
    )
    setDangMo(o)
  }

  if (thiep.mungCuoi.length === 0) return null
  const soLanTheoBen = Map.groupBy(thiep.mungCuoi, (o) => o.ben)
  const benTrung = new Set(
    Array.from(soLanTheoBen)
      .filter(([, danhSach]) => danhSach.length > 1)
      .map(([ben]) => ben),
  )

  return (
    <section data-section="mung-cuoi" className="px-6 py-16 text-center">
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        <VungChu id="mung-cuoi.tieu-de" thiep={thiep} noiDung="Mừng cưới" />
      </h2>

      {/* Hai bên luôn nằm cạnh nhau trên một dòng, kể cả trên điện thoại. */}
      <div className="mt-6 flex items-start gap-3 md:gap-8">
        {thiep.mungCuoi.map((o, index) => (
          <div
            key={benTrung.has(o.ben) ? `${o.ben}-${index}` : o.ben}
            className="flex-1"
          >
            <p className="mb-3 text-sm tracking-widest" style={{ color: 'var(--mau-phu)' }}>
              <VungMungCuoi
                choDangKy={!benTrung.has(o.ben)}
                id={`mung-cuoi.${o.ben}.ten-ben`}
                thiep={thiep}
                noiDung={TEN_BEN[o.ben]}
              />
            </p>
            {thiep.mungCuoiKieuHopQua ? (
              <PhongBao
                o={o}
                thiep={thiep}
                choDangKyVung={!benTrung.has(o.ben)}
                onMo={moPhongBao}
              />
            ) : (
              <ThongTin
                o={o}
                thiep={thiep}
                choDangKyVung={!benTrung.has(o.ben)}
                themeQr={theme.qr}
                kieuKhungThiep={thiep.kieuKhungQr}
              />
            )}
          </div>
        ))}
      </div>
      {dangMo && noiRender && (
        <PopupMungCuoi
          o={dangMo}
          thiep={thiep}
          choDangKyVung={!benTrung.has(dangMo.ben)}
          themeQr={theme.qr}
          kieuKhungThiep={thiep.kieuKhungQr}
          onDong={() => setDangMo(null)}
          noiRender={noiRender}
        />
      )}
    </section>
  )
}
