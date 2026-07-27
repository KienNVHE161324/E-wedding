import type { SectionProps } from './types'

export function DemNguoc({ thiep }: SectionProps) {
  return (
    <section data-section="dem-nguoc" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Save the date
      </h2>
      <p className="mt-4 text-lg">{thiep.ngayCuoi}</p>
    </section>
  )
}
