import type { SectionProps } from './types'

export function Album({ thiep }: SectionProps) {
  if (thiep.album.length === 0) return null

  return (
    <section data-section="album" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Album ảnh
      </h2>
      <p className="mt-4 text-sm" style={{ color: 'var(--mau-phu)' }}>
        {thiep.album.length} ảnh
      </p>
    </section>
  )
}
