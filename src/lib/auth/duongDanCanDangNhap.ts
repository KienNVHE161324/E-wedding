/**
 * Chỉ khu quản trị mới cần đăng nhập.
 * Thiệp công khai và API dành cho khách mời luôn mở.
 */
export function canDangNhap(duongDan: string): boolean {
  return (
    duongDan === '/admin' ||
    duongDan.startsWith('/admin/') ||
    duongDan === '/api/admin' ||
    duongDan.startsWith('/api/admin/')
  )
}
