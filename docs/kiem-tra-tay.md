# Kiểm tra tay trước khi giao thiệp

Chạy trên **iPhone Safari** và **Android Chrome** thật, không dùng giả lập.

## Tùy chỉnh QR mừng cưới

- [ ] Trong **Tạo đám cưới mới**, bấm **Chọn kiểu QR** và kiểm tra đủ ba lựa chọn:
  **Tối giản**, **Hoa mềm**, **Phong bao**.
- [ ] Chọn một kiểu, tạo thiệp và xác nhận phần Mừng cưới kế thừa đúng kiểu đó.
- [ ] Tải ảnh QR thật cho hai bên; hoa, viền và phong bao không chạm vào vùng trắng
  quanh mã QR trên điện thoại và desktop.
- [ ] Đổi riêng kiểu/màu nhà trai; nhà gái không bị thay đổi. Bấm
  **Khôi phục theo giao diện** thì cấu hình riêng được xóa.
- [ ] Chọn hai màu gần nhau; editor cảnh báo độ tương phản và QR dùng màu đen trên
  nền trắng.
- [ ] Tải PNG đã tùy chỉnh. Với ảnh không cho phép canvas đọc chéo miền, hệ thống
  vẫn hiển thị và tải được ảnh gốc.
- [ ] Quét từng QR thật bằng ít nhất hai ứng dụng camera/ngân hàng trước khi xuất bản.

## Hiển thị
- [ ] Mọi chữ tiếng Việt hiện đủ dấu, không ô vuông, không mất mũ.
- [ ] Không cuộn ngang được ở bất kỳ phần nào.
- [ ] Ảnh không bị méo, không cắt mất mặt người.
- [ ] Nút bấm đủ lớn để chạm bằng ngón cái.
- [ ] Họa tiết ăn đúng màu của thiệp, không ra màu lạ.

## Phân quyền
- [ ] Mở link thiệp ở cửa sổ ẩn danh: xem được bình thường, không đòi đăng nhập.
- [ ] Mở /admin ở cửa sổ ẩn danh: bị đưa về trang đăng nhập.
- [ ] Đăng xuất rồi bấm Lưu ở trang sửa: báo lỗi cần đăng nhập, không mất dữ liệu đang sửa.

## Vòng đời
- [ ] Thiệp mới tạo: khách vào thấy "Thiệp chưa được mở".
- [ ] Sau khi xuất bản: khách vào thấy thiệp đầy đủ, bảng điều khiển hiện "Còn 14 ngày".
- [ ] Đặt ngày hết hạn về quá khứ: khách thấy "Thiệp đã hết hạn", form xác nhận không gửi được.
- [ ] Bấm gia hạn: thiệp mở lại ngay, RSVP cũ vẫn còn nguyên.

## Chọn phần hiển thị
- [ ] Tắt một phần rồi lưu: phần đó biến mất, không để lại khoảng trắng.
- [ ] Đổi thứ tự rồi lưu: thiệp hiện đúng thứ tự mới.
- [ ] Bật lại phần đã tắt: nội dung cũ còn nguyên, không phải nhập lại.
- [ ] Kéo thanh độ đậm: khung xem trước đổi ngay, lưu xong khách vào thấy đúng như vậy.

## Xác nhận tham dự
- [ ] Bỏ trống họ tên: hiện báo lỗi, không gửi.
- [ ] Gửi thành công: hiện lời cảm ơn.
- [ ] Kiểm tra Google Sheet: dòng mới nằm đúng tab Nhà trai/Nhà gái, đủ 6 cột.
- [ ] Bật chế độ máy bay rồi gửi: hiện báo lỗi thân thiện, không treo.

## Mạng chậm và máy yếu
- [ ] Giới hạn mạng ở mức "Slow 3G": bìa hiện trong vòng 5 giây.
- [ ] Bật "Giảm chuyển động" trong cài đặt máy: các phần hiện ngay, không trôi.
