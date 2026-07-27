import type { SectionProps } from './types'

export function SuKien({ thiep }: SectionProps) {
  if (thiep.suKien.length === 0) return null

  return (
    <section data-section="su-kien" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Lịch trình đám cưới
      </h2>
      <ul className="mt-6 space-y-4">
        {thiep.suKien.map((sk, i) => (
          <li key={i}>
            <p style={{ color: 'var(--mau-chinh)' }}>{sk.ten}</p>
            <p className="text-sm">{sk.thoiGian}</p>
            <p className="text-sm" style={{ color: 'var(--mau-phu)' }}>{sk.diaChi}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
