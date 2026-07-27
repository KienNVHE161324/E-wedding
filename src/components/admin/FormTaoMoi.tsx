'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { THEMES } from '@/lib/themes'

export function FormTaoMoi() {
  const router = useRouter()
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')

  async function taoMoi(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
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
        themeId: fd.get('themeId'),
      }),
    })

    setDangGui(false)
    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      router.push(`/admin/${data.slug}`)
    } else {
      setLoi(data.loi ?? 'Không tạo được thiệp')
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
        <label htmlFor="ngayCuoi">Ngày cưới</label>
        <input id="ngayCuoi" name="ngayCuoi" type="date" required className={o} />
      </div>

      <div>
        <label htmlFor="slug">Đường dẫn thiệp</label>
        <input
          id="slug"
          name="slug"
          required
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

      {loi && (
        <p role="alert" className="text-sm text-red-600">
          {loi}
        </p>
      )}

      <button
        type="submit"
        disabled={dangGui}
        className="w-full rounded bg-black py-2.5 text-white disabled:opacity-60"
      >
        {dangGui ? 'Đang tạo...' : 'Tạo và bắt đầu sửa'}
      </button>
    </form>
  )
}
