import { notFound } from 'next/navigation'
import { batBuocDangNhap } from '@/lib/auth/server'
import { layThiepTheoSlug } from '@/lib/db/invitations'
import { BangSua } from '@/components/admin/BangSua'

export const dynamic = 'force-dynamic'

export default async function TrangSuaThiep({ params }: { params: Promise<{ slug: string }> }) {
  await batBuocDangNhap()
  const { slug } = await params
  const ban = await layThiepTheoSlug(slug)
  if (!ban) notFound()

  return (
    <BangSua
      banDau={ban.thiep}
      vongDoi={ban.vongDoi}
      spreadsheetId={ban.spreadsheetId}
      emailServiceAccount={process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '(chưa cấu hình)'}
    />
  )
}
