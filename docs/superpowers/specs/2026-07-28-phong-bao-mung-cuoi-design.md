# Thiết kế phong bao Mừng cưới

## Mục tiêu

Khi admin bật tùy chọn che QR, phần Mừng cưới hiển thị hai phong bao rõ ràng cho Nhà trai và Nhà gái. Khách bấm vào phong bao nào thì xem thông tin mừng cưới của đúng bên đó trong popup, thay vì làm lộ QR ngay trong bố cục thiệp.

## Phạm vi

- Giữ nguyên chế độ hiện trực tiếp QR khi tùy chọn che QR bị tắt.
- Thay biểu tượng hộp quà hiện tại bằng hai phong bao dựng bằng CSS, không thêm ảnh phụ thuộc.
- Mỗi phong bao có nhãn Nhà trai hoặc Nhà gái và nút bấm độc lập.
- Mỗi lần chỉ có một popup thông tin mừng cưới.
- Không thay đổi dữ liệu thiệp, schema hoặc giao diện chỉnh sửa admin.

## Giao diện và chuyển động

- Phong bao dùng tông đỏ và vàng, có nắp thư, thân thư và con dấu chữ Hỷ.
- Màu nhấn tận dụng biến màu hiện có của theme khi phù hợp để không lạc khỏi mẫu thiệp.
- Hai phong bao chuyển động nổi nhẹ và lệch nhịp nhau.
- Khi hover hoặc focus, phong bao nhấc lên nhẹ và thể hiện rõ đây là phần có thể bấm.
- Tôn trọng `prefers-reduced-motion`: tắt chuyển động lặp khi người dùng yêu cầu giảm chuyển động.
- Bố cục giữ hai lựa chọn dễ phân biệt trên màn hình nhỏ, không làm tràn khung thiệp.

## Popup QR

- Bấm phong bao Nhà trai mở QR và thông tin chuyển khoản Nhà trai; Nhà gái hoạt động tương tự.
- Popup có tiêu đề bên nhận, QR, chủ tài khoản, ngân hàng, số tài khoản và nút sao chép.
- Có thể đóng bằng nút đóng, bấm vùng nền hoặc phím Escape.
- Khóa cuộn trang nền trong lúc popup mở.
- Popup có vai trò dialog, tên truy cập được và focus phù hợp cho người dùng bàn phím.

## Thành phần

- `MungCuoi` quản lý bên đang được mở hoặc trạng thái đóng.
- `PhongBao` chỉ hiển thị phong bao và phát sự kiện chọn bên.
- `PopupMungCuoi` hiển thị `ThongTin` của bên đã chọn và xử lý các cách đóng.
- `ThongTin` tiếp tục là nguồn hiển thị duy nhất cho QR và thông tin tài khoản để tránh lặp logic.

## Kiểm thử

- Chế độ hiện trực tiếp vẫn hiển thị đủ thông tin hai bên và không có phong bao.
- Chế độ che QR ban đầu không để QR hoặc số tài khoản xuất hiện trong DOM.
- Có đúng hai nút phong bao với nhãn truy cập được.
- Bấm từng phong bao mở dialog đúng bên, không hiển thị thông tin bên còn lại.
- Popup đóng được bằng nút đóng, vùng nền và Escape.
- Thuộc tính CSS/markup cần thiết cho chuyển động giảm thiểu được kiểm tra ở mức phù hợp; kiểm tra hình ảnh và hover bằng trình duyệt.

## Ngoài phạm vi

- Upload mẫu phong bao tùy chỉnh.
- Chọn nhiều kiểu phong bao trong admin.
- Hiệu ứng mở nắp thư nhiều bước hoặc âm thanh.
