import { notFound } from 'next/navigation'
import { batBuocDangNhap } from '@/lib/auth/server'
import { layThiepTheoId } from '@/lib/db/invitations'
import { BangSua } from '@/components/admin/BangSua'

export const dynamic = 'force-dynamic'

export default async function TrangSuaThiep({ params }: { params: Promise<{ id: string }> }) {
  await batBuocDangNhap()
  const { id } = await params
  const ban = await layThiepTheoId(id)
  if (!ban) notFound()

  return (
    <BangSua
      banDau={ban.thiep}
      invitationId={ban.id}
      publicSlug={ban.publicSlug}
      vongDoi={ban.vongDoi}
      spreadsheetId={ban.spreadsheetId}
      emailServiceAccount={process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? '(chưa cấu hình)'}
    />
  )
}
