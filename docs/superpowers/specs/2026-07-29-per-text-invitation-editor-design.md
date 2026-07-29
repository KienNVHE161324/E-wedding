# Thiết kế trình chỉnh sửa từng vùng chữ trên thiệp

## Bối cảnh

Thiệp hiện chỉ có hai token phông chữ toàn cục (`tieuDe`, `noiDung`), một bộ màu
theme và cấu hình chữ riêng cho ba chi tiết trang trí D1. Người quản trị chưa thể
chọn một vùng chữ cụ thể trên thiệp để sửa nội dung, phông, màu, cỡ và vị trí.

Tính năng này biến từng vùng chữ trình bày thành một đối tượng chỉnh sửa độc lập,
nhưng giữ nguyên component, bố cục responsive và nguồn dữ liệu nghiệp vụ hiện có.

## Mục tiêu

Người quản trị có thể:

- chọn từng vùng chữ trên preview hoặc trong danh sách vùng chữ;
- sửa nội dung của vùng;
- chọn phông chữ từ danh mục cho phép;
- sửa cỡ chữ và màu chữ;
- kéo-thả vùng chữ bằng chuột hoặc cảm ứng;
- tinh chỉnh vị trí bằng tọa độ `x/y`;
- xem thay đổi ngay trên preview và lưu cùng thiệp;
- đặt lại vị trí hoặc kiểu chữ của riêng vùng đang chọn.

Thiệp cũ không có cấu hình chữ phải tiếp tục parse và hiển thị giống hiện tại.

## Phạm vi

### Bao gồm

Các vùng chữ trình bày của từng section:

- Bìa: lời mở đầu, tên chú rể, ký hiệu nối, tên cô dâu, nút mở thiệp.
- Đếm ngược: tiêu đề, nhãn tháng. Các thứ và ngày trong lưới lịch dùng chung
  style theo hai vùng tập thể, không tạo một cấu hình cho từng ô ngày.
- Cô dâu và chú rể: tiêu đề section; vai trò, tên, giới thiệu, tên bố và tên mẹ
  của từng bên; ký hiệu nối.
- Chuyện chúng mình: tiêu đề section, tiêu đề và nội dung của từng chặng khi
  renderer hiển thị chúng.
- Album: tiêu đề section.
- Sự kiện: tiêu đề section; nhãn ngày; giờ, tên và địa điểm của từng sự kiện;
  chữ trên nút thêm vào lịch.
- Dress code: tiêu đề section, mô tả và lời hướng dẫn tông màu.
- RSVP: tiêu đề section, lời mời và nút mở popup.
- Mừng cưới: tiêu đề section; tên bên; chủ tài khoản, số tài khoản, ngân hàng;
  gợi ý mở phong bao và các nút chữ trong popup mừng cưới.
- Sổ lưu bút: tiêu đề section, trạng thái chưa có lời chúc, nút gửi lời chúc,
  thông báo cảm ơn và tiêu đề popup gửi lời chúc.
- Nút xác nhận tham dự nổi và tiêu đề popup RSVP.

Chữ trên chi tiết D1 tiếp tục là con của `ChiTietTrangTri`, vì chữ phải di
chuyển, thu phóng và xoay cùng ảnh D1. D1 dùng chung danh mục phông và component
điều khiển để trải nghiệm nhất quán.

### Không bao gồm

- Nhãn, placeholder, option và thông báo lỗi của trường nhập.
- Nội dung do khách gửi, ví dụ lời chúc và tên người gửi.
- Nhãn hỗ trợ chỉ dành cho trình đọc màn hình như đóng popup, ảnh trước/sau,
  phát/tắt nhạc.
- Chữ nằm sẵn bên trong file ảnh hoặc SVG.
- Xoay, đổi độ đậm, đổi chiều rộng khung chữ hoặc xóa vùng chữ. Các khả năng này
  không thuộc yêu cầu hiện tại.
- Trình thiết kế canvas tự do hoặc thay thế toàn bộ layout section bằng layer
  tuyệt đối.

## Kiến trúc

### Registry vùng chữ

Mỗi vùng chữ dùng một `TextRegionId` ổn định. Registry khai báo:

