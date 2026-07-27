import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { layThiepTheoSlug } from '@/lib/db/invitations'
import { layLoiChucDaDuyet } from '@/lib/db/rsvps'
import { layTheme } from '@/lib/themes'
import { tinhTrangThai } from '@/lib/vongDoi/tinhTrangThai'
import { InvitationRenderer } from '@/components/InvitationRenderer'
import { ThongBaoTrangThai } from '@/components/ThongBaoTrangThai'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const ban = await layThiepTheoSlug(slug)
  if (!ban) return { title: 'Không tìm thấy thiệp' }

  // Thiệp chưa mở hoặc đã đóng thì không rò rỉ tên và ảnh ra link xem trước.
  if (tinhTrangThai(ban.vongDoi, new Date()) !== 'da-xuat-ban') {
    return { title: 'Thiệp cưới', robots: { index: false } }
  }

  const { thiep } = ban
  const tieuDe = `${thiep.chuRe.ten} & ${thiep.coDau.ten}`
  const moTa = `Trân trọng kính mời bạn tới dự lễ cưới của ${tieuDe}.`
  const anh = thiep.album[0]?.url ?? thiep.coDau.anh?.url

  return {
    title: `Thiệp cưới ${tieuDe}`,
    description: moTa,
    openGraph: {
      title: `Thiệp cưới ${tieuDe}`,
      description: moTa,
      images: anh ? [anh] : [],
      type: 'website',
    },
  }
}

export default async function TrangThiep({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ban = await layThiepTheoSlug(slug)
  if (!ban) notFound()

  const trangThai = tinhTrangThai(ban.vongDoi, new Date())
  if (trangThai !== 'da-xuat-ban') return <ThongBaoTrangThai trangThai={trangThai} />

  const loiChuc = await layLoiChucDaDuyet(slug)
  return (
    <InvitationRenderer thiep={ban.thiep} theme={layTheme(ban.thiep.themeId)} loiChuc={loiChuc} />
  )
}
