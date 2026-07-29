'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Invitation } from '@/lib/invitation/types'
import type { Theme } from '@/lib/themes'
import type { LoiChucDayDu } from '@/lib/db/loiChuc'
import { resolveSections } from '@/lib/invitation/sections'
import { SECTION_REGISTRY } from './sections/registry'
import { NutRsvpNoi } from './NutRsvpNoi'
import { LopTrangTri } from './LopTrangTri'
import { PopupRsvp } from './PopupRsvp'
import { gioiHanBatDau, layKetThucDoan } from '@/lib/nhac/doanNhac'

/**
 * Dựng thiệp từ dữ liệu. Hàm thuần theo (thiep, theme): không đọc DB,
 * không gọi Google, không biết gì về trang quản trị.
 */
export function InvitationRenderer({
  thiep,
  theme,
  loiChuc = [],
}: {
  thiep: Invitation
  theme: Theme
  loiChuc?: LoiChucDayDu[]
}) {
  const danhSach = resolveSections(theme.thuTuSection, thiep.sections)
  const [daMo, setDaMo] = useState(false)
  const [moRsvp, setMoRsvp] = useState(false)
  const [dangPhatNhac, setDangPhatNhac] = useState(false)
  const nhac = useRef<HTMLAudioElement>(null)

  function duaVeDauDoanNeuCan(audio: HTMLAudioElement): void {
    if (!thiep.nhac?.thoiLuong || !Number.isFinite(audio.duration)) return
    const batDau = gioiHanBatDau(
      thiep.nhac.batDau ?? 0,
      thiep.nhac.thoiLuong,
      audio.duration,
    )
    const ketThuc = layKetThucDoan(batDau, thiep.nhac.thoiLuong, audio.duration)
    if (audio.currentTime < batDau || audio.currentTime >= ketThuc) {
      audio.currentTime = batDau
    }
  }

  function moThiep() {
    setDaMo(true)
    if (!nhac.current) return
    duaVeDauDoanNeuCan(nhac.current)
    const ketQua = nhac.current.play()
    setDangPhatNhac(true)
    ketQua?.catch(() => setDangPhatNhac(false))
  }

  function batTatNhac() {
    if (!nhac.current) return
    if (nhac.current.paused) {
      duaVeDauDoanNeuCan(nhac.current)
      const ketQua = nhac.current.play()
      setDangPhatNhac(true)
      ketQua?.catch(() => setDangPhatNhac(false))
    } else {
      nhac.current.pause()
      setDangPhatNhac(false)
    }
  }

  // Khóa cuộn cho tới khi khách bấm "Mở thiệp". Cú chạm đó cũng là thứ
  // hợp thức hóa việc phát nhạc, vì trình duyệt mobile chặn tự động phát.
  useEffect(() => {
    document.body.classList.toggle('khoa-cuon', !daMo)
    return () => document.body.classList.remove('khoa-cuon')
  }, [daMo])

  // Tùy chỉnh của từng thiệp ghi đè giá trị của theme; thiếu thì lấy theme.
  const tc = thiep.tuyChinhGiaoDien ?? {}
  const doDam = { ...theme.doDam, ...(tc.doDam ?? {}) }

  const style = {
    '--mau-nen': tc.mauNen ?? theme.mau.nen,
    '--mau-chu': theme.mau.chu,
    '--mau-chinh': tc.mauChinh ?? theme.mau.chinh,
    '--mau-phu': tc.mauPhu ?? theme.mau.phu,
    '--mau-nhan': theme.mau.nhan,
    '--font-tieu-de': theme.font.tieuDe,
    '--font-noi-dung': theme.font.noiDung,
    // HoaTiet đọc các biến này để đặt độ đậm cho từng vị trí.
    ...Object.fromEntries(
      Object.entries(doDam).map(([slot, v]) => [`--do-dam-${slot}`, String(v)]),
    ),
    backgroundColor: 'var(--mau-nen)',
    color: 'var(--mau-chu)',
    fontFamily: 'var(--font-noi-dung)',
  } as CSSProperties

  return (
    <div data-invitation-root style={style}>
      <main className="mx-auto w-full max-w-[520px]">
        {/*
          Trước khi khách bấm "Mở thiệp" chỉ có bìa tồn tại. Các phần sau không
          render, nên không tải ảnh và cũng không lộ nội dung nếu khách kéo lướt.
        */}
        {(daMo ? danhSach : danhSach.filter((id) => id === 'bia')).map((id) => {
          const Section = SECTION_REGISTRY[id]
          const rieng =
            id === 'bia' ? { onMoThiep: moThiep }
            : id === 'rsvp' ? { onMoRsvp: () => setMoRsvp(true) }
            : id === 'so-luu-but' ? { loiChuc }
            : {}
          const trangTri = (thiep.chiTietTrangTri ?? []).filter((ct) => ct.section === id)

          return (
            <div key={id} className="relative isolate">
              {/* Nội dung ở lớp 10 để chi tiết trang trí đặt được cả trước lẫn sau chữ. */}
              <div className="relative z-10">
                <Section thiep={thiep} theme={theme} {...rieng} />
              </div>
              <LopTrangTri chiTiet={trangTri} />
            </div>
          )
        })}
      </main>

      {thiep.nhac && (
        <audio
          ref={nhac}
          src={thiep.nhac.url}
          loop={!thiep.nhac.thoiLuong}
          preload="metadata"
          onLoadedMetadata={(e) => duaVeDauDoanNeuCan(e.currentTarget)}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget
            if (!thiep.nhac?.thoiLuong || !Number.isFinite(audio.duration)) return
            const batDau = gioiHanBatDau(
              thiep.nhac.batDau ?? 0,
              thiep.nhac.thoiLuong,
              audio.duration,
            )
            const ketThuc = layKetThucDoan(
              batDau,
              thiep.nhac.thoiLuong,
              audio.duration,
            )
            if (audio.currentTime >= ketThuc) {
              audio.currentTime = batDau
            }
          }}
          onPlay={() => setDangPhatNhac(true)}
          onPause={() => setDangPhatNhac(false)}
        />
      )}
      {daMo && thiep.nhac && (
        <button
          type="button"
          onClick={batTatNhac}
          aria-label={dangPhatNhac ? 'Tắt nhạc' : 'Phát nhạc'}
          className="fixed right-5 top-5 z-40 grid h-11 w-11 place-items-center rounded-full border bg-white/85 text-lg shadow-lg backdrop-blur-sm"
          style={{ color: 'var(--mau-chinh)', borderColor: 'var(--mau-chinh)' }}
        >
          {dangPhatNhac ? '♫' : '♪'}
        </button>
      )}
      {daMo && danhSach.includes('rsvp') && <NutRsvpNoi onMo={() => setMoRsvp(true)} />}
      {moRsvp && <PopupRsvp thiep={thiep} onDong={() => setMoRsvp(false)} />}
    </div>
  )
}
