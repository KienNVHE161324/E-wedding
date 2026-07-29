'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Invitation, SectionId } from '@/lib/invitation/types'
import type { SlotHoaTiet } from '@/lib/themes/types'
import type { VongDoi } from '@/lib/vongDoi/types'
import { THEMES, layTheme } from '@/lib/themes'
import { InvitationRenderer } from '@/components/InvitationRenderer'
import { SapXepSection } from './SapXepSection'
import { ThanhDoDam } from './ThanhDoDam'
import { OAlbum } from './OAlbum'
import { ONguoiCuoi } from './ONguoiCuoi'
import { OMungCuoi } from './OMungCuoi'
import { ONhac } from './ONhac'
import { QuanLyXuatBan } from './QuanLyXuatBan'
import { HuyUrl } from './HuyUrl'
import { OSheet } from './OSheet'
import { ChonChiTiet } from './ChonChiTiet'
import { ODressCode } from './ODressCode'
import { OLichTrinh } from './OLichTrinh'
import { OCauHinh } from './OCauHinh'
import { ORsvp } from './ORsvp'
import { TEN_SECTION } from './SapXepSection'
import { TuyChinhHoaTietTheme } from './TuyChinhHoaTietTheme'

/** Các vị trí họa tiết đủ dễ hiểu để người không rành thiết kế vẫn chỉnh được. */
const SLOT_HIEN_THI: { slot: SlotHoaTiet; nhan: string }[] = [
  { slot: 'cover-frame', nhan: 'Khung bìa' },
  { slot: 'divider', nhan: 'Dải phân cách' },
  { slot: 'corner', nhan: 'Góc trang trí' },
  { slot: 'watermark', nhan: 'Họa tiết nền' },
]

