import Image from 'next/image'
import type { SectionProps } from './types'
import { lienKetThemVaoLich, sapXepLichTrinh } from '@/lib/invitation/lich'

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

      {/*
        Dòng thời gian dạng dây leo: mốc lẻ nghiêng về trái, mốc chẵn nghiêng về phải,
        nối nhau bằng những đoạn cong đổi chiều — mắt đi theo như leo một sợi dây.
      */}
      <ol className="mt-10">
        {moc.map((sk, i) => {
          const sangNgayMoi = i === 0 || moc[i - 1].ngay !== sk.ngay
          const cuoiCung = i === moc.length - 1
          const beTrai = i % 2 === 0

          return (
            <li key={`${sk.ngay}-${sk.gio}-${i}`}>
              {sangNgayMoi && (
                <p
                  className="mb-4 text-center text-sm tracking-widest"
                  style={{ color: 'var(--mau-phu)' }}
                >
                  {nhanNgay(sk.ngay).toUpperCase()}
                </p>
              )}

              <div className={beTrai ? 'text-left' : 'text-right'}>
                <div
                  className={`inline-block max-w-[85%] ${beTrai ? 'pr-2' : 'pl-2'}`}
                >
                  <p className="text-lg" style={{ color: 'var(--mau-chinh)' }}>
                    <span className="tabular-nums">{sk.gio}</span>
                    <span className="mx-2" aria-hidden="true">
                      ·
                    </span>
                    {sk.ten}
                  </p>

                  {sk.diaDiem && <p className="mt-1 font-medium">{sk.diaDiem}</p>}

                  <a
                    href={lienKetThemVaoLich(sk)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center rounded-full border px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: 'var(--mau-chinh)', color: 'var(--mau-chinh)' }}
                  >
                    Thêm vào lịch của tôi
                  </a>

                  {sk.banDoAnh && (
                    <Image
                      src={sk.banDoAnh.url}
                      alt={sk.banDoAnh.moTa}
                      width={800}
                      height={500}
                      sizes="(max-width: 768px) 80vw, 480px"
                      className="mt-3 w-full rounded-lg"
                    />
                  )}

                </div>
              </div>

              {/* Đoạn dây uốn sang phía đối diện, dẫn mắt tới mốc kế tiếp. */}
              {!cuoiCung && (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 40"
                  preserveAspectRatio="none"
                  className="my-2 h-10 w-full"
                >
                  <path
                    d={beTrai ? 'M 14 0 C 14 28, 86 12, 86 40' : 'M 86 0 C 86 28, 14 12, 14 40'}
                    fill="none"
                    stroke="var(--mau-phu)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
