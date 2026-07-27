'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { taoSupabaseTrinhDuyet } from '@/lib/auth/client'

function FormDangNhap() {
  const router = useRouter()
  const tiep = useSearchParams().get('tiep') ?? '/admin'
  const [dangGui, setDangGui] = useState(false)
  const [loi, setLoi] = useState('')

  async function dangNhap(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoi('')
    setDangGui(true)

    const fd = new FormData(e.currentTarget)
    const { error } = await taoSupabaseTrinhDuyet().auth.signInWithPassword({
      email: String(fd.get('email')),
      password: String(fd.get('matKhau')),
    })

    setDangGui(false)
    if (error) {
      setLoi('Email hoặc mật khẩu không đúng')
      return
    }
    router.push(tiep)
    router.refresh()
  }

  const o = 'mt-1 w-full rounded border px-3 py-2'

  return (
    <form onSubmit={dangNhap} className="mx-auto mt-24 w-full max-w-sm space-y-4 px-6">
      <h1 className="text-2xl font-semibold">Đăng nhập quản trị</h1>

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className={o} />
      </div>

      <div>
        <label htmlFor="matKhau">Mật khẩu</label>
        <input id="matKhau" name="matKhau" type="password" required className={o} />
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
        {dangGui ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}

export default function TrangDangNhap() {
  return (
    <Suspense>
      <FormDangNhap />
    </Suspense>
  )
}
