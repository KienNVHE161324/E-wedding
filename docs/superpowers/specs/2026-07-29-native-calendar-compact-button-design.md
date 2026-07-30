# Nút thêm vào lịch mặc định

## Mục tiêu

Thu nhỏ nút thêm lịch trong từng mốc lịch trình và thay liên kết Google Calendar bằng tệp lịch `.ics` để thiết bị chuyển sự kiện tới ứng dụng lịch mặc định hoặc ứng dụng lịch tương thích do người dùng chọn.

## Giao diện

- Mỗi mốc lịch trình vẫn có một nút riêng.
- Nút là pill nhỏ, gồm biểu tượng lịch và nhãn `Thêm vào lịch`.
- Giảm cỡ chữ và khoảng đệm so với nút hiện tại nhưng giữ vùng bấm đủ rõ trên điện thoại.
- Màu viền và chữ tiếp tục dùng màu chính của thiệp.

## Hành vi

- Liên kết của nút là một tệp `.ics`, không còn mở `calendar.google.com`.
- Tệp chứa tên sự kiện, thời điểm bắt đầu, thời điểm kết thúc sau hai giờ và địa điểm nếu có.
- Múi giờ của sự kiện là `Asia/Ho_Chi_Minh`.
- Tên tệp tải xuống dễ nhận biết và an toàn cho hệ thống tệp.
- Không mở tab mới.

Trình duyệt và hệ điều hành quyết định ứng dụng xử lý tệp `.ics`. iOS thường chuyển tới Calendar. Trên Android, trình duyệt có thể mở ứng dụng lịch tương thích ngay hoặc yêu cầu người dùng chạm vào tệp vừa tải. Trang web không ép được một ứng dụng cụ thể nếu thiết bị không đăng ký xử lý tệp lịch.

## Kiến trúc

Hàm tiện ích lịch tạo nội dung iCalendar và chuyển nội dung thành data URL để liên kết có thể hoạt động ngay trên trang tĩnh, không cần API route hoặc dịch vụ bên ngoài. Component lịch trình chỉ chịu trách nhiệm hiển thị liên kết và thuộc tính tải xuống.

Nội dung iCalendar sẽ:

- dùng định dạng CRLF theo chuẩn;
- escape các ký tự đặc biệt trong tên và địa điểm;
- tạo mã sự kiện ổn định từ dữ liệu mốc lịch;
- khai báo múi giờ cho thời điểm bắt đầu và kết thúc.

## Kiểm thử

- Kiểm thử hàm tạo lịch xác nhận nội dung `.ics`, thời gian, múi giờ, địa điểm và escaping.
- Kiểm thử component xác nhận mỗi mốc có nút nhỏ đúng nhãn, liên kết `.ics`, thuộc tính tải xuống và không còn liên kết Google Calendar.
- Chạy toàn bộ unit test, lint và build.
- Kiểm tra trực quan ở kích thước điện thoại để bảo đảm nút gọn và không phá bố cục timeline.
