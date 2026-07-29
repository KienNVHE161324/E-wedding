'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function HuyUrl({
  invitationId,
  publicSlug,
}: {
  invitationId: string
  publicSlug: string | null
}) {
  const router = useRouter()
  const [dangXacNhan, setDangXacNhan] = useState(false)
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')

  if (!publicSlug) return null

  async function huy() {
    setDangGui(true)
    setLoi('')
    const res = await fetch('/api/admin/huy-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId }),
    })
    setDangGui(false)
    if (res.ok) {
      router.push('/admin')
      return
    }
    const data = await res.json().catch(() => ({}))
    setLoi(data.loi ?? 'Không hủy được đường dẫn')
  }

  return (
    <section className="rounded border border-red-300 p-3">
      <h3 className="font-semibold text-red-700">Hủy thiệp</h3>
      {!dangXacNhan ? (
        <button
          type="button"
          onClick={() => setDangXacNhan(true)}
          className="mt-3 w-full rounded border border-red-600 py-2 text-red-700"
        >
          Hủy thiệp và gỡ đường dẫn
        </button>
      ) : (
        <div className="mt-3">
          <p className="text-sm">
            Đường dẫn /{publicSlug} sẽ được giải phóng để dùng lại. Hệ thống giữ nguyên nội
            dung, RSVP và lời chúc.
          </p>
          {loi && <p role="alert" className="mt-2 text-sm text-red-600">{loi}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={dangGui}
              onClick={huy}
              className="rounded bg-red-700 px-3 py-2 text-white disabled:opacity-60"
            >
              {dangGui ? 'Đang hủy...' : 'Xác nhận hủy'}
            </button>
            <button
              type="button"
              disabled={dangGui}
              onClick={() => setDangXacNhan(false)}
              className="rounded border px-3 py-2"
            >
              Không hủy
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
