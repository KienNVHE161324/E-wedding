import type { SectionProps } from './types'
import { HoaTietTheme } from '@/components/HoaTiet'

export function CoDauChuRe({ thiep, theme }: SectionProps) {
  return (
    <section data-section="co-dau-chu-re" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Cô dâu &amp; Chú rể
      </h2>
      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <p className="flex-1">{thiep.chuRe.ten}</p>
        <p className="flex-1">{thiep.coDau.ten}</p>
      </div>
      <HoaTietTheme theme={theme} slot="divider" className="mx-auto mt-10 block h-8 w-40" />
    </section>
  )
}
