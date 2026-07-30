import type { SectionProps } from './types'
import { VungChu } from '@/components/text/VungChu'

export function ChuyenChungMinh({ thiep }: SectionProps) {
  if (thiep.chuyenChungMinh.length === 0) return null
  const chuyen = thiep.chuyenChungMinh[0]

  return (
    <section data-section="chuyen-chung-minh" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        <VungChu
          id="chuyen-chung-minh.tieu-de"
          thiep={thiep}
          noiDung="Chuyện chúng mình"
        />
      </h2>
      <p className="mt-4">
        {chuyen.id ? (
          <VungChu
            id={`chuyen-chung-minh.${chuyen.id}.tieu-de`}
            thiep={thiep}
            noiDung={chuyen.tieuDe}
          />
        ) : (
          chuyen.tieuDe
        )}
      </p>
    </section>
  )
}
