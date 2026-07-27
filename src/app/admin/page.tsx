import { batBuocDangNhap } from '@/lib/auth/server'
import { layDanhSachThiep } from '@/lib/db/danhSach'
import { BangDieuKhien } from '@/components/admin/BangDieuKhien'

export const dynamic = 'force-dynamic'

export default async function TrangBangDieuKhien() {
  await batBuocDangNhap()
  const danhSach = await layDanhSachThiep(new Date())
  return <BangDieuKhien danhSach={danhSach} />
}
