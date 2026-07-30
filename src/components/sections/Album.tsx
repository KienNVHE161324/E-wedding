'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { SectionProps } from './types'
import { VungChu } from '@/components/text/VungChu'

export function Album({ thiep }: SectionProps) {
  const anh = thiep.album
  const [moTaiChiSo, setMoTaiChiSo] = useState<number | null>(null)

  useEffect(() => {
    if (moTaiChiSo === null) return

    function phim(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoTaiChiSo(null)
      if (e.key === 'ArrowRight') setMoTaiChiSo((v) => (v === null ? v : (v + 1) % anh.length))
      if (e.key === 'ArrowLeft') {
        setMoTaiChiSo((v) => (v === null ? v : (v - 1 + anh.length) % anh.length))
      }
    }

    document.addEventListener('keydown', phim)
    return () => document.removeEventListener('keydown', phim)
  }, [moTaiChiSo, anh.length])

  if (anh.length === 0) return null

  return (
    <section data-section="album" className="px-6 py-16">
      <h2
        className="text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        <VungChu id="album.tieu-de" thiep={thiep} noiDung="Album ảnh" />
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3">
        {anh.map((a, i) => (
          <button
            key={`${a.url}-${i}`}
            type="button"
            aria-label={`Xem ảnh ${i + 1}`}
            onClick={() => setMoTaiChiSo(i)}
            className="relative aspect-square overflow-hidden rounded"
          >
            <Image
              src={a.url}
              alt={a.moTa}
              fill
              sizes="(max-width: 768px) 45vw, 30vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {moTaiChiSo !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh lớn"
          data-chi-so={moTaiChiSo}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setMoTaiChiSo(null)}
        >
          <Image
            src={anh[moTaiChiSo].url}
            alt={anh[moTaiChiSo].moTa}
            width={1200}
            height={1600}
            className="max-h-[85vh] w-auto object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setMoTaiChiSo(null)}
            className="absolute top-4 right-4 h-11 w-11 text-2xl text-white"
          >
            ×
          </button>

          {anh.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Ảnh trước"
                onClick={(e) => {
                  e.stopPropagation()
                  setMoTaiChiSo((v) => (v! - 1 + anh.length) % anh.length)
                }}
                className="absolute left-2 h-11 w-11 text-3xl text-white"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Ảnh sau"
                onClick={(e) => {
                  e.stopPropagation()
                  setMoTaiChiSo((v) => (v! + 1) % anh.length)
                }}
                className="absolute right-2 h-11 w-11 text-3xl text-white"
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
