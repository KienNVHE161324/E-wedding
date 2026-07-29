import type { SectionProps } from './types'
import { VungChu } from '@/components/text/VungChu'

/** Form thật nằm trong popup, phần này chỉ là lời mời và nút mở. */
export function Rsvp({ thiep, onMoRsvp }: SectionProps) {
  return (
    <section data-section="rsvp" id="rsvp" className="px-6 py-16 text-center">
      <div
        className="mx-auto max-w-xl rounded-3xl border bg-white/25 px-6 py-10 shadow-sm backdrop-blur-[2px]"
        style={{ borderColor: 'color-mix(in srgb, var(--mau-chinh) 22%, transparent)' }}
      >
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        <VungChu id="rsvp.tieu-de" thiep={thiep} noiDung="Xác nhận tham dự" />
      </h2>

      <p className="mx-auto mt-4 max-w-md">
        <VungChu
          id="rsvp.loi-moi"
          thiep={thiep}
          noiDung="Sự hiện diện của bạn là niềm vinh hạnh của gia đình chúng tôi. Vui lòng cho chúng tôi biết bạn có tới dự được không nhé."
        />
      </p>

      <button
        type="button"
        onClick={onMoRsvp}
        className="mt-7 rounded-full px-8 py-3 font-medium text-white shadow-md hover:-translate-y-0.5"
        style={{ backgroundColor: 'var(--mau-chinh)' }}
      >
        <VungChu id="rsvp.nut-mo" thiep={thiep} noiDung="Điền xác nhận" />
      </button>
      </div>
    </section>
  )
}