export function BangSua({
  banDau,
  invitationId,
  publicSlug,
  vongDoi,
  spreadsheetId,
  emailServiceAccount,
}: {
  banDau: Invitation
  invitationId: string
  publicSlug: string | null
  vongDoi: VongDoi
  spreadsheetId: string | null
  emailServiceAccount: string
}) {
  const [thiep, setThiep] = useState(banDau)
  const [trangThai, setTrangThai] = useState('')
  const [phanDangTrangTri, setPhanDangTrangTri] = useState<SectionId>('bia')

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

  function suaHoaTietTheme(
    slot: 'watermark' | 'corner',
    v: NonNullable<NonNullable<Invitation['tuyChinhGiaoDien']>['hoaTiet']>['watermark'],
  ) {
    setThiep((t) => ({
      ...t,
      tuyChinhGiaoDien: {
        ...t.tuyChinhGiaoDien,
        hoaTiet: { ...t.tuyChinhGiaoDien?.hoaTiet, [slot]: v },
      },
    }))
  }

  async function luu() {
    setTrangThai('Đang lưu...')
    const res = await fetch('/api/admin/luu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, thiep }),
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

        <QuanLyXuatBan invitationId={invitationId} vongDoi={vongDoi} />

        <OSheet
          invitationId={invitationId}
          banDau={spreadsheetId}
          emailServiceAccount={emailServiceAccount}
        />

        <HuyUrl invitationId={invitationId} publicSlug={publicSlug} />

        <section>
          <h3 className="font-semibold">Cấu hình đám cưới</h3>
          <div className="mt-2">
            <OCauHinh thiep={thiep} onNhap={setThiep} />
          </div>
        </section>

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
          <h3 className="font-semibold">Cô dâu và chú rể</h3>
          <div className="mt-2 space-y-3">
            <ONguoiCuoi
              nhan="Chú rể"
              slug={thiep.slug}
              giaTri={thiep.chuRe}
              onDoi={(v) => sua('chuRe', v)}
            />
            <ONguoiCuoi
              nhan="Cô dâu"
              slug={thiep.slug}
              giaTri={thiep.coDau}
              onDoi={(v) => sua('coDau', v)}
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Ngày cưới</h3>
          <label className="mt-2 block text-sm">
            Ngày đầu (nếu cưới hai ngày)
            <input
              type="date"
              aria-label="Ngày đầu"
              className={o}
              value={thiep.ngayPhu ?? ''}
              onChange={(e) => sua('ngayPhu', e.target.value || undefined)}
            />
          </label>
          <label className="mt-2 block text-sm">
            Ngày cưới chính
            <input
              type="date"
              aria-label="Ngày cưới chính"
              className={o}
              value={thiep.ngayCuoi}
              onChange={(e) => sua('ngayCuoi', e.target.value)}
            />
          </label>
          {thiep.ngayPhu && thiep.ngayPhu >= thiep.ngayCuoi && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              Ngày đầu phải sớm hơn ngày cưới chính.
            </p>
          )}
        </section>

        <section>
          <h3 className="font-semibold">Lịch trình đám cưới</h3>
          <div className="mt-2">
            <OLichTrinh
              giaTri={thiep.suKien}
              ngayCuoi={thiep.ngayCuoi}
              slug={thiep.slug}
              onDoi={(v) => sua('suKien', v)}
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Dress code</h3>
          <div className="mt-2">
            <ODressCode giaTri={thiep.dressCode} onDoi={(v) => sua('dressCode', v)} />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Mừng cưới</h3>
          <div className="mt-2">
            <OMungCuoi
              giaTri={thiep.mungCuoi}
              slug={thiep.slug}
              themeQr={theme.qr}
              kieuKhungThiep={thiep.kieuKhungQr}
              onDoi={(v) => sua('mungCuoi', v)}
            />
          </div>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={thiep.mungCuoiKieuHopQua ?? false}
              onChange={(e) => sua('mungCuoiKieuHopQua', e.target.checked)}
            />
            <span>
              Hiện hộp quà, khách chạm vào mới ra QR
              <span className="block text-neutral-500">
                Tắt thì QR và số tài khoản hiện thẳng.
              </span>
            </span>
          </label>
        </section>

        <section>
          <h3 className="font-semibold">Album ảnh</h3>
          <div className="mt-2">
            <OAlbum giaTri={thiep.album} slug={thiep.slug} onDoi={(v) => sua('album', v)} />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Nhạc nền</h3>
          <div className="mt-2">
            <ONhac giaTri={thiep.nhac} slug={thiep.slug} onDoi={(v) => sua('nhac', v)} />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Form xác nhận tham dự</h3>
          <div className="mt-2">
            <ORsvp giaTri={thiep.cauHinhRsvp} onDoi={(v) => sua('cauHinhRsvp', v)} />
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
          <h3 className="font-semibold">Chi tiết trang trí</h3>
          <label className="mt-2 block text-sm">
            Thêm vào phần
            <select
              aria-label="Thêm vào phần"
              value={phanDangTrangTri}
              onChange={(e) => setPhanDangTrangTri(e.target.value as SectionId)}
              className={o}
            >
              {(Object.keys(TEN_SECTION) as SectionId[]).map((id) => (
                <option key={id} value={id}>
                  {TEN_SECTION[id]}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3">
            <ChonChiTiet
              giaTri={thiep.chiTietTrangTri ?? []}
              section={phanDangTrangTri}
              onDoi={(v) => sua('chiTietTrangTri', v)}
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Họa tiết mặc định trên bìa</h3>
          <p className="mb-3 text-sm text-neutral-500">
            Chỉnh chữ Hỷ và họa tiết góc; thiệp cũ vẫn dùng vị trí mặc định nếu chưa thay đổi.
          </p>
          <div className="space-y-3">
            <TuyChinhHoaTietTheme
              slot="watermark"
              nhan="Họa tiết nền"
              theme={theme}
              giaTri={thiep.tuyChinhGiaoDien?.hoaTiet?.watermark}
              doDamMacDinh={
                thiep.tuyChinhGiaoDien?.doDam?.watermark ?? theme.doDam.watermark
              }
              onDoi={(v) => suaHoaTietTheme('watermark', v)}
            />
            <TuyChinhHoaTietTheme
              slot="corner"
              nhan="Góc trang trí"
              theme={theme}
              giaTri={thiep.tuyChinhGiaoDien?.hoaTiet?.corner}
              doDamMacDinh={thiep.tuyChinhGiaoDien?.doDam?.corner ?? theme.doDam.corner}
              onDoi={(v) => suaHoaTietTheme('corner', v)}
            />
          </div>
        </section>

        <section>
          <h3 className="font-semibold">Độ đậm nhạt họa tiết của giao diện</h3>
          <div className="mt-2 space-y-3">
            {SLOT_HIEN_THI.filter(
              ({ slot }) => slot !== 'watermark' && slot !== 'corner',
            ).map(({ slot, nhan }) => (
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
