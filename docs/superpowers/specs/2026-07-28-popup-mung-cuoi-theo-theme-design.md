# Thiết kế popup Mừng cưới theo theme

## Mục tiêu

Popup Mừng cưới phải là vùng sáng, rõ nét phía trên thiệp được làm tối và mờ. Toàn bộ màu sắc popup tuân theo theme và màu tùy chỉnh của từng thiệp. Khách có thể tải ảnh QR hoặc sao chép số tài khoản bằng các nút icon nhỏ.

## Nguyên nhân cần sửa

Popup hiện được render bằng portal vào `document.body`, nằm ngoài phần tử đang chứa các biến CSS `--mau-nen`, `--mau-chu`, `--mau-chinh` và `--mau-phu`. Vì vậy các thuộc tính dùng biến theme trong popup không có giá trị, khiến nền popup bị trong suốt.

## Kiến trúc

- Bỏ portal của `PopupMungCuoi` và render popup ngay trong cây `InvitationRenderer`.
- `position: fixed` tiếp tục phủ toàn màn hình; popup vẫn hoạt động độc lập với vị trí section.
- Popup kế thừa trực tiếp các biến CSS của thiệp, không sao chép biến sang `body` và không đặt màu theme toàn cục.
- `ThongTin` nhận thêm chế độ hiển thị trong popup nhưng vẫn là nguồn duy nhất cho QR và thông tin chuyển khoản.

## Giao diện

- Lớp phủ sử dụng màu được pha từ `--mau-chu` với độ trong suốt và `backdrop-filter` để làm tối, mờ phần thiệp phía sau.
- Popup dùng nền đặc `--mau-nen`, pha sáng nhẹ khi trình duyệt hỗ trợ `color-mix`.
- Viền và bóng đổ lấy sắc độ từ `--mau-chinh` và `--mau-phu`.
- Nội dung popup không nhận blur hoặc opacity từ lớp phủ.
- Tiêu đề, nút đóng, icon tải và icon sao chép có hover/focus theo theme.

## Tải QR

- Khi `o.qrAnh` tồn tại, hiển thị một nút icon tải nhỏ gần ảnh QR.
- Nút dùng URL ảnh hiện tại và thuộc tính tải xuống với tên file an toàn theo bên nhận.
- Không hiển thị nút tải khi không có ảnh QR.
- Nút có `aria-label` rõ ràng: `Tải QR Nhà trai` hoặc `Tải QR Nhà gái`.

## Sao chép số tài khoản

- Bỏ nút chữ lớn `Chép số tài khoản`.
- Hiển thị số tài khoản và một nút icon sao chép nhỏ trên cùng một hàng.
- Sau khi sao chép thành công, icon đổi tạm thành dấu xác nhận và nhãn truy cập đổi thành `Đã sao chép`.
- Nếu Clipboard API không khả dụng hoặc thất bại, giao diện giữ trạng thái ban đầu và không báo thành công giả.

## Tương tác và truy cập

- Popup vẫn đóng bằng nút đóng, bấm vùng nền hoặc Escape.
- Trang nền bị khóa cuộn khi popup mở.
- Nút đóng được focus khi popup mở.
- Icon có vùng bấm đủ rộng dù hình biểu tượng nhỏ, kèm trạng thái hover và focus rõ.
- Tôn trọng `prefers-reduced-motion`.

## Kiểm thử

- Test tái hiện nguyên nhân: popup không còn phụ thuộc portal và giữ trong cây theme.
- Mở phong bao đúng bên vẫn chỉ hiện thông tin bên đó.
- Có link tải khi có QR, đúng URL và tên file; không có link khi thiếu QR.
- Icon sao chép gọi Clipboard API với đúng số tài khoản và chuyển sang trạng thái xác nhận.
- Không hiển thị nút chữ lớn cũ.
- Các cách đóng popup tiếp tục hoạt động.

## Ngoài phạm vi

- Sinh QR mới từ số tài khoản.
- Chia sẻ QR trực tiếp sang ứng dụng khác.
- Thông báo toast toàn trang.
