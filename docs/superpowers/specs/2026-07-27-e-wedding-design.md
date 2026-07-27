# E-Wedding — Thiết kế hệ thống thiệp cưới online

Ngày: 2026-07-27
Trạng thái: đã duyệt thiết kế, chưa lập kế hoạch triển khai

## 1. Mục tiêu và mô hình vận hành

Xây dựng hệ thống tạo thiệp cưới online cho thị trường Bắc Ninh.

Mô hình **dịch vụ**: khách đặt hàng, đội ngũ nội bộ nhập liệu qua trang quản trị và giao cho khách một đường link thiệp. Khách không tự đăng ký tài khoản.

Sản phẩm gồm hai mặt:

- **Web quản trị (nội bộ, phải đăng nhập)** — quản lý danh sách các đám cưới, tạo thiệp mới, sửa nội dung, xuất bản, gia hạn, xem RSVP.
- **Web app cưới (công khai)** — chính là thiệp khách mời nhận được. Đây là **thứ duy nhất** xem được mà không cần đăng nhập.

Mỗi thiệp là một slug trên một web app dùng chung (ví dụ `/nam-linh`). Không xuất file tĩnh.

### 1.1 Phân quyền

- Mọi đường dẫn dưới `/admin` và `/api/admin` đều yêu cầu đăng nhập. Chưa đăng nhập thì bị chuyển về trang đăng nhập.
- Mỗi nhân viên có **tài khoản riêng** (email + mật khẩu, qua Supabase Auth). Không dùng mật khẩu chung, để biết ai tạo đơn nào và khóa được từng người khi nghỉ việc.
- Trang thiệp `/[slug]` và API RSVP là công khai, không cần đăng nhập.

### 1.2 Vòng đời một thiệp

Mỗi thiệp có ba trạng thái:

| Trạng thái | Ý nghĩa | Khách vào link thấy gì |
|---|---|---|
| `nhap` | Đang soạn, chưa giao khách | Trang "thiệp chưa mở" |
| `da-xuat-ban` | Đã giao khách, đang trong hạn | Thiệp đầy đủ |
| `het-han` | Quá hạn | Trang "thiệp đã hết hạn" |

Đồng hồ **bắt đầu chạy khi admin bấm Xuất bản**, không phải lúc tạo. Soạn thảo trước bao lâu cũng không tính vào hạn. Mặc định **14 ngày**, admin sửa được ngày hết hạn cho từng đơn và **gia hạn** bất cứ lúc nào — bấm gia hạn là thiệp sống lại ngay.

Hết hạn **không xóa dữ liệu**: nội dung thiệp và toàn bộ RSVP vẫn nguyên trong DB và trong Google Sheet. Chỉ chặn hiển thị công khai. Lý do không chọn "cho xem mãi, chỉ khóa RSVP": ảnh phải lưu vô thời hạn, dung lượng tăng tuyến tính theo số đám cưới và sẽ phát sinh chi phí lưu trữ.

## 2. Phạm vi

**v1 (bản này):** khung hệ thống hoàn chỉnh + **1 theme "Quan họ Bắc Ninh"** chạy được đầu-cuối, gồm renderer, đăng nhập nhân viên, bảng điều khiển quản lý nhiều đám cưới, trang sửa thiệp, vòng đời xuất bản/hết hạn, đồng bộ Google Sheet, thư viện họa tiết.

**Sau v1:** nhân bản thêm 29 theme trên cùng khung. Đây là công việc thiết kế lặp lại, không phát sinh kiến trúc mới.

**Ngoài phạm vi (YAGNI):** tài khoản khách hàng, thanh toán, trình kéo-thả tự do kiểu Canva, xuất bản tĩnh, nhúng Google Maps sống, sinh QR ngân hàng tự động.

## 3. Kiến trúc

Nền tảng: **Next.js (App Router) trên Vercel + Supabase (Postgres + Storage)**.

Ba tầng tách bạch:

