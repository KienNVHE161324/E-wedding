import type { SectionProps } from './types'
import { HoaTiet } from '@/components/HoaTiet'

export function SoLuuBut({ theme, loiChuc = [] }: SectionProps) {
  return (
    <section data-section="so-luu-but" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Sổ lưu bút
      </h2>

      {loiChuc.length === 0 ? (
        <p className="mt-4 text-sm" style={{ color: 'var(--mau-phu)' }}>
          Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tới cô dâu chú rể.
        </p>
      ) : (
        <ul className="mt-6 space-y-4 text-left">
          {loiChuc.map((lc, i) => (
            <li key={i}>
              <p className="text-sm">{lc.noiDung}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--mau-chinh)' }}>— {lc.hoTen}</p>
            </li>
          ))}
        </ul>
      )}

      <HoaTiet theme={theme} slot="divider" className="mx-auto mt-10 block h-8 w-40" />
    </section>
  )
}
