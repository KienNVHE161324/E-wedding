# Nền kem ấm cho theme mặc định

## Mục tiêu

Đổi nền chính của theme mặc định từ trắng `#FFFFFF` sang kem ấm `#FFF8EF` để các vùng thiệp và họa tiết dễ quan sát hơn, đồng thời giữ cảm giác nhẹ và thanh lịch.

## Phạm vi

- Chỉ đổi `mau.nen` của theme `mac-dinh` thành `#FFF8EF`.
- Giữ nguyên màu chữ, màu chính, màu phụ, màu nhấn, font, họa tiết và độ đậm.
- Giữ nguyên nền QR hiện tại vì đã sử dụng cùng màu `#FFF8EF`.
- Không đổi các theme khác.
- Không ghi đè `tuyChinh.mauNen` của những thiệp đã chọn màu nền riêng.

## Hành vi

`InvitationRenderer` tiếp tục ưu tiên màu nền tùy chỉnh của thiệp. Khi thiệp không có màu nền tùy chỉnh, CSS variable `--mau-nen` nhận màu `#FFF8EF` từ theme mặc định và được dùng làm nền toàn thiệp.

## Kiểm thử

- Thêm kiểm thử xác nhận theme mặc định trả về `mau.nen` là `#FFF8EF`.
- Giữ kiểm thử hiện có về việc màu tùy chỉnh được ưu tiên.
- Chạy unit test, lint và production build.
- Kiểm tra trực quan thiệp mẫu ở kích thước điện thoại, bảo đảm nền kem hiển thị xuyên suốt và chữ vẫn rõ.
