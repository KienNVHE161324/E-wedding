export function ThongBaoTrangThai({
  trangThai,
}: {
  trangThai: 'nhap' | 'da-len-lich' | 'het-han'
}) {
  const chuaMo = trangThai === 'nhap' || trangThai === 'da-len-lich'
  const tieuDe = chuaMo ? 'Thiệp chưa được mở' : 'Thiệp đã đóng'
  const noiDung =
    chuaMo
      ? 'Thiệp này đang được chuẩn bị. Bạn vui lòng quay lại sau nhé.'
      : 'Thiệp này đã đóng. Nếu bạn cần thông tin về lễ cưới, xin vui lòng liên hệ gia đình hai bên.'

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">{tieuDe}</h1>
      <p className="mt-3 text-neutral-600">{noiDung}</p>
    </main>
  )
}
