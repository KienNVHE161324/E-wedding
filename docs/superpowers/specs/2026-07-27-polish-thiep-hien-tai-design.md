# Hoàn thiện mẫu thiệp hiện tại

## Mục tiêu

Hoàn thiện trải nghiệm của mẫu thiệp đang có trước khi phát triển website marketing và thư viện mẫu. Phạm vi gồm bìa, lịch trình và sổ lưu bút; không thay đổi dữ liệu nghiệp vụ của đám cưới.

## Phạm vi phase hiện tại

### 1. Bìa và chi tiết trang trí

- Chữ Hỷ và mọi họa tiết không được che tên cô dâu/chú rể hoặc nút **Mở thiệp**.
- Họa tiết nền của theme luôn ở lớp nền, không chặn tương tác.
- Chi tiết mới lấy từ `Image_collections` thông qua registry hiện có.
- Chi tiết admin tự thêm mặc định nằm sau chữ. Admin vẫn có thể đổi màu, vị trí ngang/dọc, kích thước, độ đậm, vị trí nhanh và lớp trước/sau chữ trong `ChonChiTiet`.
- Nút và nội dung tương tác luôn có lớp hiển thị cao hơn họa tiết nền.
- Không sao chép asset trực tiếp vào component; registry sinh bởi `npm run hoa-tiet` tiếp tục là nguồn duy nhất.

### 2. Lịch trình dạng mục lục một trục

Áp dụng phương án A đã được duyệt:

- Một đường thẳng dọc nằm bên trái.
- Mỗi sự kiện có một node tròn trên đường thẳng.
- Nội dung nằm bên phải node: giờ, tên sự kiện, địa điểm, nút thêm vào lịch và ảnh bản đồ nếu có.
- Mỗi ngày có một nhãn ngày phía trên nhóm sự kiện.
- Node cuối của từng ngày kết thúc đường trục, không để đoạn dây thừa.
- Bố cục một cột, ưu tiên màn hình điện thoại; không xen trái/phải và không dùng đường SVG uốn lượn.
- Màu node và điểm nhấn lấy từ biến theme, không hard-code theo một mẫu.

### 3. Sổ lưu bút

- Trạng thái mặc định chỉ hiển thị lịch sử lời chúc.
- Danh sách có chiều cao tối đa; nội dung dài cuộn dọc bên trong thay vì kéo dài toàn bộ thiệp.
- Thanh cuộn mảnh, dùng màu theme, có bo mềm và vẫn dùng được bằng chuột, cảm ứng và bàn phím.
- Lời chúc mới nhất nằm trên đầu như hiện tại.
- Nút **Gửi lời chúc** nằm dưới danh sách và mở popup.
- Popup chứa tên người gửi, nội dung, trạng thái đang gửi, lỗi và lời cảm ơn.
- Popup đóng bằng nút đóng, phím Escape hoặc chạm ra ngoài; khóa cuộn nền trong lúc mở.
- Gửi thành công: lời chúc mới xuất hiện ngay đầu danh sách, form được xóa và popup đóng sau khi hiện xác nhận ngắn.
- API `/api/loi-chuc` và trang quản trị lời chúc giữ nguyên.

## Khả năng truy cập và chuyển động

- Popup có `role="dialog"`, `aria-modal`, tên truy cập và focus ban đầu.
- Nút có focus-visible; trường nhập có label thật.
- Tôn trọng `prefers-reduced-motion`.
- Họa tiết có `pointer-events: none`.

## Kiểm thử

- Test bìa xác nhận họa tiết nền không che/chặn nút và chi tiết mới mặc định ra sau chữ.
- Test lịch trình xác nhận đường SVG cũ biến mất, node và thứ tự sự kiện đúng.
- Test sổ lưu bút xác nhận form không hiện sẵn, nút mở popup, đóng popup bằng nút/Escape, gửi đúng payload và cập nhật lịch sử.
- Chạy toàn bộ Vitest, TypeScript, ESLint và build trước khi commit/push.

## Phase sau: website marketing

Lưu lại, chưa triển khai trong phase này:

- Trang chủ công khai giới thiệu dịch vụ và thông tin liên hệ Zalo/Facebook.
- Danh mục mẫu và sản phẩm đã thực hiện do admin quản lý.
- Trang chi tiết chỉ hiển thị nội dung có sẵn; phần review/nhận xét khách hàng để giai đoạn sau.
- Mỗi mẫu có thể có ảnh preview và liên kết tới một thiệp demo hoạt động đầy đủ.
- Khách chỉ xem và liên hệ đặt thiệp; không tự đăng ký hoặc tự tạo thiệp.
- `/admin/**` và `/api/admin/**` tiếp tục là khu vực duy nhất yêu cầu đăng nhập.

