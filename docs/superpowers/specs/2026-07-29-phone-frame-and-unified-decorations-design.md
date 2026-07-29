# Thiệp khung điện thoại và hệ thống chi tiết trang trí thống nhất

## Mục tiêu

Thiệp xuất bản luôn giữ bố cục điện thoại dọc, kể cả khi được mở trên màn hình lớn. Tất cả ảnh trong thư viện chi tiết, bao gồm D1.1, D1.2 và D1.5, chỉ là lớp trang trí bổ sung và có thể được thêm vào mọi section. Chi tiết trang trí không thay thế nội dung hoặc bố cục chính của section.

## Phạm vi

### Khung thiệp

- `InvitationRenderer` dùng một chiều rộng tối đa duy nhất theo khung điện thoại dọc; không nới rộng riêng ở breakpoint desktop.
- Trên màn hình rộng, khung nằm giữa và phần ngoài khung chỉ đóng vai trò nền.
- Nội dung thiệp tiếp tục cuộn dọc theo trang.
- Trang khách xem và bản xem trước trong quản trị cùng dùng `InvitationRenderer`, nên nhận cùng quy tắc khung.

### Chi tiết trang trí

- D1.1, D1.2 và D1.5 nằm trong `DANH_SACH_HOA_TIET`, cùng nhóm chi tiết cưới hỏi hiện có.
- Chúng được chọn qua `ChonChiTiet`, không còn được trình bày như “mẫu bìa”.
- Mọi mục trong `DANH_SACH_HOA_TIET` đều có thể thêm vào mọi `SectionId`.
- Sau khi thêm, mỗi chi tiết dùng chung các điều khiển hiện có: vị trí ngang/dọc, kích thước, độ đậm, góc xoay, lớp trước hoặc sau chữ, và xóa.
- `LopTrangTri` tiếp tục là nơi duy nhất dựng các lớp trang trí trong thiệp.

### Nội dung chính của bìa

- Bìa luôn do component `Bia` chuẩn dựng: tên chú rể, tên cô dâu, nút “Mở thiệp” và họa tiết theme.
- Loại bỏ giao diện “Mẫu bìa và chữ trên thiệp”.
- D1.1/D1.2/D1.5 không được tạo vùng nhập chữ riêng và không được thay toàn bộ component bìa.
- Cấu hình `bia` chuyên biệt vừa được thêm trong nhánh làm việc sẽ được gỡ khỏi model/schema và các bài kiểm thử liên quan; dữ liệu trang trí vẫn lưu trong `chiTietTrangTri`.

## Luồng dữ liệu

1. Quản trị viên chọn một section.
2. Trong “Thêm chi tiết”, quản trị viên chọn bất kỳ ảnh nào từ thư viện.
3. `ChonChiTiet` thêm một `ChiTietTrangTri` có `section` là section đang chọn.
4. Các điều khiển cập nhật phần tử tương ứng trong `thiep.chiTietTrangTri`.
5. `InvitationRenderer` lọc chi tiết theo section và chuyển cho `LopTrangTri`.
6. `LopTrangTri` dựng ảnh mà không thay đổi component nội dung chính.

## Tương thích và giới hạn

- Không tạo một hệ thống riêng cho D1; các ảnh này tuân theo đúng cơ chế chi tiết chung.
- Không thêm cuộn ngang hoặc điều hướng dạng slide.
- Không thay đổi dữ liệu nội dung của các section.
- Các thay đổi chưa commit liên quan đến “mẫu bìa” được xem là công việc đang phát triển, chưa phải dữ liệu phát hành cần migration.

## Kiểm thử

- Kiểm tra D1.1/D1.2/D1.5 có mặt trong thư viện chi tiết.
- Kiểm tra một chi tiết bất kỳ có thể được thêm vào một section không phải bìa.
- Kiểm tra bìa vẫn hiển thị nội dung chính khi có chi tiết D1 phủ lên.
- Xóa hoặc cập nhật các kiểm thử kỳ vọng D1 thay thế bìa.
- Kiểm tra `InvitationRenderer` không còn breakpoint làm khung rộng hơn trên desktop.
- Chạy toàn bộ test suite và typecheck.

## Tiêu chí hoàn thành

- Không còn mục chọn “Mẫu bìa và chữ trên thiệp”.
- D1.1/D1.2/D1.5 xuất hiện trong “Thêm chi tiết” và dùng được ở mọi section.
- Thêm D1 không làm mất tên cô dâu, chú rể, nút mở thiệp hoặc nội dung chính khác.
- Thiệp khách xem và preview quản trị đều giữ chiều rộng điện thoại dọc trên mọi kích thước màn hình.
