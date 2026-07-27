import type { SectionProps } from './types'

export function DressCode({ thiep }: SectionProps) {
  const dc = thiep.dressCode
  // Chưa nhập gì thì không chiếm chỗ trên thiệp.
  if (!dc || (!dc.moTa.trim() && dc.mauSac.length === 0)) return null

  return (
    <section data-section="dress-code" className="px-6 py-16 text-center">
      <h2
        className="text-2xl"
        style={{ fontFamily: 'var(--font-tieu-de)', color: 'var(--mau-chinh)' }}
      >
        Dress code
      </h2>

      {dc.moTa && <p className="mx-auto mt-4 max-w-md">{dc.moTa}</p>}

      {dc.mauSac.length > 0 && (
        <p className="mx-auto mt-4 max-w-md text-sm" style={{ color: 'var(--mau-phu)' }}>
          Vui lòng mặc trang phục theo tông màu dưới đây để bức ảnh chung thêm trọn vẹn.
        </p>
      )}

      {dc.mauSac.length > 0 && (
        <ul className="mt-5 flex flex-wrap justify-center gap-3">
          {dc.mauSac.map((mau, i) => (
            <li
              key={`${mau}-${i}`}
              // Màu là thông tin, không phải trang trí, nên phải đọc được bằng trình đọc màn hình.
              aria-label={`Màu gợi ý ${mau}`}
              className="h-9 w-9 rounded-full border"
              style={{ backgroundColor: mau, borderColor: 'var(--mau-phu)' }}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