- ID và nhãn quản trị;
- section chứa vùng;
- nhóm style mặc định (`title`, `body`, `caption`, `action`);
- vùng có cho sửa nội dung hay chỉ sửa style/vị trí;
- cách đọc và cập nhật nội dung nghiệp vụ, nếu nội dung đến từ `Invitation`;
- nội dung hệ thống mặc định, nếu vùng là copy cố định.

ID cố định dùng dạng phân cấp, ví dụ:

- `bia.loi-mo-dau`
- `bia.chu-re.ten`
- `bia.co-dau.ten`
- `su-kien.tieu-de`
- `rsvp.nut-mo`

Phần tử lặp dùng ID dữ liệu ổn định:

- `chuyen-chung-minh.<item-id>.tieu-de`
- `chuyen-chung-minh.<item-id>.noi-dung`
- `su-kien.<item-id>.gio`
- `su-kien.<item-id>.ten`
- `su-kien.<item-id>.dia-diem`

`ChangChuyen` và `SuKien` nhận trường `id`. Khi tải thiệp cũ thiếu ID, lớp chuẩn
hóa bổ sung ID một lần trước khi người quản trị chỉnh sửa và ID được lưu ở lần
lưu kế tiếp. Không dùng chỉ số mảng làm ID vì thêm, xóa hoặc đổi thứ tự sẽ làm
style gắn sang phần tử khác.

### Dữ liệu ghi đè

`Invitation` nhận trường tùy chọn:

```ts
type FontChu = 'serif-co-dien' | 'sans-sach' | 'viet-tay'

interface TuyChinhVungChu {
  noiDung?: string
  font?: FontChu
  coChu?: number
  mauChu?: string
  x?: number
  y?: number
}

interface Invitation {
  tuyChinhChu?: Record<string, TuyChinhVungChu>
}
```

Quy tắc:

- `font`, `coChu`, `mauChu`, `x`, `y` luôn là ghi đè tùy chọn; thiếu trường nào
  thì dùng style/layout hiện tại của component.
- `x/y` là độ dịch chuyển theo phần trăm chiều rộng khung thiệp so với vị trí
  gốc. `0/0` giữ nguyên vị trí.
- `coChu` là pixel ở khung thiết kế rộng 520 px. Renderer chuyển thành đơn vị
  tương đối theo chiều rộng khung và đặt ngưỡng đọc được trên màn hình nhỏ.
- `noiDung` chỉ lưu cho copy hệ thống như tiêu đề section hoặc chữ nút.
- Tên người cưới, sự kiện, địa điểm, câu chuyện và các nội dung nghiệp vụ khác
  được cập nhật vào trường gốc; không sao chép vào `tuyChinhChu`.
- Override rỗng bị loại khi lưu. Khi mọi override của một vùng được reset, khóa
  vùng bị xóa khỏi map.
- Khi xóa phần tử lặp, mọi khóa có prefix ID của phần tử đó cũng bị xóa.

Schema giới hạn:

- `font` thuộc danh mục cho phép;
- `coChu` từ 8 đến 120;
- `mauChu` theo `#RRGGBB`;
- `x/y` từ -100 đến 100;
- nội dung hệ thống tối đa 500 ký tự;
- tổng số override tối đa 250 vùng để tránh payload bất thường.

### Component render vùng chữ

Component dùng chung `VungChu` nhận `id`, nội dung mặc định, style
mặc định và node HTML phù hợp. Component:

1. tìm override theo ID;
2. hợp nhất override với style hiện tại;
3. render semantic element gốc (`h1`, `h2`, `p`, `span`, `button` hoặc `a`);
4. gắn metadata phục vụ editor khi đang ở chế độ quản trị;
5. áp dụng dịch chuyển bằng transform để phần tử vẫn giữ chỗ trong flow.

Renderer công khai không mang state lựa chọn hoặc handler kéo-thả. Trạng thái
editor đi qua context tùy chọn; khi không có provider, `VungChu` chỉ render nội
dung thiệp. Nhờ đó trang khách không tải logic editor.

