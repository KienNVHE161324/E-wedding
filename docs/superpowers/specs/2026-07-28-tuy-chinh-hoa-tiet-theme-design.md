# Thiết kế tùy chỉnh họa tiết mặc định của theme

## Mục tiêu

Cho phép admin điều chỉnh đầy đủ chữ Hỷ nền và họa tiết góc mặc định trên bìa, đồng thời bổ sung góc xoay cho mọi chi tiết trang trí tự do. Thiệp cũ không có cấu hình mới phải giữ nguyên giao diện hiện tại.

## Phạm vi

- Giữ nguyên chiều cao bìa một màn hình.
- Áp dụng cấu hình theme cho hai slot đang hiển thị trên bìa: `watermark` và `corner`.
- Không chuyển đổi hoặc migration dữ liệu thiệp cũ.
- Không thay đổi cấu trúc kho `image_collections`.
- Bổ sung góc xoay cho `ChiTietTrangTri`.

## Mô hình dữ liệu

Thêm `TuyChinhHoaTietTheme`:

- `id?: string`: ID ảnh trong `DANH_SACH_HOA_TIET`; thiếu thì dùng ảnh mặc định của theme.
- `x?: number`, `y?: number`: tọa độ phần trăm trong section.
- `kichThuoc?: number`: chiều rộng theo phần trăm section.
- `gocXoay?: number`: góc từ `-180` đến `180`.
- `mau?: string`: thiếu thì dùng `--mau-phu`.
- `doDam?: number`: từ `0` đến `1`.
- `raSauChu?: boolean`: mặc định giữ lớp hiện tại.
- `an?: boolean`: ẩn chi tiết mà không mất cấu hình.

`TuyChinhGiaoDien` nhận thêm:

```ts
hoaTiet?: Partial<Record<'watermark' | 'corner', TuyChinhHoaTietTheme>>
```

`ChiTietTrangTri` nhận thêm `gocXoay?: number`. Schema giới hạn góc trong khoảng `-180..180`.

## Giá trị mặc định và tương thích

- Bìa khai báo vị trí mặc định hiện tại cho từng slot:
  - `watermark`: giữa bìa, kích thước tương đương `w-2/3`, nằm sau chữ.
  - `corner`: giữa ngang gần đáy, kích thước tương đương `w-16`, nằm sau chữ.
- Khi thiệp thiếu `tuyChinhGiaoDien.hoaTiet`, renderer dùng nguyên ảnh, vị trí, kích thước, màu và độ đậm hiện tại.
- Dữ liệu cũ với `tuyChinhGiaoDien.doDam` tiếp tục được dùng làm fallback; cấu hình `hoaTiet[slot].doDam` mới có ưu tiên cao hơn.
- ID ảnh tùy chỉnh không còn tồn tại trong registry sẽ quay về ảnh mặc định của theme; không làm vỡ trang.

## Renderer

- Tạo một component chuyên render họa tiết theme có vị trí tự do.
- Component nhận slot, giá trị mặc định và override của thiệp.
- Ảnh được tra từ `DANH_SACH_HOA_TIET` khi có `id`; nếu không có ID thì dùng file theme.
- Transform thống nhất:

```css
translate(-50%, -50%) rotate(var(--goc-xoay))
```

- Lớp nội dung bìa vẫn ở `z-index: 10`; `raSauChu` chọn lớp dưới hoặc trên nội dung giống `LopTrangTri`.
- Họa tiết luôn `pointer-events: none`.

## Trình chỉnh sửa admin

Mỗi slot `Họa tiết nền` và `Góc trang trí` có:

- Ảnh xem trước và nút chọn/thay từ kho.
- Nút khôi phục ảnh mặc định của theme.
- Thanh ngang, dọc, kích thước, góc xoay và độ đậm.
- Bộ chọn màu.
- Checkbox `Ra sau chữ`.
- Checkbox `Ẩn chi tiết`.

Mọi chi tiết trong `ChonChiTiet` có thêm thanh `Xoay`, dùng cùng khoảng `-180..180`.

## Kiểm thử

- Schema chấp nhận góc hợp lệ và từ chối góc ngoài khoảng.
- Thiệp cũ thiếu cấu hình mới vẫn render hai họa tiết ở giá trị mặc định.
- Override thay đổi đúng ảnh, tọa độ, kích thước, màu, độ đậm, góc và lớp.
- `an: true` không render slot.
- ID tùy chỉnh hỏng không làm component lỗi.
- `LopTrangTri` áp dụng góc xoay cho chi tiết tự do.
- Admin cập nhật đúng từng trường và không làm mất các override khác.

## Ngoài phạm vi

- Kéo thả trực tiếp trên bản xem trước.
- Tạo keyframe chuyển động riêng cho họa tiết.
- Chỉnh tỷ lệ chiều rộng/chiều cao độc lập.
- Migration biến họa tiết theme thành `ChiTietTrangTri`.
