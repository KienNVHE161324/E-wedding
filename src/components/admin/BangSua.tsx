'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Invitation } from '@/lib/invitation/types'
import type { SlotHoaTiet } from '@/lib/themes/types'
import type { VongDoi } from '@/lib/vongDoi/types'
import { THEMES, layTheme } from '@/lib/themes'
import { InvitationRenderer } from '@/components/InvitationRenderer'
import { SapXepSection } from './SapXepSection'
import { ThanhDoDam } from './ThanhDoDam'
import { OAnh } from './OAnh'
import { NutXuatBan } from './NutXuatBan'

/** Các vị trí họa tiết đủ dễ hiểu để người không rành thiết kế vẫn chỉnh được. */
const SLOT_HIEN_THI: { slot: SlotHoaTiet; nhan: string }[] = [
  { slot: 'cover-frame', nhan: 'Khung bìa' },
  { slot: 'divider', nhan: 'Dải phân cách' },
  { slot: 'corner', nhan: 'Góc trang trí' },
  { slot: 'watermark', nhan: 'Họa tiết nền' },
]

export function BangSua({ banDau, vongDoi }: { banDau: Invitation; vongDoi: VongDoi }) {
  const [thiep, setThiep] = useState(banDau)
  const [trangThai, setTrangThai] = useState('')

  function sua<K extends keyof Invitation>(khoa: K, giaTri: Invitation[K]) {
    setThiep((t) => ({ ...t, [khoa]: giaTri }))
  }

  function suaDoDam(slot: SlotHoaTiet, v: number) {
    setThiep((t) => ({
      ...t,
      tuyChinhGiaoDien: {
        ...t.tuyChinhGiaoDien,
        doDam: { ...t.tuyChinhGiaoDien?.doDam, [slot]: v },
      },
    }))
  }

  async function luu() {
    setTrangThai('Đang lưu...')
    const res = await fetch('/api/admin/luu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(thiep),
    })
    const data = await res.json().catch(() => ({}))
    setTrangThai(res.ok ? 'Đã lưu' : `Lỗi: ${data.loi ?? 'không rõ'}`)
  }

  const o = 'mt-1 w-full rounded border px-3 py-2'
  const theme = layTheme(thiep.themeId)

  return (
    <div className="flex h-screen flex-col lg:flex-row">
      <div className="space-y-6 overflow-y-auto border-r p-5 lg:w-[420px]">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-sm underline">
            ← Danh sách
          </Link>
          <button onClick={luu} className="rounded bg-black px-4 py-2 text-white">
            Lưu
          </button>
          <span className="text-sm">{trangThai}</span>
        </div>

        <NutXuatBan slug={thiep.slug} vongDoi={vongDoi} />

        <section>
          <h3 className="font-semibold">Giao diện</h3>
          <select
            aria-label="Giao diện"
            className={o}
            value={thiep.themeId}
            onChange={(e) => sua('themeId', e.target.value)}
          >
            {Object.values(THEMES).map((t) => (
              <option key={t.id} value={t.id}>
                {t.ten}
              </option>
            ))}
          </select>
        </section>

        <section>
          <h3 className="font-semibold">Thông tin chính</h3>
          <label className="mt-2 block text-sm">
            Tên chú rể
            <input
              className={o}
              value={thiep.chuRe.ten}
              onChange={(e) => sua('chuRe', { ...thiep.chuRe, ten: e.target.value })}
            />
          </label>
          <label className="mt-2 block text-sm">
            Tên cô dâu
            <input
              className={o}
              value={thiep.coDau.ten}
              onChange={(e) => sua('coDau', { ...thiep.coDau, ten: e.target.value })}
            />
          </label>
          <label className="mt-2 block text-sm">
            Ngày cưới
            <input
              type="date"
              className={o}
              value={thiep.ngayCuoi}
              onChange={(e) => sua('ngayCuoi', e.target.value)}
            />
          </label>
        </section>

        <section>
          <h3 className="font-semibold">Ảnh</h3>
          <div className="mt-2 space-y-3">
            <OAnh
              nhan="Ảnh chú rể"
              slug={thiep.slug}
              giaTri={thiep.chuRe.anh}
              onDoi={(a) => sua('chuRe', { ...thiep.chuRe, anh: a })}
            />
            <OAnh
              nhan="Ảnh cô dâu"
              slug={thiep.slug}
              giaTri={thiep.coDau.anh}
              onDoi={(a) => sua('coDau', { ...thiep.coDau, anh: a })}
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Các phần hiện trên thiệp</h3>
          <p className="mb-2 text-sm text-neutral-500">
            Bỏ chọn để ẩn một phần. Dùng mũi tên để đổi thứ tự.
          </p>
          <SapXepSection
            giaTri={thiep.sections.length ? thiep.sections : theme.thuTuSection}
            onDoi={(v) => sua('sections', v)}
          />
        </section>

        <section>
          <h3 className="font-semibold">Độ đậm nhạt họa tiết</h3>
          <div className="mt-2 space-y-3">
            {SLOT_HIEN_THI.map(({ slot, nhan }) => (
              <ThanhDoDam
                key={slot}
                nhan={nhan}
                giaTri={thiep.tuyChinhGiaoDien?.doDam?.[slot] ?? theme.doDam[slot]}
                onDoi={(v) => suaDoDam(slot, v)}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="flex-1 overflow-y-auto bg-neutral-100">
        <InvitationRenderer thiep={thiep} theme={theme} />
      </div>
    </div>
  )
}
