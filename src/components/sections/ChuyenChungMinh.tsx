import type { SectionProps } from './types'

export function ChuyenChungMinh({ thiep }: SectionProps) {
  if (thiep.chuyenChungMinh.length === 0) return null

  return (
    <section data-section="chuyen-chung-minh" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Chuyện chúng mình
      </h2>
      <p className="mt-4">{thiep.chuyenChungMinh[0].tieuDe}</p>
    </section>
  )
}
