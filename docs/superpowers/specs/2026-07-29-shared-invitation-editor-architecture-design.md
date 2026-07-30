# Kiến trúc dùng chung tính năng sửa thiệp cho nhiều giao diện

Ngày: 2026-07-29

## Mục tiêu

Thiết kế lại kiến trúc sửa và hiển thị thiệp để mọi giao diện dùng chung một bộ
tính năng chỉnh sửa. Khi thêm giao diện mới, lập trình viên chỉ cần khai báo
theme, tài nguyên và cấu hình trình bày; không cần sao chép hoặc sửa riêng editor.

Các giao diện dùng chung cấu trúc nội dung và toàn bộ section hiện có: bìa, đếm
ngược, cô dâu chú rể, chuyện chúng mình, album, sự kiện, dress code, RSVP, mừng
cưới và sổ lưu bút.

## Phạm vi

Thiết kế bao gồm:

- Tách dữ liệu nội dung khỏi cấu hình giao diện.
- Chuẩn hóa hợp đồng của theme.
- Dùng chung editor, renderer và các section.
- Giữ dữ liệu khi đổi theme.
- Chuẩn hóa fallback, xử lý dữ liệu cũ và kiểm thử kiến trúc.

Thiết kế không bao gồm:

- Cho phép từng theme có section hoặc form chỉnh sửa độc quyền.
- Xây dựng trình kéo-thả bố cục tự do.
- Thay đổi nghiệp vụ xuất bản, RSVP, Google Sheets hoặc lưu trữ ảnh.

## Quyết định kiến trúc

Sử dụng composition và cấu hình thay vì kế thừa component bằng class hoặc tạo
editor riêng cho từng theme.

Hệ thống gồm bốn lớp:

1. `Invitation` lưu nội dung và các tùy chỉnh riêng của thiệp.
2. Editor dùng chung cập nhật một bản nháp `Invitation`.
3. Theme resolver hợp nhất mặc định hệ thống, theme và override của thiệp.
4. Renderer cùng các section dùng chung dựng cấu hình hiển thị đã hoàn chỉnh.

Editor và renderer không chứa nhánh điều kiện theo `themeId`. Một theme mới được
thêm qua registry và tuân theo cùng một hợp đồng.

## Mô hình dữ liệu

### Invitation

`Invitation` tiếp tục là nguồn dữ liệu duy nhất của nội dung thiệp. Nó chứa:

- Thông tin cô dâu, chú rể và ngày cưới.
- Album, lịch trình, câu chuyện và nhạc.
- RSVP, mừng cưới và QR.
- Danh sách section được bật và thứ tự tùy chỉnh.
- `themeId`.
- Các override giao diện do người dùng đã chủ động chỉnh.

`Invitation` không chứa bản sao mặc định của theme. Trường không được override sẽ
được resolve khi hiển thị.

### ThemeDefinition

Mỗi giao diện đăng ký một `ThemeDefinition` gồm:

- `id`, tên và ảnh xem trước.
- Design token: màu, font, khoảng cách, bo góc và độ rộng thiệp.
- Họa tiết theo các slot chuẩn.
- Cấu hình trình bày của các section dùng chung.
- Thứ tự section mặc định.
- Cấu hình mặc định cho QR và hiệu ứng.

Hợp đồng TypeScript phải bắt buộc các trường cần thiết. Những trường được phép
thiếu phải có fallback rõ ràng ở lớp mặc định hệ thống.

### Cấu hình đã resolve

`resolveInvitationView(invitation, theme)` trả về cấu hình hiển thị đầy đủ. Thứ
tự ưu tiên từ cao xuống thấp:

1. Override riêng của thiệp.
2. Giá trị của theme đang chọn.
3. Giá trị mặc định an toàn của hệ thống.

Resolver là hàm thuần, không đọc cơ sở dữ liệu và không gọi API. Renderer và các
section không tự lặp lại logic fallback.

## Kiến trúc editor

`BangSua.tsx` được tách thành các đơn vị có trách nhiệm rõ ràng:

- `InvitationEditorProvider`: quản lý bản nháp, hàm cập nhật, trạng thái lưu và
  theme đang chọn.
- `EditorShell`: bố cục thanh công cụ, danh sách panel và preview.
- `EDITOR_PANEL_REGISTRY`: đăng ký các panel chỉnh sửa dùng chung.
- `ThemeSelector`: chỉ cập nhật `themeId`.
- `InvitationPreview`: resolve cấu hình rồi gọi renderer dùng chung.
- Các panel nhập liệu nhỏ nhận `value` và `onChange`, không phụ thuộc một theme
  cụ thể.

Registry của editor chỉ mô tả các tính năng dùng chung. Khi thêm một tính năng
sửa thiệp mới, tính năng được thêm một lần vào model, panel và registry rồi tự
xuất hiện ở mọi giao diện.

## Kiến trúc renderer

`InvitationRenderer` tiếp tục là renderer duy nhất cho preview và trang công
khai. Preview không dựng một phiên bản mô phỏng riêng.

