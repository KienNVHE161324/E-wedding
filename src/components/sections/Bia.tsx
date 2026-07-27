import type { SectionProps } from './types'
import { HoaTiet } from '@/components/HoaTiet'

// Khung tối thiểu để nền tảng chạy được.
// Session thiết kế thay toàn bộ phần bên trong <section>, giữ nguyên
// thuộc tính data-section và chữ ký hàm.
export function Bia({ thiep, theme, onMoThiep }: SectionProps) {
  return (
    <section
      data-section="bia"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <HoaTiet theme={theme} slot="watermark" className="absolute inset-0 m-auto block h-2/3 w-2/3" />

      <p className="text-sm tracking-[0.3em]" style={{ color: 'var(--mau-phu)' }}>
        THÂN MỜI
      </p>
      <h1
        className="mt-6 text-4xl leading-tight md:text-6xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        {thiep.chuRe.ten}
        <span className="my-3 block text-2xl md:text-3xl">&amp;</span>
        {thiep.coDau.ten}
      </h1>

      <button
        type="button"
        onClick={onMoThiep}
        className="mt-10 rounded-full px-8 py-3 text-white"
        style={{ backgroundColor: 'var(--mau-chinh)' }}
      >
        Mở thiệp
      </button>

      <HoaTiet theme={theme} slot="corner" className="absolute bottom-4 block h-16 w-16" />
    </section>
  )
}
