import { batBuocDangNhap } from '@/lib/auth/server'
import { FormTaoMoi } from '@/components/admin/FormTaoMoi'

export const dynamic = 'force-dynamic'

export default async function TrangTaoMoi() {
  await batBuocDangNhap()
  return <FormTaoMoi />
}
