# Thiết kế chọn và lặp đoạn nhạc cho thiệp

## Mục tiêu

Mỗi thiệp có thể phát toàn bộ bài nhạc hoặc chỉ phát lặp một đoạn dài 1 phút hay
30 giây. Admin chọn đoạn bằng thanh thời gian và nghe thử trước khi lưu. Hệ thống
không tạo thêm file âm thanh đã cắt; việc giới hạn và lặp đoạn được xử lý khi phát.

## Phạm vi

- Áp dụng cho cả nhạc mặc định trong `public/nhac` và nhạc MP3 tải riêng lên kho lưu trữ.
- Tạo `public/nhac` để chứa thư viện nhạc mặc định dùng chung.
- Không thêm xử lý FFmpeg, không tạo bản sao MP3 và không thay đổi cơ chế tải file riêng.
- Dữ liệu thiệp cũ tiếp tục phát toàn bộ bài như hiện tại.

## Dữ liệu

Đối tượng `nhac` tiếp tục có `url` và `ten`, đồng thời nhận hai trường tùy chọn:

- `batDau`: số giây bắt đầu đoạn phát, mặc định `0`.
- `thoiLuong`: `30`, `60` hoặc không có. Không có nghĩa là phát cả bài.

Khi chọn cả bài, giao diện xóa `batDau` và `thoiLuong` khỏi dữ liệu. Khi chọn một
đoạn, `batDau` được giới hạn từ `0` đến `max(0, độ dài bài - thoiLuong)`.

## Giao diện quản trị

Sau khi admin chọn hoặc tải một bài nhạc:

1. Hiển thị tên bài và trình nghe thử.
2. Hiển thị ba lựa chọn: `Cả bài`, `1 phút`, `30 giây`.
3. Khi chọn `1 phút` hoặc `30 giây`, hiển thị thanh thời gian để chọn điểm bắt đầu.
4. Bên dưới thanh hiển thị khoảng thời gian, ví dụ `Đoạn phát: 01:20 – 01:50`.
5. Trình nghe thử phát từ điểm bắt đầu, quay lại điểm đó khi chạm cuối đoạn.

Thanh chọn chỉ xuất hiện sau khi trình duyệt đọc được thời lượng bài. Trong lúc chờ
metadata, giao diện thông báo đang tải thông tin nhạc. Nếu không đọc được thời lượng,
admin vẫn có thể chọn cả bài; lựa chọn đoạn bị vô hiệu hóa và có thông báo ngắn.

Nếu bài ngắn hơn lựa chọn 30 giây hoặc 1 phút, điểm bắt đầu bị giới hạn về `0` và
điểm kết thúc là cuối bài. Bài vẫn được phát lặp bình thường.

## Phát nhạc trên thiệp

- Nhạc chỉ bắt đầu sau khi khách nhấn `Mở thiệp`, giữ nguyên quy tắc autoplay hiện tại.
- Với chế độ cả bài, phần tử audio tiếp tục dùng cơ chế lặp toàn bài.
- Với chế độ đoạn, trình phát bắt đầu tại `batDau`. Khi `currentTime` đạt
  `min(batDau + thoiLuong, duration)`, trình phát quay về `batDau` và phát tiếp.
- Khi khách tắt rồi bật lại, nhạc tiếp tục tại vị trí đang dừng nếu vị trí còn trong
  đoạn; nếu nằm ngoài đoạn thì quay về `batDau`.
- Nút bật/tắt nhạc hiện tại không thay đổi về hình thức hay vị trí.

## Thư viện nhạc mặc định

Các file MP3 mặc định nằm trong `public/nhac`. Danh mục dùng chung khai báo tên hiển
thị và URL của từng bài ở một module riêng để form quản trị không chứa danh sách
hard-code. Việc thêm bài mới gồm:

1. Copy file `.mp3` vào `public/nhac`.
2. Thêm tên hiển thị và đường dẫn vào danh mục.

Nhạc admin tải riêng vẫn đi qua API upload và kho lưu trữ đã cấu hình, mặc định là
Cloudflare R2.

## Kiểm thử

- Schema chấp nhận dữ liệu cũ và dữ liệu có `batDau`, `thoiLuong`.
- Form chuyển đúng giữa cả bài, 1 phút và 30 giây.
- Thanh chọn giới hạn điểm bắt đầu theo thời lượng thực tế.
- Nhạc nghe thử quay về đúng đầu đoạn khi chạm cuối.
- Thiệp phát cả bài như cũ khi thiếu cấu hình đoạn.
- Thiệp phát và lặp đúng đoạn khi có cấu hình.
- Trường hợp bài ngắn hơn đoạn chọn không tạo thời gian âm hoặc vượt thời lượng bài.

