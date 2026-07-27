import type { SectionProps } from './types'

// Form thật được viết ở Task 9. Đây là khung để renderer chạy được trước.
export function Rsvp() {
  return (
    <section data-section="rsvp" id="rsvp" className="px-6 py-16 text-center">
      <h2 className="text-2xl" style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}>
        Xác nhận tham dự
      </h2>
    </section>
  )
}
