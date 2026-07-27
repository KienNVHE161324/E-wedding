import Link from 'next/link'
import { notFound } from 'next/navigation'
import { batBuocDangNhap } from '@/lib/auth/server'
import { layThiepTheoSlug } from '@/lib/db/invitations'
import { layLoiChuc } from '@/lib/db/loiChuc'
import { OLoiChuc } from '@/components/admin/OLoiChuc'

export const dynamic = 'force-dynamic'

export default async function TrangQuanLyLoiChuc({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  await batBuocDangNhap()
  const { slug } = await params
  const [ban, loiChuc] = await Promise.all([layThiepTheoSlug(slug), layLoiChuc(slug)])
  if (!ban) notFound()

  return (
    <main className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin" className="text-sm underline">← Các đám cưới</Link>
        <h1 className="flex-1 text-2xl font-semibold">
          Lời chúc · {ban.thiep.chuRe.ten} &amp; {ban.thiep.coDau.ten}
        </h1>
        <Link href={`/admin/${slug}`} className="rounded border px-3 py-2 text-sm">
          Sửa thiệp
        </Link>
      </div>
      <div className="mt-6">
        <OLoiChuc banDau={loiChuc} />
      </div>
    </main>
  )
}
