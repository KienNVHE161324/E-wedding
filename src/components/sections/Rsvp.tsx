import type { SectionProps } from './types'

/** Form thật nằm trong popup, phần này chỉ là lời mời và nút mở. */
export function Rsvp({ onMoRsvp }: SectionProps) {
  return (
    <section data-section="rsvp" id="rsvp" className="px-6 py-16 text-center">
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Xác nhận tham dự
      </h2>

      <p className="mx-auto mt-4 max-w-md">
        Sự hiện diện của bạn là niềm vinh hạnh của gia đình chúng tôi. Vui lòng cho chúng tôi
        biết bạn có tới dự được không nhé.
      </p>

      <button
        type="button"
        onClick={onMoRsvp}
        className="mt-6 rounded-full px-8 py-3 text-white"
        style={{ backgroundColor: 'var(--mau-chinh)' }}
      >
        Điền xác nhận
      </button>
    </section>
  )
}
