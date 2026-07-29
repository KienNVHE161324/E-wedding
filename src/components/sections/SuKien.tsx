import Image from 'next/image'
import type { SectionProps } from './types'
import { lienKetThemVaoLich, sapXepLichTrinh, tenTepLich } from '@/lib/invitation/lich'

const TEN_THU_DAY_DU = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

function nhanNgay(iso: string): string {
  const [nam, thang, ngay] = iso.split('-').map(Number)
  const thu = TEN_THU_DAY_DU[new Date(Date.UTC(nam, thang - 1, ngay)).getUTCDay()]
  return `${thu}, ${String(ngay).padStart(2, '0')}/${String(thang).padStart(2, '0')}/${nam}`
}

export function SuKien({ thiep }: SectionProps) {
  const moc = sapXepLichTrinh(thiep.suKien)
  if (moc.length === 0) return null

  const theoNgay = Map.groupBy(moc, (suKien) => suKien.ngay)

  return (
    <section data-section="su-kien" className="px-6 py-16">
      <h2
        className="text-center text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Lịch trình đám cưới
      </h2>

      <div className="mx-auto mt-10 max-w-lg space-y-10">
        {Array.from(theoNgay, ([ngay, suKienTrongNgay]) => (
          <div key={ngay}>
            <p
              className="mb-6 text-sm tracking-widest"
              style={{ color: 'var(--mau-phu)' }}
            >
              {nhanNgay(ngay).toUpperCase()}
            </p>

            <ol
              data-testid="timeline-truc"
              className="relative ml-2 border-l"
              style={{ borderColor: 'color-mix(in srgb, var(--mau-phu) 45%, transparent)' }}
            >
              {suKienTrongNgay.map((sk, i) => (
                <li
                  key={`${sk.ngay}-${sk.gio}-${i}`}
                  className="relative pb-9 pl-8 last:pb-0"
                >
                  <span
                    data-testid="timeline-node"
                    aria-hidden="true"
                    className="absolute -left-2 top-1 h-4 w-4 rounded-full border-4"
                    style={{
                      backgroundColor: 'var(--mau-chinh)',
                      borderColor: 'var(--mau-nen)',
                      boxShadow: '0 0 0 1px var(--mau-chinh)',
                    }}
                  />

                  <p
                    className="text-sm font-medium tracking-wider tabular-nums"
                    style={{ color: 'var(--mau-phu)' }}
                  >
                    {sk.gio}
                  </p>
                  <h3
                    className="mt-1 text-xl"
                    style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
                  >
                    {sk.ten}
                  </h3>

                  {sk.diaDiem && <p className="mt-1 font-medium">{sk.diaDiem}</p>}

                  <a
                    href={lienKetThemVaoLich(sk)}
                    download={tenTepLich(sk)}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition hover:-translate-y-0.5 hover:shadow-md"
                    style={{ borderColor: 'var(--mau-chinh)', color: 'var(--mau-chinh)' }}
                  >
                    <svg
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v3m10-3v3M4.5 9h15M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
                    </svg>
                    Thêm vào lịch
                  </a>

                  {sk.banDoAnh && (
                    <Image
                      src={sk.banDoAnh.url}
                      alt={sk.banDoAnh.moTa}
                      width={800}
                      height={500}
                      sizes="(max-width: 768px) 80vw, 480px"
                      className="mt-4 w-full rounded-xl"
                    />
                  )}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}