Section wrapper cung cấp hệ quy chiếu theo chiều rộng thiệp. Dịch chuyển không
thay đổi kích thước section và không biến nội dung thành layer tuyệt đối. Text
có thể đi qua vùng lân cận trong cùng section nhưng không được kéo hoàn toàn ra
ngoài section.

## Giao diện quản trị

`BangSua` có nút bật/tắt chế độ **Chỉnh chữ**.

Khi chế độ tắt:

- preview hoạt động như thiệp thật;
- nút, link, popup và thao tác mở thiệp hoạt động bình thường;
- không hiện khung chọn.

Khi chế độ bật:

- click vùng chữ chọn vùng và không kích hoạt hành động thật;
- vùng đang chọn có viền, tay nắm và nhãn ngắn;
- kéo bằng Pointer Events hỗ trợ chuột, bút và cảm ứng;
- phím mũi tên dịch một bước nhỏ, `Shift` + phím mũi tên dịch bước lớn;
- panel trái cuộn tới bộ điều khiển vùng đang chọn;
- danh sách vùng chữ được nhóm theo section và cũng dùng để chọn vùng.

Panel vùng chữ gồm:

- nội dung;
- phông chữ;
- cỡ chữ;
- color picker và mã màu;
- tọa độ `x/y`;
- đặt lại vị trí;
- đặt lại kiểu chữ.

Ô nội dung cập nhật nguồn nghiệp vụ hoặc `tuyChinhChu[id].noiDung` theo registry.
Các thay đổi phản ánh ngay trên preview nhưng chỉ được lưu bền khi người quản trị
nhấn nút **Lưu** hiện có.

## Quy tắc kéo-thả và responsive

- Bắt đầu kéo lưu bounding box của section, vị trí pointer và override hiện tại.
- Khoảng dịch pointer được đổi thành phần trăm trên chiều rộng khung thiệp.
- Trong khi kéo chỉ cập nhật state preview; khi kết thúc pointer mới chuẩn hóa
  và làm tròn tọa độ tới 0,1%.
- Pointer capture giữ thao tác ổn định nếu con trỏ đi ra ngoài vùng chữ.
- Tọa độ được clamp để ít nhất một phần có thể chọn của vùng chữ còn nằm trong
  section.
- Kéo không làm đổi thứ tự DOM, semantic heading hoặc tab order.
- Cỡ chữ tùy chỉnh dùng tỷ lệ so với khung chuẩn 520 px và có ngưỡng tối thiểu
  8 px, tối đa 120 px sau khi scale.
- Các breakpoint và style mặc định hiện có tiếp tục có hiệu lực khi vùng chưa
  được ghi đè.

## Nội dung, accessibility và hành vi tương tác

- Phần tử giữ đúng semantic element hiện tại; không đổi heading thành `div`.
- Chế độ editor gắn `aria-selected` và cho vùng được chọn nhận focus.
- Thao tác bàn phím có cùng kết quả với kéo-thả.
- Khi editor chặn click nút/link, preview thể hiện rõ trạng thái “đang chỉnh”.
- Nhãn form, validation và accessible name không được lấy từ nội dung tùy chỉnh.
- Nội dung nút hiển thị có thể đổi nhưng `aria-label` hệ thống vẫn mô tả đúng
  hành động, trừ khi accessible name vốn đến trực tiếp từ text của nút.
- Text rỗng chỉ được chấp nhận với vùng nghiệp vụ vốn là tùy chọn. Tiêu đề và
  nút hệ thống bắt buộc phải còn ít nhất một ký tự không phải khoảng trắng.

## Danh mục phông chữ

Phase này cung cấp ba lựa chọn cài sẵn:

- `serif-co-dien`: Noto Serif, fallback Times New Roman/serif;
- `sans-sach`: Be Vietnam Pro, fallback Arial/sans-serif;
- `viet-tay`: Dancing Script (subset tiếng Việt), được tải bằng cơ chế font của
  Next.js và có fallback cursive.

Không nhận URL font, tên font hoặc CSS tùy ý từ người quản trị. Font mới phải
được thêm vào registry và kiểm tra hỗ trợ tiếng Việt trước khi xuất hiện.