`SECTION_REGISTRY` ánh xạ mỗi `SectionId` tới đúng một component dùng chung.
Section nhận dữ liệu thiệp và cấu hình hiển thị đã resolve, không giả định theme
cụ thể hoặc vị trí section đứng trước/sau.

CSS của theme được biểu diễn bằng design token và biến CSS tại gốc thiệp. Những
khác biệt bố cục có giới hạn được thể hiện bằng variant có kiểu dữ liệu rõ ràng,
không bằng selector dựa trực tiếp trên `themeId`.

## Luồng dữ liệu

1. Server Component tải bản ghi và dữ liệu `Invitation`.
2. Dữ liệu được normalize trước khi truyền qua ranh giới Client Component.
3. `InvitationEditorProvider` tạo bản nháp ban đầu.
4. Panel gọi hàm cập nhật chung để tạo bản nháp mới bất biến.
5. Preview lấy theme từ registry, resolve cấu hình và render ngay.
6. Khi lưu, API nhận `Invitation`, kiểm tra schema rồi ghi nguồn dữ liệu duy nhất.
7. Trang công khai tải cùng `Invitation` và dùng cùng resolver, renderer.

Props truyền từ Server Component sang Client Component phải serializable, phù
hợp với quy tắc của phiên bản Next.js hiện tại trong dự án.

## Hành vi khi đổi giao diện

Khi thay `themeId`:

- Toàn bộ nội dung được giữ nguyên.
- Thứ tự và trạng thái bật/tắt section do người dùng đã chỉnh được giữ nguyên.
- Override màu sắc, họa tiết và cấu hình riêng đã có được giữ nguyên.
- Trường chưa override nhận mặc định của theme mới.
- Override trỏ tới tài nguyên không còn hợp lệ được resolver bỏ qua và thay bằng
  mặc định của theme hoặc hệ thống.

Editor không âm thầm xóa override khi đổi theme. Việc đặt lại tùy chỉnh, nếu được
bổ sung sau này, phải là một hành động riêng có xác nhận.

## Tương thích dữ liệu cũ

Một hàm normalize thuần chuyển dữ liệu đã lưu về hình dạng hiện hành trước khi
đưa vào editor hoặc renderer:

- Điền các collection còn thiếu bằng mảng rỗng.
- Áp dụng giá trị mặc định cho cấu hình tùy chọn cũ.
- Loại bỏ hoặc thay thế giá trị enum không còn được hỗ trợ.
- Không ghi ngược dữ liệu chỉ vì đã đọc; dữ liệu chỉ được lưu khi người dùng chủ
  động bấm lưu.

Nếu `themeId` không tồn tại, hệ thống dùng theme mặc định. Editor hiển thị cảnh
báo để người quản trị biết và có thể chọn theme hợp lệ trước khi lưu.

## Xử lý lỗi

- Theme thiếu hoặc sai: fallback theme mặc định và cảnh báo trong editor.
- Token tùy chọn bị thiếu: dùng mặc định hệ thống.
- Asset trang trí không tồn tại: không render asset đó; phần còn lại của thiệp
  vẫn hoạt động.
- API lưu lỗi: giữ nguyên bản nháp, hiển thị lỗi và cho phép thử lại.
- Dữ liệu không hợp lệ ở API: trả lỗi có cấu trúc, không ghi một phần.
- Resolver không được ném lỗi vì một override giao diện không hợp lệ có thể
  fallback an toàn.

## Kiểm thử

### Unit test

- Mọi theme trong registry thỏa `ThemeDefinition`.
- Resolver tuân thủ đúng thứ tự override, theme và mặc định hệ thống.
- Resolver fallback an toàn cho theme, token và asset không hợp lệ.
- Normalizer xử lý được dữ liệu thiệp cũ và không làm mất nội dung.

### Component test

- Một thao tác chỉnh sửa dùng chung cập nhật preview ở ít nhất hai theme.
- Đổi theme giữ nguyên nội dung, thứ tự section và override.
- Các panel không phụ thuộc `themeId`.
- Preview và renderer công khai nhận cùng dữ liệu thì cho cùng cấu trúc section.

### End-to-end test

Luồng chính:

1. Mở một thiệp trong admin.
2. Sửa nội dung và một tùy chỉnh giao diện.
3. Đổi sang theme khác.
4. Xác nhận dữ liệu vẫn còn và preview nhận mặc định mới ở trường chưa override.
5. Lưu và tải lại editor.
6. Mở trang công khai và xác nhận kết quả trùng với preview.

## Tiêu chí hoàn thành

- Không có editor hoặc renderer riêng theo `themeId`.
- Thêm một theme mới không cần thay đổi các panel chỉnh sửa.
- Mọi section và tính năng sửa hiện tại hoạt động với mọi theme đăng ký.
- Đổi theme không làm mất nội dung hoặc override đã lưu.
- Preview admin và trang công khai dùng chung resolver và renderer.
- Các kiểm thử contract, resolver, component và end-to-end nêu trên đều đạt.

