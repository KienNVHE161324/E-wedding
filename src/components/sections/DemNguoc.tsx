import type { SectionProps } from './types'
import { luoiLichThang, ngayTrongThang, tenThang, TEN_THU } from '@/lib/invitation/lich'

export function DemNguoc({ thiep }: SectionProps) {
  const tuan = luoiLichThang(thiep.ngayCuoi)
  const ngayCuoi = ngayTrongThang(thiep.ngayCuoi)

  return (
    <section data-section="dem-nguoc" className="px-6 py-16 text-center">
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Save the date
      </h2>

      <p className="mt-2 text-sm tracking-widest" style={{ color: 'var(--mau-phu)' }}>
        {tenThang(thiep.ngayCuoi).toUpperCase()}
      </p>

      <table className="mx-auto mt-6 border-separate border-spacing-1">
        <thead>
          <tr>
            {TEN_THU.map((thu) => (
              <th
                key={thu}
                scope="col"
                className="w-10 pb-1 text-xs font-normal"
                style={{ color: 'var(--mau-phu)' }}
              >
                {thu}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tuan.map((hang, i) => (
            <tr key={i}>
              {hang.map((ngay, j) => {
                const laNgayCuoi = ngay === ngayCuoi
                return (
                  <td key={j} className="h-10 w-10 text-sm">
                    {ngay !== null && (
                      <span
                        // Ngày cưới được khoanh tròn để khách nhận ra ngay.
                        aria-current={laNgayCuoi ? 'date' : undefined}
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={
                          laNgayCuoi
                            ? { backgroundColor: 'var(--mau-chinh)', color: '#fff' }
                            : undefined
                        }
                      >
                        {ngay}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
