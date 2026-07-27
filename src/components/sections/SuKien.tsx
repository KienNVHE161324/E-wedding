import Image from 'next/image'
import type { SectionProps } from './types'
import { sapXepLichTrinh } from '@/lib/invitation/lich'

const TEN_THU_DAY_DU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

function nhanNgay(iso: string): string {
  const [nam, thang, ngay] = iso.split('-').map(Number)
  const thu = TEN_THU_DAY_DU[new Date(Date.UTC(nam, thang - 1, ngay)).getUTCDay()]
  return `${thu}, ${String(ngay).padStart(2, '0')}/${String(thang).padStart(2, '0')}/${nam}`
}

export function SuKien({ thiep }: SectionProps) {
  const moc = sapXepLichTrinh(thiep.suKien)
  if (moc.length === 0) return null

  return (
    <section data-section="su-kien" className="px-6 py-16">
      <h2
        className="text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Lịch trình đám cưới
      </h2>

      <ol className="mt-10">
        {moc.map((sk, i) => {
          // Chỉ ghi ngày khi sang ngày mới, để dòng thời gian không lặp thừa.
          const sangNgayMoi = i === 0 || moc[i - 1].ngay !== sk.ngay
          const cuoiCung = i === moc.length - 1

          return (
            <li key={`${sk.ngay}-${sk.gio}-${i}`}>
              {sangNgayMoi && (
                <p
                  className="mb-4 text-sm tracking-widest"
                  style={{ color: 'var(--mau-phu)' }}
                >
                  {nhanNgay(sk.ngay).toUpperCase()}
                </p>
              )}

              <div className="flex gap-4">
                {/* Cột chấm tròn và đường nối dọc */}
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: 'var(--mau-chinh)' }}
                  />
                  {!cuoiCung && (
                    <span
                      aria-hidden="true"
                      className="w-px flex-1"
                      style={{ backgroundColor: 'var(--mau-phu)', opacity: 0.4 }}
                    />
                  )}
                </div>

                <div className={cuoiCung ? '' : 'pb-8'}>
                  <p className="text-lg" style={{ color: 'var(--mau-chinh)' }}>
                    <span className="tabular-nums">{sk.gio}</span>
                    <span className="mx-2" aria-hidden="true">
                      ·
                    </span>
                    {sk.ten}
                  </p>

                  {sk.diaDiem && <p className="mt-1 font-medium">{sk.diaDiem}</p>}
                  {sk.diaChi && (
                    <p className="mt-0.5 text-sm" style={{ color: 'var(--mau-phu)' }}>
                      {sk.diaChi}
                    </p>
                  )}

                  {sk.banDoAnh && (
                    <Image
                      src={sk.banDoAnh.url}
                      alt={sk.banDoAnh.moTa}
                      width={800}
                      height={500}
                      sizes="(max-width: 768px) 80vw, 560px"
                      className="mt-3 w-full rounded-lg"
                    />
                  )}

                  {sk.linkChiDuong && (
                    <a
                      href={sk.linkChiDuong}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block rounded-full px-5 py-1.5 text-sm text-white"
                      style={{ backgroundColor: 'var(--mau-chinh)' }}
                    >
                      Chỉ đường
                    </a>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
