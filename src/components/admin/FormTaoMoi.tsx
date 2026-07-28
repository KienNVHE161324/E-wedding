'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { THEMES } from '@/lib/themes'
import type { KieuKhungQr } from '@/lib/qr/types'
import { PopupChonKieuQr } from './PopupChonKieuQr'

export function FormTaoMoi() {
  const router = useRouter()
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const [goiY, setGoiY] = useState('')
  const [slug, setSlug] = useState('')
  const [haiNgay, setHaiNgay] = useState(false)
  const [kieuKhungQr, setKieuKhungQr] = useState<KieuKhungQr>('hoa-mem')
  const [moChonQr, setMoChonQr] = useState(false)

  async function taoMoi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
    setGoiY('')
    setDangGui(true)

    const fd = new FormData(e.currentTarget)
    const res = await fetch('/api/admin/tao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: fd.get('slug'),
        tenChuRe: fd.get('tenChuRe'),
        tenCoDau: fd.get('tenCoDau'),
        ngayCuoi: fd.get('ngayCuoi'),
        ngayPhu: fd.get('ngayPhu') || undefined,
        themeId: fd.get('themeId'),
        kieuKhungQr,
      }),
    })

    setDangGui(false)
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      router.push(`/admin/${data.slug}`)
    } else {
      setLoi(data.loi ?? 'Không tạo được thiệp')
      if (data.goiY) setGoiY(data.goiY)
    }
  }

  const o = 'mt-1 w-full rounded border px-3 py-2'

  return (
    <form onSubmit={taoMoi} className="mx-auto max-w-md space-y-4 px-6 py-8">
      <Link href="/admin" className="text-sm underline">
        ← Danh sách
      </Link>
      <h1 className="text-2xl font-semibold">Tạo đám cưới mới</h1>

      <div>
        <label htmlFor="tenChuRe">Tên chú rể</label>
        <input id="tenChuRe" name="tenChuRe" required className={o} />
      </div>

      <div>
        <label htmlFor="tenCoDau">Tên cô dâu</label>
        <input id="tenCoDau" name="tenCoDau" required className={o} />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={haiNgay}
            onChange={(e) => setHaiNgay(e.target.checked)}
          />
          Đám cưới diễn ra trong hai ngày
        </label>
        {/* Gợi ý để ngoài nhãn, nếu không tên của ô đánh dấu sẽ dài và lẫn với ô ngày. */}
        <p className="mt-1 text-sm text-neutral-500">
          Ngày muộn hơn luôn được coi là ngày cưới chính.
        </p>
      </div>

      {haiNgay && (
        <div>
          <label htmlFor="ngayPhu">Ngày đầu</label>
          <input id="ngayPhu" name="ngayPhu" type="date" required={haiNgay} className={o} />
        </div>
      )}

      <div>
        <label htmlFor="ngayCuoi">{haiNgay ? 'Ngày cưới chính' : 'Ngày cưới'}</label>
        <input id="ngayCuoi" name="ngayCuoi" type="date" required className={o} />
      </div>

      <div>
        <label htmlFor="slug">Đường dẫn thiệp</label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="nam-linh"
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          className={o}
        />
        <p className="mt-1 text-sm text-neutral-500">
          Chỉ dùng chữ thường không dấu, số và dấu gạch ngang. Khách sẽ vào bằng địa chỉ này.
        </p>
      </div>

      <div>
        <label htmlFor="themeId">Giao diện</label>
        <select id="themeId" name="themeId" required defaultValue="" className={o}>
          <option value="" disabled>
            Chọn giao diện
          </option>
          {Object.values(THEMES).map((t) => (
            <option key={t.id} value={t.id}>
              {t.ten}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p>Kiểu QR mừng cưới</p>
        <div className="mt-1 flex items-center justify-between rounded border px-3 py-2">
          <span className="text-sm">
            {kieuKhungQr === 'toi-gian' ? 'Tối giản'
            : kieuKhungQr === 'hoa-mem' ? 'Hoa mềm'
            : 'Phong bao'}
          </span>
          <button
            type="button"
            onClick={() => setMoChonQr(true)}
            className="text-sm underline"
          >
            Chọn kiểu QR
          </button>
        </div>
      </div>

      {loi && (
        <p role="alert" className="text-sm text-red-600">
          {loi}
          {goiY && (
            <>
              {' '}
              Dùng{' '}
              <button
                type="button"
                onClick={() => {
                  setSlug(goiY)
                  setLoi('')
                  setGoiY('')
                }}
                className="underline"
              >
                {goiY}
              </button>{' '}
              thay nhé?
            </>
          )}
        </p>
      )}

      <button
        type="submit"
        disabled={dangGui}
        className="w-full rounded bg-black py-2.5 text-white disabled:opacity-60"
      >
        {dangGui ? 'Đang tạo...' : 'Tạo và bắt đầu sửa'}
      </button>
      {moChonQr && (
        <PopupChonKieuQr
          giaTri={kieuKhungQr}
          onChon={setKieuKhungQr}
          onDong={() => setMoChonQr(false)}
        />
      )}
    </form>
  )
}
