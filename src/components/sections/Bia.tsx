import type { SectionProps } from './types'
import { HoaTietThemeTuyChinh, MAC_DINH_HOA_TIET_BIA } from '@/components/HoaTiet'
import { VungChu } from '@/components/text/VungChu'

// Khung tối thiểu để nền tảng chạy được.
// Session thiết kế thay toàn bộ phần bên trong <section>, giữ nguyên
// thuộc tính data-section và chữ ký hàm.
export function Bia({ thiep, theme, onMoThiep }: SectionProps) {
  return (
    <section
      data-section="bia"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
    >
      <HoaTietThemeTuyChinh
        theme={theme}
        slot="watermark"
        macDinh={MAC_DINH_HOA_TIET_BIA.watermark}
        tuyChinh={thiep.tuyChinhGiaoDien?.hoaTiet?.watermark}
      />

      <div className="relative z-10 flex flex-col items-center">
        <p className="text-sm tracking-[0.3em]" style={{ color: 'var(--mau-phu)' }}>
          <VungChu id="bia.loi-mo-dau" thiep={thiep} noiDung="THÂN MỜI" />
        </p>
        <h1
          className="mt-6 text-4xl leading-tight md:text-6xl"
          style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
        >
          <VungChu id="bia.chu-re.ten" thiep={thiep} noiDung={thiep.chuRe.ten} />
          <span className="my-3 block text-2xl md:text-3xl">
            <VungChu id="bia.ky-hieu-noi" thiep={thiep} noiDung="&" />
          </span>
          <VungChu id="bia.co-dau.ten" thiep={thiep} noiDung={thiep.coDau.ten} />
        </h1>

        <button
          type="button"
          onClick={onMoThiep}
          className="mt-10 rounded-full px-8 py-3 text-white"
          style={{ backgroundColor: 'var(--mau-chinh)' }}
        >
          <VungChu id="bia.nut-mo" thiep={thiep} noiDung="Mở thiệp" />
        </button>
      </div>

      <HoaTietThemeTuyChinh
        theme={theme}
        slot="corner"
        macDinh={MAC_DINH_HOA_TIET_BIA.corner}
        tuyChinh={thiep.tuyChinhGiaoDien?.hoaTiet?.corner}
      />
    </section>
  )
}
