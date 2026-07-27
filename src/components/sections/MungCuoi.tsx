import type { SectionProps } from './types'
import type { Ben } from '@/lib/invitation/types'

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

export function MungCuoi({ thiep }: SectionProps) {
  if (thiep.mungCuoi.length === 0) return null

  return (
    <section data-section="mung-cuoi" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Mừng cưới
      </h2>
      <div className="mt-6 flex flex-col gap-6 md:flex-row">
        {thiep.mungCuoi.map((o) => (
          <div key={o.ben} className="flex-1">
            <p style={{ color: 'var(--mau-phu)' }}>{TEN_BEN[o.ben]}</p>
            <p className="mt-1">{o.chuTaiKhoan}</p>
            <p className="text-sm">{o.soTaiKhoan}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
