# Giao diện nền dài và trình dựng layer động

## Mục tiêu

Cho phép quản trị viên xuất một thiết kế dài từ Figma hoặc Canva thành ảnh, dùng ảnh đó làm nền cố định của thiệp, rồi đặt các thành phần động và tương tác của E-Wedding lên trên. Một bố cục được thiết kế một lần phải co giãn đúng tỷ lệ trên mọi chiều rộng điện thoại và có thể lưu thành mẫu để tái sử dụng.

Thiệp trên màn hình máy tính tiếp tục hiển thị trong khung điện thoại căn giữa. Phiên bản đầu không nhập trực tiếp cấu trúc layer từ Figma hoặc Canva.

## Mô hình hiển thị

Mỗi mẫu dùng một canvas dọc duy nhất:

1. `Background layer`: một ảnh PNG, JPG hoặc WebP dài, luôn khóa và rộng 100% canvas.
2. `Decoration layer`: chữ trang trí, ảnh, hoa văn và khung.
3. `Content layer`: dữ liệu thiệp như tên, ngày cưới, album, đếm ngược, sự kiện và bản đồ.
4. `Interactive layer`: RSVP, mừng cưới, nút và liên kết tùy chỉnh.

Ảnh nền quyết định tỷ lệ và chiều cao canvas. Các layer phía trên lưu vị trí và kích thước tương đối so với canvas bằng phần trăm. Góc xoay, độ trong suốt, thứ tự trước–sau, trạng thái khóa và trạng thái ẩn được lưu riêng.

Canvas co giãn đồng nhất theo chiều rộng thiết bị. Ảnh nền không bị cắt và chiều cao trang thay đổi theo đúng tỷ lệ gốc. Trên desktop, canvas dùng chiều rộng tối đa của khung điện thoại hiện có và được căn giữa.

## Trình chỉnh sửa

### Nhập nền

- Quản trị viên tải một ảnh dài từ Figma hoặc Canva.
- Hệ thống đọc chiều rộng, chiều cao và tỷ lệ của ảnh để tạo canvas.
- Ảnh nền được khóa mặc định và không thể chọn nhầm trong thao tác thông thường.
- Hệ thống giữ bản gốc, đồng thời tạo biến thể tối ưu cho trang khách xem.

### Thư viện thành phần

Thanh thành phần cho phép thêm:

- Chữ cố định hoặc chữ liên kết dữ liệu.
- Ảnh đơn và họa tiết trang trí.
- Album ảnh.
- Đồng hồ đếm ngược.
- Lịch trình và sự kiện.
- Bản đồ hoặc nút mở bản đồ.
- RSVP.
- Mừng cưới.
- Nút và liên kết tùy chỉnh.

Các thành phần có thể mang nhãn section để dễ tìm kiếm và quản lý, nhưng vẫn nằm trên một canvas liền mạch; nhãn section không chia cắt ảnh nền.

### Thao tác layer

Quản trị viên có thể:

- Kéo thả và thay đổi kích thước trực tiếp trên bản xem trước.
- Xoay, đổi độ trong suốt và sắp xếp thứ tự trước–sau.
- Nhân bản, ẩn, hiện, khóa, mở khóa và xóa.
- Chọn layer bị che khuất qua danh sách layer.
- Dùng đường căn chỉnh, bắt dính và chỉ báo khoảng cách.
- Hoàn tác hoặc làm lại trong phiên chỉnh sửa.

Không cho xóa một layer đang khóa cho đến khi quản trị viên mở khóa nó.

### Thuộc tính

Thanh thuộc tính thay đổi theo loại thành phần. Nó cho phép sửa nội dung, kiểu chữ, màu, kích thước, ảnh, nguồn dữ liệu, hành vi tương tác và liên kết. Liên kết tùy chỉnh chỉ chấp nhận giao thức an toàn và cho phép chọn mở trong cùng trang hoặc tab mới.

### Chế độ và xem trước

Editor có hai chế độ:

- `Chỉnh sửa`: chọn và thao tác layer; các hành động RSVP, mừng cưới và liên kết không được kích hoạt.
- `Xem như khách mời`: bỏ điều khiển editor và dùng hành vi tương tác thật.

Các nút xem nhanh mô phỏng chiều rộng 360, 390 và 430 px. Đây là các mức kiểm tra; dữ liệu bố cục không được lưu thành ba biến thể riêng.

## Dữ liệu mẫu và dữ liệu thiệp

Một mẫu giao diện lưu:

- Tham chiếu ảnh nền gốc và các biến thể tối ưu.
- Kích thước tự nhiên của ảnh.
- Danh sách layer theo thứ tự dựng.
- Hình học, trạng thái và cấu hình riêng của từng layer.
- Liên kết dữ liệu động và giá trị mẫu dùng trong editor.

Layer nội dung có thể liên kết với các trường của `Invitation`, ví dụ tên cô dâu, tên chú rể, ngày cưới, album và lịch trình. Thành phần phức hợp như RSVP hoặc mừng cưới liên kết với cấu hình tương ứng thay vì sao chép dữ liệu vào mẫu.

Khi tạo thiệp từ mẫu, thiệp tham chiếu mẫu và cung cấp dữ liệu cưới. Thay đổi dữ liệu không làm thay đổi bố cục mẫu. Quản trị viên có thể chọn `Tách khỏi mẫu` để tạo một bản bố cục riêng cho thiệp; thao tác này phải yêu cầu xác nhận vì các cập nhật sau đó của mẫu sẽ không còn áp dụng.

