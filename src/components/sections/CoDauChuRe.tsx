import Image from 'next/image'
import type { SectionProps } from './types'
import type { NguoiCuoi } from '@/lib/invitation/types'
import { HoaTietTheme } from '@/components/HoaTiet'

function Ben({ nguoi, vaiTro }: { nguoi: NguoiCuoi; vaiTro: string }) {
  return (
    <div className="flex-1 text-center">
      {nguoi.anh && (
        <Image
          src={nguoi.anh.url}
          alt={nguoi.anh.moTa}
          width={320}
          height={320}
          sizes="(max-width: 768px) 40vw, 240px"
          className="mx-auto aspect-square w-28 rounded-full object-cover md:w-40"
        />
      )}

      <p className="mt-3 text-xs tracking-widest" style={{ color: 'var(--mau-phu)' }}>
        {vaiTro}
      </p>
      <h3
        className="text-xl md:text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        {nguoi.ten}
      </h3>

      {nguoi.gioiThieu && <p className="mt-2 px-2 text-sm">{nguoi.gioiThieu}</p>}

      {/* Tên bố mẹ nhỏ hơn, đặt dưới tên cô dâu chú rể. */}
      {(nguoi.tenBo || nguoi.tenMe) && (
        <div className="mt-3 text-sm" style={{ color: 'var(--mau-phu)' }}>
          {nguoi.tenBo && <p>{nguoi.tenBo}</p>}
          {nguoi.tenMe && <p>{nguoi.tenMe}</p>}
        </div>
      )}
    </div>
  )
}

export function CoDauChuRe({ thiep, theme }: SectionProps) {
  return (
    <section data-section="co-dau-chu-re" className="px-6 py-16">
      <h2
        className="text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Cô dâu &amp; Chú rể
      </h2>

      {/* Hai bên luôn nằm cạnh nhau, kể cả trên điện thoại. */}
      <div className="mt-8 flex items-start gap-3 md:gap-8">
        <Ben nguoi={thiep.chuRe} vaiTro="CHÚ RỂ" />
        <span
          aria-hidden="true"
          className="mt-10 text-2xl"
          style={{ color: 'var(--mau-nhan)' }}
        >
          &amp;
        </span>
        <Ben nguoi={thiep.coDau} vaiTro="CÔ DÂU" />
      </div>

      <HoaTietTheme theme={theme} slot="divider" className="mx-auto mt-10 block h-8 w-40" />
    </section>
  )
}
