'use client'

import { useState } from 'react'

/**
 * Gắn file Google Sheet có sẵn vào thiệp.
 *
 * Service account của Google không tạo được file mới (hạn mức Drive bằng 0),
 * nên nhân viên tự tạo file rồi chia sẻ, app chỉ dựng tab và ghi thêm dòng.
 */
export function OSheet({
  invitationId,
  banDau,
  emailServiceAccount,
}: {
  invitationId: string
  banDau: string | null
  emailServiceAccount: string
}) {
  const [idHoacUrl, setIdHoacUrl] = useState(banDau ?? '')
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')
  const [daLuu, setDaLuu] = useState(banDau)

  async function gan() {
    setLoi('')
    setDangGui(true)
    const res = await fetch('/api/admin/sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, idHoacUrl }),
    })
    setDangGui(false)

    const data = await res.json().catch(() => ({}))
    if (res.ok) {
      setDaLuu(data.spreadsheetId)
      setIdHoacUrl(data.spreadsheetId)
    } else {
      setLoi(data.loi ?? 'Không gắn được bảng tính')
    }
  }

  return (
    <div className="rounded border p-3">
      <h3 className="font-semibold">Google Sheet tổng hợp</h3>

      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-neutral-600">
        <li>Tạo một Google Sheet trống trên tài khoản của bạn.</li>
        <li>
          Bấm <strong>Share</strong>, mời email dưới đây với quyền <strong>Editor</strong>:
          <code className="mt-1 block break-all rounded bg-neutral-100 px-2 py-1 text-xs">
            {emailServiceAccount}
          </code>
        </li>
        <li>Dán đường dẫn file vào ô dưới rồi bấm Gắn.</li>
      </ol>

      <input
        aria-label="Đường dẫn Google Sheet"
        value={idHoacUrl}
        onChange={(e) => setIdHoacUrl(e.target.value)}
        placeholder="https://docs.google.com/spreadsheets/d/..."
        className="mt-3 w-full rounded border px-3 py-2 text-sm"
      />

      {loi && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {loi}
        </p>
      )}

      {daLuu && !loi && (
        <p className="mt-2 text-sm text-green-700">
          Đã gắn. Hai tab Nhà trai và Nhà gái đã sẵn sàng.{' '}
          <a
            href={`https://docs.google.com/spreadsheets/d/${daLuu}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Mở file
          </a>
        </p>
      )}

      <button
        type="button"
        onClick={gan}
        disabled={dangGui || !idHoacUrl.trim()}
        className="mt-3 w-full rounded border py-2 disabled:opacity-50"
      >
        {dangGui ? 'Đang kiểm tra...' : 'Gắn bảng tính'}
      </button>
    </div>
  )
}
