# Thiết kế lịch xuất bản và hủy URL thiệp

Ngày: 2026-07-29

## Mục tiêu

Thay cách đặt “số ngày mở thiệp” bằng hai thời điểm rõ ràng:

- ngày và giờ xuất bản;
- ngày và giờ đóng.

Cho phép hủy đường dẫn công khai của một thiệp mà không xóa nội dung, ảnh, RSVP hay lời chúc. Đường dẫn vừa hủy được phép dùng lại ngay cho thiệp khác.

## Trạng thái và hành vi công khai

Một thiệp có các trạng thái quản trị:

- `nhap`: chưa đặt lịch;
- `da-len-lich`: đã có giờ mở và giờ đóng nhưng chưa tới giờ mở;
- `da-xuat-ban`: giờ hiện tại nằm trong khoảng mở;
- `het-han`: đã tới hoặc qua giờ đóng;
- `da-huy`: quản trị viên đã hủy đường dẫn công khai.

Không cần tiến trình nền để đổi trạng thái theo đồng hồ. Ứng dụng suy ra trạng thái tại thời điểm mỗi yêu cầu được xử lý:

- trước `ngay_xuat_ban`: trang công khai hiện “Thiệp chưa được mở”;
- từ `ngay_xuat_ban` và trước `ngay_dong`: hiển thị thiệp;
- từ đúng `ngay_dong`: chỉ hiện “Thiệp đã đóng”;
- sau khi hủy URL: đường dẫn cũ không còn trỏ tới thiệp và có thể trả về trang không tìm thấy hoặc trỏ tới một thiệp mới nếu URL được tái sử dụng.

Các API RSVP và lời chúc chỉ chấp nhận yêu cầu khi thiệp đang trong khoảng mở.

## Múi giờ

Biểu mẫu quản trị dùng ngày và giờ địa phương Việt Nam (`Asia/Ho_Chi_Minh`). Máy chủ chuyển giá trị sang UTC trước khi lưu trong Supabase. Khi hiển thị lại trong quản trị, giá trị được đổi về giờ Việt Nam.

Giờ đóng phải sau giờ xuất bản. API kiểm tra lại quy tắc này, không chỉ dựa vào kiểm tra của trình duyệt.

## Mô hình dữ liệu

Tách danh tính thiệp khỏi URL:

- thêm `id uuid` làm khóa chính ổn định của `invitations`;
- đổi `slug` thành `public_slug text null`;
- đặt unique index cho `public_slug` khi khác `null`;
- thêm trạng thái lưu `da-huy`;
- giữ `ngay_xuat_ban`;
- đổi ý nghĩa/tên `ngay_het_han` thành `ngay_dong`.

Các bảng phụ như RSVP và lời chúc tham chiếu `invitation_id`, không tham chiếu URL. Vì vậy hủy hoặc tái sử dụng URL không làm mất hoặc trộn dữ liệu giữa hai thiệp.

Nội dung JSON của thiệp không còn là nguồn sự thật cho URL. Khi render hoặc gửi yêu cầu công khai, ứng dụng dùng `public_slug` của bản ghi hiện hành.

Migration chuyển dữ liệu hiện có như sau:

- tạo `id` cho mọi thiệp;
- sao chép `slug` hiện tại sang `public_slug`;
- nối RSVP và lời chúc hiện tại sang đúng `invitation_id`;
- giữ nguyên thời điểm xuất bản/đóng và toàn bộ dữ liệu;
- chỉ gỡ các khóa cũ sau khi dữ liệu mới đã được điền và kiểm tra.

## Luồng quản trị

### Tạo thiệp

Quản trị viên tự nhập URL theo định dạng hiện tại: chữ thường không dấu, số và dấu gạch ngang. Nếu URL đang được một thiệp chưa hủy sử dụng, API trả mã `409` với thông báo “Đường dẫn đã tồn tại”. URL của thiệp đã hủy được phép dùng lại.

### Đặt hoặc sửa lịch

Khối xuất bản có hai ô `datetime-local`:

- “Ngày giờ xuất bản”;
- “Ngày giờ đóng”.

Nút hành động là “Lưu lịch xuất bản”. Có thể sửa hai mốc sau khi đã đặt lịch, miễn giờ đóng vẫn sau giờ mở. Trạng thái công khai được cập nhật tức thời theo lịch mới.

### Hủy URL

Trang sửa thiệp có nút nguy hiểm “Hủy thiệp và gỡ đường dẫn”. Sau hộp xác nhận:

- trạng thái lưu chuyển thành `da-huy`;
- `public_slug` được đặt thành `null`;
- nội dung, ảnh, RSVP, lời chúc và lịch cũ được giữ nguyên;
- trang quản trị tiếp tục truy cập thiệp bằng `id`, không phụ thuộc URL;
- dashboard hiển thị trạng thái “Đã hủy”.

Không hỗ trợ khôi phục hay gán URL mới cho thiệp đã hủy trong phạm vi thay đổi này. URL cũ có thể được dùng khi tạo thiệp mới.

## Định tuyến

- Trang công khai tiếp tục dùng `/{slug}` và tra cứu bằng `public_slug`.
- Trang quản trị chuyển sang `/admin/thiep/{id}` để vẫn mở được thiệp sau khi URL bị gỡ.
- Các API sửa, đặt lịch và hủy nhận `invitationId`.
- Các API công khai nhận URL nhưng ngay lập tức phân giải sang `invitation_id` trước khi đọc/ghi dữ liệu.

## Xử lý lỗi và cạnh tranh

- Unique index trong cơ sở dữ liệu là lớp bảo vệ cuối cùng khi hai người cùng chọn một URL.
- API ánh xạ lỗi unique thành `409` và thông báo “Đường dẫn đã tồn tại”.
- Hủy một thiệp đã hủy trả kết quả thành công theo kiểu idempotent.
- Không cho đặt lịch cho thiệp đã hủy.
- Không cho giờ đóng bằng hoặc trước giờ xuất bản.
- Nếu `id` quản trị không tồn tại, trả `404`.

## Kiểm thử

Thực hiện theo TDD, gồm:

- kiểm thử trạng thái trước giờ mở, đúng giờ mở, trước giờ đóng và đúng giờ đóng;
- kiểm thử chuyển đổi giờ Việt Nam sang UTC;
- kiểm thử validation giờ đóng;
- kiểm thử biểu mẫu gửi hai thời điểm thay cho số ngày;
- kiểm thử API báo `409` khi URL trùng;
- kiểm thử hủy đặt `public_slug = null`, giữ dữ liệu và cho phép dùng lại URL;
- kiểm thử trang công khai không còn tìm thấy thiệp đã hủy;
- kiểm thử RSVP/lời chúc bị từ chối ngoài khoảng mở;
- kiểm thử dashboard và trang quản trị vẫn truy cập được thiệp đã hủy bằng `id`;
- chạy toàn bộ test, lint và build sau khi hoàn tất.

## Ngoài phạm vi

- Xóa vĩnh viễn thiệp hoặc dữ liệu liên quan;
- xóa ảnh khỏi kho lưu trữ;
- khôi phục thiệp đã hủy;
- gán URL mới cho chính thiệp đã hủy;
- tên miền riêng cho từng thiệp;
- tác vụ cron để đổi trạng thái.
