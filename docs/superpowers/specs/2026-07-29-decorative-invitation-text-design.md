# Chữ gắn với chi tiết thiệp D1

## Vấn đề

D1.1, D1.2 và D1.5 đã được chuyển từ mẫu thay thế toàn bộ bìa thành chi tiết trang trí dùng được ở mọi section. Tuy nhiên, model `ChiTietTrangTri` và component `LopTrangTri` chỉ hỗ trợ ảnh, nên người quản trị không còn cách nhập chữ vào vùng trống của các mẫu D1.

## Mục tiêu

Khôi phục khả năng nhập chữ cho D1 nhưng giữ nguyên vai trò của D1 là một chi tiết trang trí tùy chọn. Chữ gắn với D1, di chuyển, thu phóng và xoay cùng D1, không thay thế nội dung chính của section.

## Thiết kế dữ liệu

`ChiTietTrangTri` nhận thêm trường tùy chọn `chu`:

```ts
interface ChuChiTietTrangTri {
  noiDung: string
  font: 'serif-co-dien' | 'sans-sach'
  coChu: number
  mauChu: string
  canLe: 'left' | 'center' | 'right'
}
```

`ChiTietTrangTri.chu?: ChuChiTietTrangTri` chỉ được giao diện quản trị cung cấp cho những asset có cấu hình vùng chữ. Schema chấp nhận trường này ở mọi chi tiết để dữ liệu không phụ thuộc vào danh mục asset tại thời điểm parse, nhưng renderer chỉ dựng chữ khi asset hiện tại có vùng chữ hợp lệ.

Ba mẫu D1 dùng một bảng metadata riêng, ánh xạ ID asset sang:

- vùng chữ theo phần trăm bên trong ảnh: `x`, `y`, `rong`, `cao`, và góc xoay nội bộ nếu có;
- giá trị chữ mặc định: phông, cỡ, màu và căn lề;
- tỷ lệ khung ảnh gốc.

Metadata không được đặt trong `danhSach.ts` vì file đó được sinh tự động.

## Giao diện quản trị

Trong `ChonChiTiet`, khi chi tiết đang chỉnh có metadata vùng chữ:

- hiện textarea “Chữ trên thiệp”;
- hiện lựa chọn phông chữ, cỡ chữ, màu chữ và căn lề;
- thay đổi nào cũng cập nhật `chiTietTrangTri[i].chu`;
- nội dung để trống nghĩa là không dựng chữ;
- chi tiết không có metadata vùng chữ không hiển thị nhóm điều khiển này.

Khi thêm D1 mới, `chu` được khởi tạo với nội dung rỗng và các giá trị mặc định của chính mẫu đó. Chi tiết thường tiếp tục dùng dữ liệu cũ, không nhận thêm trường không cần thiết.

## Dựng giao diện

`LopTrangTri` dựng mỗi D1 trong một wrapper tuyệt đối:

- wrapper chịu vị trí, kích thước, góc xoay, độ đậm và z-index của `ChiTietTrangTri`;
- ảnh D1 dùng PNG màu gốc với `object-contain`;
- lớp chữ nằm trong vùng phần trăm do metadata quy định;
- ảnh và chữ là con của cùng wrapper nên mọi transform áp dụng đồng bộ;
- wrapper giữ `pointer-events: none` để không chặn thao tác của khách.

Các họa tiết một màu không có metadata tiếp tục được dựng bằng `HoaTiet` và CSS mask như hiện tại.

## Tương thích

- Thiệp cũ không có `chu` tiếp tục parse và render.
- D1 không có nội dung chữ chỉ hiển thị ảnh.
- D1 vẫn dùng được ở mọi `SectionId`.
- Nội dung chính, nút bấm và bố cục của section không thay đổi.
- Không tạo lại cơ chế “mẫu bìa” chuyên biệt.

## Kiểm thử

- Schema giữ đúng cấu hình chữ hợp lệ và từ chối cỡ/màu/căn lề không hợp lệ.
- Thêm D1 khởi tạo cấu hình chữ mặc định; thêm họa tiết thường không tạo `chu`.
- Bảng chỉnh D1 cho phép nhập nội dung và cập nhật callback.
- Bảng chỉnh họa tiết thường không hiển thị “Chữ trên thiệp”.
- `LopTrangTri` dựng ảnh màu gốc và chữ đúng nội dung cho D1.
- `LopTrangTri` không dựng chữ khi nội dung rỗng.
- Kiểm thử hiện có cho họa tiết CSS mask tiếp tục pass.

## Tiêu chí hoàn thành

- Người quản trị chọn D1 ở bất kỳ section nào và nhập được chữ.
- Chữ di chuyển, thu phóng và xoay cùng D1.
- D1 hiển thị màu ảnh gốc.
- D1 không thay thế nội dung chính.
- Test, lint và production build đều thành công.