| Tầng | Trách nhiệm | Không biết về |
|---|---|---|
| `renderer` | Nhận một object `Invitation` → dựng trang thiệp | DB, Google, trang quản trị |
| `admin` | Nhập liệu, upload ảnh, chọn theme, đảo/tắt section | thiệp trông ra sao |
| `rsvp-sync` | Nhận submit → ghi DB → append Google Sheet | giao diện |

Ràng buộc: `renderer` là hàm thuần theo dữ liệu vào. Muốn kiểm thử một theme chỉ cần dựng dữ liệu mẫu, không cần DB.

### 3.1 Theme là dữ liệu, không phải code

Mỗi theme là một file khai báo (`themes/<id>.ts`) gồm: bảng màu, cặp font, bộ họa tiết dùng ở từng vị trí, kiểu hiệu ứng, thứ tự section mặc định.

Đây là điều kiện tiên quyết để 30 bộ giao diện khả thi và để sửa lỗi một chỗ ăn cả 30. Không theme nào được chứa logic bố cục riêng.

### 3.2 Nguyên tắc "mọi thứ là một ô"

Mọi thành phần nhìn thấy trên thiệp đều là một ô có thể thay: ô chữ, ô ảnh, ô họa tiết, ô màu, cờ bật/tắt. Theme chỉ là bộ giá trị mặc định điền sẵn vào các ô. Không thành phần hiển thị nào được đóng cứng trong code renderer.

### 3.3 Dữ liệu

Bảng chính:

- `invitations` — slug, theme_id, nội dung (JSON theo cấu trúc ô), danh sách section + thứ tự, spreadsheet_id.
- `rsvps` — invitation_id, bên (nhà trai / nhà gái), các trường form, trạng thái đồng bộ Sheet.
- `assets` — ảnh đã upload, gắn với invitation.

Ảnh lưu Supabase Storage. Trang thiệp render phía máy chủ theo slug: sửa trong quản trị là thấy ngay, không build lại, và link dán Zalo/Facebook hiện đúng ảnh xem trước.

## 4. Cấu trúc trang thiệp

Các section, theo thứ tự mặc định. Mỗi section bật/tắt và đảo thứ tự được cho từng thiệp.

1. **Bìa** — toàn màn hình: tên cô dâu chú rể, ngày cưới, nút "Mở thiệp". Nút này mở khóa cuộn và bật nhạc — cú chạm của khách là thứ hợp thức hóa việc phát nhạc, do trình duyệt mobile chặn autoplay.
2. **Save the date** — đếm ngược **chỉ theo số ngày** ("Còn 42 ngày"), không giờ phút. Nút thêm vào lịch tải file `.ics`, điện thoại tự mở app lịch mặc định.
3. **Cô dâu & chú rể** — ảnh, tên, giới thiệu, tên bố mẹ hai bên, link mạng xã hội.
4. **Chuyện chúng mình** *(tùy chọn)* — dạng lật từng chặng: mỗi chặng một ảnh lớn kèm một hai câu, có nút sang/lùi và vuốt được trên mobile. Kể bằng hình là chính.
5. **Album ảnh** — lưới nhiều ảnh; chạm vào ảnh nào ảnh đó phóng to toàn màn hình, vuốt qua lại, chạm ra ngoài để đóng.
6. **Sự kiện** — lễ nhà trai / nhà gái / tiệc: thời gian, địa điểm. Bản đồ là **ô ảnh tự tải lên** (ảnh bản đồ đã chỉnh màu hợp tông thiệp) kèm dòng địa chỉ và một link "Chỉ đường" dán sẵn. Không nhúng iframe, không API key, không phí.
7. **Xác nhận tham dự** — form (mục 5). Kèm **nút nổi bám màn hình** hiện ngay khi mở thiệp và theo suốt lúc cuộn, chạm là nhảy xuống form.
8. **Mừng cưới** — hai ô ảnh QR (nhà trai, nhà gái) do đội ngũ tự tải lên sau khi chỉnh màu, kèm tên chủ tài khoản và số tài khoản dạng chữ để khách chép tay.
9. **Sổ lưu bút** — lời chúc khách để lại, hiện sau khi duyệt.

