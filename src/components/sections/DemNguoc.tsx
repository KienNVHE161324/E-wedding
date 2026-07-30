import type { SectionProps } from './types'
import { luoiLichThang, ngayTrongThang, tenThang, TEN_THU } from '@/lib/invitation/lich'
import { VungChu } from '@/components/text/VungChu'

export function DemNguoc({ thiep }: SectionProps) {
  const tuan = luoiLichThang(thiep.ngayCuoi)
  const ngayCuoi = ngayTrongThang(thiep.ngayCuoi)

  // Ngày đầu chỉ đánh dấu được khi rơi vào cùng tháng với ngày cưới chính.
  const cungThang = thiep.ngayPhu?.slice(0, 7) === thiep.ngayCuoi.slice(0, 7)
  const ngayDau = cungThang && thiep.ngayPhu ? ngayTrongThang(thiep.ngayPhu) : null

  return (
    <section data-section="dem-nguoc" className="px-6 py-16 text-center">
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        <VungChu id="dem-nguoc.tieu-de" thiep={thiep} noiDung="Save the date" />
      </h2>

      <p className="mt-2 text-sm tracking-widest" style={{ color: 'var(--mau-phu)' }}>
        <VungChu
          id="dem-nguoc.thang"
          thiep={thiep}
          noiDung={tenThang(thiep.ngayCuoi).toUpperCase()}
        />
      </p>

      <table className="mx-auto mt-6 border-separate border-spacing-1">
        <thead>
          <tr>
            {TEN_THU.map((thu, index) => (
              <th
                key={thu}
                scope="col"
                className="w-10 pb-1 text-xs font-normal"
                style={{ color: 'var(--mau-phu)' }}
              >
                <VungChu id={`dem-nguoc.thu.${index}`} thiep={thiep} noiDung={thu} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tuan.map((hang, i) => (
            <tr key={i}>
              {hang.map((ngay, j) => {
                const laNgayCuoi = ngay === ngayCuoi
                const laNgayDau = ngay !== null && ngay === ngayDau
                return (
                  <td key={j} className="h-10 w-10 text-sm">
                    {ngay !== null && (
                      <span
                        // Ngày cưới chính tô đặc, ngày đầu chỉ viền — để khách
                        // phân biệt được đâu là ngày quan trọng nhất.
                        aria-current={laNgayCuoi ? 'date' : undefined}
                        data-ngay-dau={laNgayDau ? 'true' : undefined}
                        className="flex h-10 w-10 items-center justify-center rounded-full"
                        style={
                          laNgayCuoi
                            ? { backgroundColor: 'var(--mau-chinh)', color: '#fff' }
                            : laNgayDau
                              ? {
                                  border: '2px solid var(--mau-chinh)',
                                  color: 'var(--mau-chinh)',
                                }
                              : undefined
                        }
                      >
                        <VungChu id={`dem-nguoc.ngay.${ngay}`} thiep={thiep} noiDung={ngay} />
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
