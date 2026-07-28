# Thiết kế tùy chỉnh QR ảnh tải lên

## Mục tiêu

Cho phép nhân viên chọn cách trình bày ảnh QR mừng cưới đã tải lên mà không thay đổi
nội dung chuyển khoản trong QR. Tính năng cung cấp ba preset phù hợp với nhiều giao
diện thiệp cưới, có preview trực tiếp và vẫn giữ khả năng tương thích với thiệp cũ.

Tính năng không sinh VietQR/NAPAS và không chỉnh kiểu module hoặc mắt QR từ ảnh
raster. Việc tùy chỉnh font, cỡ chữ và màu chữ thuộc phase sau, không nằm trong phạm
vi này.

## Trải nghiệm tạo thiệp

Form tạo thiệp có nút `Chọn kiểu QR`. Nút mở popup chứa preview trực quan của ba
preset:

1. `Tối giản`: nền sáng, viền mảnh, ít trang trí.
2. `Hoa mềm`: khung bo góc và hoa cưới nằm ngoài vùng QR.
3. `Phong bao`: khung phong bao đỏ, chi tiết vàng và một vùng QR sáng riêng biệt.

Popup chỉ chọn preset mặc định chung cho thiệp. Màu ban đầu lấy từ theme đang chọn.
Form hiển thị preset đã chọn sau khi popup đóng. Không tải ảnh QR ở bước tạo thiệp;
ảnh nhà trai và nhà gái vẫn được thêm tại trang sửa.

Preset mặc định của theme mặc định là `hoa-mem`.

## Trải nghiệm chỉnh sửa

Trong phần `Mừng cưới`, mỗi bên nhà trai và nhà gái tiếp tục có trường tải ảnh QR.
Sau khi có ảnh, nhân viên có thể:

- dùng preset chung đã chọn lúc tạo thiệp;
- ghi đè preset riêng cho từng bên;
- dùng màu QR và màu nền của theme;
- ghi đè màu QR và màu nền riêng cho từng bên;
- xem preview thay đổi ngay trong trang sửa;
- khôi phục cấu hình theo theme.

Nếu một bên không có ảnh QR, khung tùy chỉnh không được render cho bên đó.

## Mô hình dữ liệu

Theme có cấu hình QR mặc định:

```ts
type KieuKhungQr = 'toi-gian' | 'hoa-mem' | 'phong-bao'

interface CauHinhQrTheme {
  kieuKhung: KieuKhungQr
  mauQr: string
  mauNen: string
}
```

Thiệp lưu preset chung được chọn khi tạo. Mỗi `OMungCuoi` có thể lưu ghi đè:

```ts
interface TuyChinhQr {
  kieuKhung?: KieuKhungQr
  mauQr?: string
  mauNen?: string
}

interface Invitation {
  kieuKhungQr?: KieuKhungQr
}

interface OMungCuoi {
  // các trường hiện có
  tuyChinhQr?: TuyChinhQr
}
```

Các trường đều optional để dữ liệu cũ tiếp tục parse và render được. Thứ tự resolve:

1. ghi đè của từng bên;
2. preset chung của thiệp;
3. cấu hình mặc định của theme;
4. fallback tương thích là cách hiển thị ảnh QR hiện tại.

Zod kiểm tra enum preset và màu dạng `#RRGGBB`.

## Render và xử lý ảnh

Một component QR chuyên trách nhận ảnh gốc và cấu hình đã resolve. Component:

- giữ một khoảng trắng an toàn quanh QR;
- đặt mọi khung và họa tiết bên ngoài khoảng trắng đó;
- dùng canvas để thay các pixel tối của ảnh QR bằng màu đã chọn;
- giữ nền sáng và độ tương phản đủ cao;
- fallback về ảnh gốc nếu canvas không tải hoặc xử lý được ảnh;
- không thay đổi hình học module và mắt QR.

Ảnh QR hiển thị trên thiệp và ảnh tải xuống dùng cùng một hàm resolve cấu hình để
không lệch preview. Nút tải xuống xuất PNG chứa màu, nền và khung hoàn chỉnh. Khi
không thể xuất canvas, nút tải ảnh gốc vẫn hoạt động.

## An toàn quét

Hệ thống tính độ tương phản giữa màu QR và màu nền. Editor cảnh báo và không dùng
màu tùy chỉnh nếu cặp màu dưới ngưỡng an toàn; preview khi đó dùng màu QR đen trên
nền trắng. Trang khách không hiển thị cảnh báo.

Hoa, viền và chi tiết phong bao không được đè lên QR hoặc vùng trắng an toàn.

## Thành phần dự kiến

- Popup chọn preset trong `FormTaoMoi`.
- Bộ preview thumbnail dùng chung giữa popup và editor.
- Resolver thuần cho cấu hình theme, thiệp và từng bên.
- Component render QR ảnh tải lên.
- Điều khiển preset/màu trong `OMungCuoi`.
- Cấu hình QR mặc định trong `Theme`.

Không đưa logic canvas vào `MungCuoi`; section này chỉ truyền dữ liệu đã có cho
component QR.

## Tương thích và lỗi

- Thiệp cũ không có cấu hình QR mới giữ cách hiển thị hiện tại.
- Ảnh QR khác nguồn gây lỗi canvas vẫn hiển thị và tải ảnh gốc được.
- Thiếu ảnh QR không tạo khung rỗng.
- Cấu hình màu không hợp lệ bị chặn bởi schema khi lưu.
- Popup tạo thiệp có thể đóng mà không chọn; khi đó dùng preset của theme.

## Kiểm thử

Thực hiện theo TDD:

- schema chấp nhận dữ liệu cũ và kiểm tra cấu hình mới;
- resolver áp dụng đúng thứ tự ghi đè;
- form tạo gửi preset đã chọn và dùng mặc định theme khi không chọn;
- popup hiển thị đủ ba preset, chọn và đóng đúng;
- editor thay preset/màu riêng từng bên;
- renderer giữ tương thích với QR cũ;
- renderer dùng đúng preset và fallback khi xử lý ảnh lỗi;
- cảnh báo màu tương phản thấp;
- nút tải dùng PNG đã custom khi có thể và ảnh gốc khi fallback;
- test hiện tại của `MungCuoi` tiếp tục chạy.

Sau khi unit/component test đạt, chạy lint, toàn bộ Vitest, build và các E2E liên
quan tới tạo/sửa/xem thiệp.

## Ngoài phạm vi

- Sinh QR ngân hàng hoặc VietQR.
- Decode hoặc thay nội dung QR.
- Đổi kiểu chấm, module hay mắt QR.
- Typography tùy chỉnh cho text.
- Một trình thiết kế QR kéo-thả tự do.