### 4.1 Nhạc

Mỗi thiệp tải lên file MP3 riêng theo yêu cầu khách. Kèm một danh sách ngắn vài bản gợi ý (quan họ, hòa tấu nhẹ) để chọn nhanh khi khách không có yêu cầu riêng. Nút bật/tắt nhạc nổi ở góc, tắt được bất cứ lúc nào.

### 4.2 Hiệu ứng

Có chừng mực, ưu tiên máy yếu: section trôi lên khi cuộn vào, ảnh hiện dần, cánh hoa/nốt nhạc bay nhẹ ở bìa, ảnh bìa dịch chậm khi cuộn. Tất cả tự tắt khi thiết bị bật "giảm chuyển động" hoặc khi máy yếu.

### 4.3 Responsive

Mobile là thiết kế gốc, không phải bản thu nhỏ: một cột dọc liền mạch, chữ và vùng chạm đủ lớn, ảnh tải theo kích thước màn hình thật. Bản PC đặt thiệp giữa màn hình với hai dải họa tiết hai bên, không kéo giãn ảnh full-width.

### 4.4 Đảo và tắt section

Thứ tự section không nằm rải rác trong code. Mỗi thiệp giữ một danh sách khai báo:

```ts
sections: [
  { id: 'bia' },
  { id: 'dem-nguoc' },
  { id: 'mung-cuoi' },                            // kéo lên trước cô dâu chú rể
  { id: 'co-dau-chu-re' },
  { id: 'chuyen-chung-minh', enabled: false },    // tắt cho đám không có
  { id: 'album' },
]
```

Renderer chỉ đọc danh sách này và dựng theo đúng thứ tự. Theme khai báo thứ tự mặc định; từng thiệp ghi đè được.

**Ràng buộc bắt buộc:** mỗi section là một component độc lập, chỉ nhận dữ liệu của riêng nó, không được giả định section nào đứng trước hoặc sau mình.

## 5. Xác nhận tham dự và Google Sheet

### 5.1 Trường dữ liệu

Khách điền trên web. Mỗi dòng ghi nhận: ngày đăng ký, họ tên, quan hệ với cô dâu/chú rể, phương tiện di chuyển, đến ăn ngày nào, bên nhà trai hay nhà gái.

Cuối form có thêm ô **"Lời chúc"** không bắt buộc. Nội dung ô này hiển thị ở section Sổ lưu bút sau khi được duyệt, và cũng được ghi vào Sheet như một cột. Khách chỉ phải điền một lần duy nhất.

### 5.2 Google Sheet

Dùng service account. Khi tạo một đơn thiệp có bật tính năng này, hệ thống tự sinh một spreadsheet gồm **2 tab: `Nhà trai` và `Nhà gái`**, đặt quyền truy cập đầy đủ. Mỗi RSVP được append vào đúng tab theo bên khách chọn.

Sheet là **bản tổng hợp một chiều**. Nguồn sự thật là DB — ai lỡ xóa dòng trên Sheet cũng không mất dữ liệu.

### 5.3 Xử lý lỗi

Nếu Google API lỗi hoặc quá hạn mức, RSVP vẫn lưu DB thành công và khách thấy thông báo thành công bình thường. Bản ghi được đánh dấu chưa đồng bộ và đẩy lại sau qua hàng đợi retry. Không bao giờ để lỗi phía Google làm hỏng trải nghiệm khách mời.

## 6. Web quản trị

### 6.1 Bảng điều khiển

Trang đầu sau khi đăng nhập: **danh sách toàn bộ đám cưới**. Mỗi dòng hiện tên cô dâu chú rể, slug, ngày cưới, trạng thái, số ngày còn lại, số lượt xác nhận tham dự. Có tìm kiếm theo tên hoặc slug, lọc theo trạng thái.

Thao tác trên từng đơn: mở trang sửa, xuất bản, gia hạn, mở link thiệp, mở Google Sheet.

