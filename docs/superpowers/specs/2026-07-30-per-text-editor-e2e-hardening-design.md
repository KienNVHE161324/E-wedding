# Thiết kế hardening E2E và bố cục chỉnh chữ mobile

## Mục tiêu

Bộ E2E chỉnh chữ phải luôn chạy trên đúng build của nhánh hiện tại, đăng nhập bằng tài khoản kiểm thử cục bộ và kiểm tra được thao tác chọn/kéo chữ trên desktop lẫn mobile.

## Nguyên nhân đã xác nhận

- Playwright dùng cổng 3000 với `reuseExistingServer`, nên có thể chạy nhầm một Next server của checkout khác.
- Một số locator không khớp chính xác, dẫn tới strict-mode violation khi UI có nhãn gần giống nhau.
- Ở viewport mobile, panel chỉnh sửa chiếm toàn bộ chiều cao và phủ tọa độ của preview; phần tử trong panel chặn pointer event dành cho vùng chữ.

## Thiết kế

### Cô lập server E2E

Playwright dùng cổng 3100 riêng cho cả `baseURL`, lệnh `next start` và health check. Luôn đặt `reuseExistingServer: false` để mỗi lượt E2E build và chạy đúng code của worktree hiện tại.

### Locator ổn định

Các control có tên là tiền tố của control khác phải dùng `exact: true`. Cụ thể gồm ô nhập mã màu, nút `Lưu` và các control được duyệt trong test nhãn.

### Bố cục mobile

Khung chỉnh sửa tiếp tục dùng một trang và xếp dọc dưới breakpoint `lg`. Panel form có chiều cao tối đa theo viewport, co lại được và cuộn nội bộ; preview là vùng riêng bên dưới, có chiều cao tối thiểu đủ để nhìn, chạm chọn và kéo text. Từ `lg` trở lên giữ bố cục hai cột hiện tại.

Không dùng `force: true` trong E2E vì thao tác đó sẽ che giấu lỗi người dùng thật.

## Tiêu chí chấp nhận

- Server đang chạy ở cổng 3000 không được E2E tái sử dụng.
- 4 case desktop pass và case touch không áp dụng được skip.
- 4 case mobile pass và case chuột không áp dụng được skip.
- Không có phần tử panel nào chặn thao tác click/pointer trên preview mobile.
- Unit test, lint và production build vẫn pass.

## Ngoài phạm vi

- Không đổi kiến trúc đăng nhập Supabase.
- Không đổi giao diện desktop.
- Không đưa credential E2E vào Git.