## Tương thích và chuẩn hóa dữ liệu

- `tuyChinhChu` là tùy chọn nên thiệp cũ giữ nguyên.
- Thiệp cũ không có ID cho phần tử lặp được chuẩn hóa trong editor, không cần
  migration database hàng loạt.
- API lưu parse toàn bộ payload bằng schema trước khi ghi database.
- Override tham chiếu vùng cố định không còn trong registry được giữ trong dữ
  liệu để tránh mất dữ liệu khi đổi theme, nhưng renderer bỏ qua an toàn.
- Override của phần tử lặp đã bị người quản trị xóa được dọn ngay trong cùng
  thao tác xóa.
- D1 cũ giữ nguyên schema `chu`; chỉ mở rộng union font để dùng chung registry.

## Xử lý lỗi

- Giá trị số nhập dở dang được giữ trong local input state; chỉ commit khi parse
  thành số hợp lệ.
- Mã màu sai hiển thị lỗi cạnh input và không thay giá trị preview cuối cùng hợp
  lệ.
- Nếu vùng đang chọn biến mất do xóa section/phần tử, editor bỏ chọn và đóng
  panel vùng.
- Pointer cancellation kết thúc kéo mà không làm mất vị trí cuối hợp lệ.
- API trả lỗi schema theo đường dẫn vùng; `BangSua` hiển thị thông báo lưu thất
  bại và giữ state để người quản trị sửa.

## Kiểm thử

### Unit

- Schema chấp nhận override hợp lệ và từ chối font, màu, cỡ, tọa độ, số lượng
  vùng hoặc nội dung ngoài giới hạn.
- Chuẩn hóa tạo ID ổn định cho dữ liệu cũ và không thay ID đã có.
- Resolver hợp nhất đúng mặc định và override; reset loại bỏ object rỗng.
- Xóa phần tử lặp dọn đúng các override theo prefix.
- Chuyển đổi delta pointer sang phần trăm, làm tròn và clamp đúng.

### Component

- `VungChu` giữ semantic element và style mặc định khi không có override.
- Nội dung hệ thống lấy override; nội dung nghiệp vụ lấy trường nguồn.
- Mỗi section đăng ký đủ vùng chữ trong phạm vi.
- Chọn bằng preview hoặc danh sách đồng bộ panel.
- Đổi nội dung, font, màu và cỡ cập nhật preview.
- Kéo bằng Pointer Events, nhập `x/y`, phím mũi tên và reset cập nhật đúng state.
- Chế độ chỉnh chặn hành động nút/link; chế độ thường không chặn.
- Xóa vùng động đang chọn bỏ chọn và dọn override.
- D1 dùng chung font/control nhưng vẫn transform cùng ảnh.

### Integration và E2E

- Mở thiệp cũ: giao diện không thay đổi.
- Chỉnh ít nhất một vùng tĩnh và một vùng sự kiện động, lưu, tải lại và nhận đúng
  nội dung/style/vị trí.
- Đổi thứ tự sự kiện không chuyển style sang sự kiện khác.
- Kéo trên viewport desktop và mobile giữ vùng chữ có thể chọn.
- Popup RSVP và lời chúc vẫn hoạt động khi tắt chế độ chỉnh.
- Nhãn form và thông báo lỗi không xuất hiện trong danh sách vùng chỉnh.
- Chạy test, lint và production build theo script của repository.

## Tiêu chí hoàn thành

- Mọi vùng trong mục **Bao gồm** có ID ổn định và chọn được trên preview/danh
  sách.
- Mỗi vùng chỉnh được nội dung, phông, màu, cỡ và vị trí theo đúng quy tắc nguồn
  dữ liệu.
- Kéo-thả hoạt động bằng chuột và cảm ứng; tọa độ và bàn phím cho phép chỉnh
  chính xác.
- Lưu và tải lại không mất override hoặc gắn nhầm override cho danh sách động.
- Thiệp cũ và vùng chưa chỉnh giữ nguyên giao diện.
- Nhãn form, thông báo hệ thống và nội dung khách gửi không bị biến thành vùng
  chỉnh sửa.
- Test, lint và production build đều thành công.
