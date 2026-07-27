/**
 * HỢP ĐỒNG lưu trữ tệp.
 *
 * Nơi lưu ảnh là chi tiết thay thế được: ổ đĩa máy chủ, Supabase Storage,
 * hay Cloudflare R2 đều cài đặt cùng giao diện này. Phần còn lại của ứng dụng
 * chỉ biết "đưa tệp vào, nhận đường dẫn ra".
 */
export interface KhoLuuTru {
  /** Tên hiển thị, dùng trong thông báo lỗi. */
  ten: string
  /**
   * Lưu tệp và trả về đường dẫn công khai để nhúng vào thiệp.
   * @param duongDan khóa tệp, dạng `<slug>/<uuid>.<đuôi>`
   */
  luu(duongDan: string, tep: File): Promise<string>
  /** Xóa tệp. Không tìm thấy thì coi như đã xóa, không ném lỗi. */
  xoa(duongDan: string): Promise<void>
}
