# Thiết kế căn giữa thông tin Mừng cưới

## Mục tiêu

Thông tin chuyển khoản trong popup Mừng cưới phải nằm đúng trục giữa, kể cả khi dòng số tài khoản có icon sao chép.

## Bố cục

- Không thêm nhãn `Ngân hàng:` hoặc `STK:`.
- Ảnh QR, chủ tài khoản, tên ngân hàng và số tài khoản đều căn giữa popup.
- Tên ngân hàng và số tài khoản nằm trên hai dòng riêng.
- Icon sao chép nằm sát bên phải số tài khoản nhưng không tham gia tính chiều rộng căn giữa của dòng.
- Icon tiếp tục có vùng bấm đủ rộng, nhãn truy cập và trạng thái xác nhận sau khi sao chép.

## Cách triển khai

- Khung số tài khoản dùng `position: relative` và co theo chiều rộng nội dung.
- Số tài khoản là phần tử trung tâm.
- Nút icon dùng `position: absolute`, đặt bên phải với khoảng cách nhỏ.
- Khung QR tiếp tục dùng `width: fit-content` và `margin-inline: auto`.

## Kiểm thử

- Popup vẫn hiển thị tên ngân hàng và số tài khoản trên hai phần tử riêng.
- Không xuất hiện nhãn `Ngân hàng:` hoặc `STK:`.
- Nút sao chép vẫn gửi đúng số tài khoản và đổi trạng thái thành công.
- Dòng số tài khoản dùng class bố cục dành cho căn giữa độc lập với icon.
