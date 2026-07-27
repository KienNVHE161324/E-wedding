import { redirect } from 'next/navigation'

// Trang gốc không có nội dung công khai: khách luôn vào bằng đường dẫn thiệp riêng.
export default function TrangGoc() {
  redirect('/admin')
}