Nút **Tạo đám cưới mới**: nhập slug, tên chú rể, tên cô dâu, ngày cưới, chọn theme. Hệ thống dựng sẵn một thiệp đầy đủ ở trạng thái `nhap` với thứ tự section mặc định của theme, rồi mở thẳng trang sửa. Slug phải là duy nhất và chỉ gồm chữ thường, số, dấu gạch ngang.

### 6.2 Trang sửa thiệp

Một trang tổng hợp mọi phần custom được của một thiệp, thay vì một form dài. Liệt kê theo từng section; mỗi section hiện đủ các ô của nó (chữ, ảnh, bật/tắt, thứ tự). Sửa bên trái, thiệp thật hiện bên phải, đổi là thấy ngay — để ngồi cùng khách và sửa tại chỗ.

Nguyên tắc bắt buộc: **các chi tiết tách rời nhau**, mỗi ô sửa độc lập và có nhãn tiếng Việt nói rõ nó là gì. Người không biết gì về thiết kế phải tự sửa được mà không sợ làm hỏng phần khác.

Phạm vi v1: sửa chữ, sửa ảnh, bật/tắt section, đảo thứ tự section, đổi theme, xuất bản, gia hạn, xem trước trực tiếp.

Ngoài phạm vi: kéo thả tự do kiểu Canva.

Mọi yêu cầu thường gặp của khách (đổi ảnh, đổi chữ, đảo section, tắt section, đổi màu chủ đạo, thay họa tiết) phải làm được **không cần lập trình viên**.

## 7. Theme "Quan họ Bắc Ninh" và thư viện họa tiết

### 7.1 Định hướng thị giác

Tinh thần đình chùa Kinh Bắc, liền anh liền chị, hội Lim.

- **Màu:** nâu gỗ đình chùa, đỏ son cửa võng, vàng đồng, nền giấy dó ngà. Tránh hồng pastel — sai chất.
- **Chữ:** một font có chân dáng cổ cho tên cô dâu chú rể, một font sạch dễ đọc cho nội dung. Bắt buộc đủ dấu tiếng Việt; đây là chỗ dễ hỏng, phải kiểm riêng.

### 7.2 Thư viện họa tiết

Toàn bộ họa tiết là **SVG do đội ngũ dựng trong code**, không phụ thuộc file thiết kế bên ngoài. Bộ ban đầu: mái đình cong đầu đao, cổng tam quan (Đền Đô), tháp chùa Keo, nón quai thao, quạt giấy, dải yếm, hoa sen, hoa văn triện và chữ Hỷ, sóng nước mây trời, đôi chim.

Thư viện là **tài sản chung, không thuộc riêng theme nào**. Mỗi thiệp chọn từ thư viện gắn vào các vị trí: khung viền bìa, dải phân cách giữa section, góc trang trí, nền mờ.

Vì là SVG nét, họa tiết **ăn theo màu của thiệp** — cùng một nón quai thao, thiệp nâu ra nâu, thiệp xanh ra xanh, không phải vẽ lại.

Đây là thứ khiến 30 bộ giao diện khả thi: một bộ mới = chọn màu + chọn font + chọn họa tiết. Thêm item mới về sau không được đụng vào code thiệp.

## 8. Kiểm thử

Test tự động, bốn điểm bắt buộc:

1. RSVP: submit → có trong DB → đúng dòng, đúng tab Nhà trai/Nhà gái trên Sheet.
2. Google API sập → khách vẫn submit thành công, dữ liệu được đẩy lại sau.
3. Đảo và tắt section → thiệp render đúng thứ tự mới, không vỡ bố cục.
4. Mỗi theme render đầy đủ với dữ liệu mẫu — chạy cho toàn bộ theme, một theme hỏng là phát hiện ngay.
5. Phân quyền: chưa đăng nhập vào `/admin` bị chuyển về trang đăng nhập; trang thiệp công khai vẫn vào được bình thường.
6. Vòng đời: thiệp `nhap` và thiệp quá hạn hiện đúng trang thông báo; bấm gia hạn thì thiệp mở lại được.

Kiểm tay bổ sung trên thiết bị thật: iPhone Safari, Android Chrome, và điều kiện mạng chậm.