## Luồng dữ liệu

1. Quản trị viên nhập ảnh nền.
2. Hệ thống kiểm tra ảnh, lưu bản gốc và tạo biến thể tối ưu.
3. Quản trị viên kéo thành phần lên canvas.
4. Editor lưu hình học tương đối và cấu hình của layer.
5. Quản trị viên gắn layer với dữ liệu thiệp hoặc đặt nội dung cố định.
6. Mẫu được lưu dưới dạng bản nháp và có thể xuất bản sau khi kiểm tra.
7. Renderer tải mẫu, kết hợp với dữ liệu thiệp và dựng các component thật phía trên nền.

## Responsive và khả năng sử dụng

- Vị trí và kích thước hình học dùng phần trăm của canvas, không dùng tọa độ pixel cố định.
- Cỡ chữ được tính từ cấu hình layer nhưng có giới hạn tối thiểu và tối đa để tránh quá nhỏ hoặc quá lớn.
- Thành phần tương tác phải giữ vùng bấm tối thiểu phù hợp trên điện thoại.
- Renderer không tự sắp xếp lại layer theo breakpoint; mục tiêu là giữ nguyên bố cục nghệ thuật đã duyệt.
- Nội dung chữ thay đổi độ dài phải nằm trong hộp giới hạn. Editor cảnh báo tràn chữ thay vì âm thầm dịch chuyển các layer khác.

## Hiệu năng và xử lý ảnh

- Kiểm tra định dạng, kích thước pixel và dung lượng trước khi nhận ảnh.
- Cảnh báo khi ảnh có nguy cơ làm trang tải chậm.
- Tạo WebP tối ưu và các mức chiều rộng phù hợp với khung điện thoại.
- Ảnh nền rất dài có thể được chia thành các mảnh nội bộ để tải và giải mã theo vùng cuộn. Việc chia mảnh không làm thay đổi mô hình một nền liền mạch trong editor.
- Các ảnh nội dung nằm xa màn hình đầu tiên được tải lười.
- Renderer ưu tiên nội dung đầu trang và không chặn tương tác chỉ vì các vùng phía dưới chưa tải xong.

## Lưu nháp và phiên bản

- Editor tự động lưu bản nháp khi có thay đổi.
- Mỗi lần xuất bản tạo một phiên bản có thể phục hồi.
- Khách chỉ xem phiên bản đã xuất bản; thay đổi nháp không ảnh hưởng thiệp đang hoạt động.
- Nếu lưu tự động thất bại, editor giữ thay đổi cục bộ trong phiên và hiển thị trạng thái chưa lưu rõ ràng.

## Kiểm tra trước khi xuất bản

Hệ thống cảnh báo:

- Layer nằm hoàn toàn hoặc một phần ngoài canvas.
- Chữ tràn hộp giới hạn.
- Liên kết không hợp lệ.
- Vùng bấm quá nhỏ.
- Thành phần động chưa được gắn dữ liệu và không có giá trị dự phòng.
- Ảnh nền hoặc ảnh nội dung quá nặng.

Cảnh báo không phá hủy dữ liệu. Lỗi liên kết không an toàn hoặc thiếu dữ liệu bắt buộc phải được sửa trước khi xuất bản.

## Kiểm thử

- Kiểm thử phép chuyển đổi giữa tọa độ canvas và tọa độ phần trăm.
- Kiểm thử canvas giữ tỷ lệ ở nhiều chiều rộng, gồm 360, 390 và 430 px.
- Kiểm thử kéo, đổi kích thước, xoay, phân lớp, khóa, ẩn, nhân bản, hoàn tác và làm lại.
- Kiểm thử liên kết dữ liệu cho chữ, ảnh và các component phức hợp.
- Kiểm thử chế độ chỉnh sửa không kích hoạt hành động thật và chế độ khách mời có thể tương tác.
- Kiểm thử tạo thiệp từ mẫu và tách thiệp khỏi mẫu.
- Kiểm thử tự động lưu, phục hồi phiên bản và trạng thái mất kết nối.
- Kiểm thử cảnh báo xuất bản và chặn liên kết không an toàn.
- Kiểm thử tải lười hoặc chia mảnh ảnh dài không tạo khe hở nhìn thấy được.
- Kiểm thử trực quan trên điện thoại nhỏ, điện thoại lớn và khung desktop căn giữa.

## Ngoài phạm vi phiên bản đầu

- Đọc trực tiếp file Figma hoặc Canva.
- Chuyển tự động các layer trong thiết kế nguồn thành component của E-Wedding.
- Tự nhận diện vùng trống trong ảnh.
- Bố cục desktop riêng.
- Tự sắp xếp lại layer theo breakpoint.
- Đồng chỉnh sửa thời gian thực bởi nhiều quản trị viên.

## Tiêu chí hoàn thành

- Có thể nhập một ảnh nền dài và thấy nó liền mạch trong editor lẫn trang khách.
- Có thể thêm, chỉnh và khóa mọi loại layer đã liệt kê.
- Một mẫu hoạt động đúng ở mọi chiều rộng điện thoại mà ảnh nền không bị cắt.
- Thành phần động dùng dữ liệu thật và thành phần tương tác vẫn hoạt động như component.
- Có thể lưu mẫu, tạo thiệp từ mẫu và tách một thiệp để chỉnh riêng.
- Có tự động lưu, lịch sử phiên bản và kiểm tra trước khi xuất bản.
- Thiệp desktop hiển thị trong khung điện thoại căn giữa.
