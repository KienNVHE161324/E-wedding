# Bộ thiết kế: Quan họ Bắc Ninh

## 1. Tuyên ngôn thị giác

Không khí đình làng Kinh Bắc và hội Lim được thể hiện bằng vật liệu, nhịp bố cục
và hệ họa tiết nét. Thiết kế trang trọng, ấm, có chiều sâu văn hóa nhưng không
phục dựng sân khấu và không biến thành phong cách cung đình Huế.

Không dùng hồng pastel, gradient kẹo, vàng chói, hoa Tây làm motif chính hoặc
minh họa AI giả chữ thư pháp.

## 2. Design tokens

```ts
export const quanHoBacNinhTokens = {
  color: {
    paper: '#F3E8CF',
    paperLight: '#FBF6E9',
    wood: '#4A2F25',
    woodSoft: '#6C4938',
    vermilion: '#9E2F24',
    vermilionDark: '#6F211B',
    bronze: '#A47A3B',
    bronzeMuted: '#80602F',
    ink: '#2E241F',
    inkMuted: '#65574C',
  },
  font: {
    display: '"Noto Serif Display", "Noto Serif", serif',
    body: '"Be Vietnam Pro", system-ui, sans-serif',
  },
  texture: {
    paper: '/themes/quan-ho-bac-ninh/backgrounds/giay-do-nga-v1.png',
    opacity: 0.46,
  },
}
```

`Noto Serif Display` dùng cho tên cô dâu chú rể và tiêu đề ngắn. `Be Vietnam
Pro` dùng cho nội dung, biểu mẫu và nút. Trước khi phát hành phải kiểm đủ chuỗi:

> Nguyễn Thị Huyền — Đỗ Đức Trường — Trân trọng kính mời — Lễ thành hôn

Không dùng ảnh AI để render các chuỗi trên.

## 3. Thư viện item chung

Theme không sở hữu file SVG. Theme chỉ tham chiếu ID trong registry dùng chung:

```ts
export const quanHoBacNinhItems = {
  coverFrame: {
    itemId: 'mai-dinh-dau-dao',
    colorToken: 'vermilionDark',
    opacity: 0.92,
  },
  sectionDivider: {
    itemId: 'song-nuoc-may-troi',
    colorToken: 'bronzeMuted',
    opacity: 0.72,
  },
  corner: {
    itemId: 'non-quai-thao',
    colorToken: 'woodSoft',
    opacity: 0.84,
  },
  watermark: {
    itemId: 'cong-tam-quan-den-do',
    colorToken: 'wood',
    opacity: 0.07,
  },
  alternateDivider: {
    itemId: 'doi-chim',
    colorToken: 'vermilion',
    opacity: 0.62,
  },
}
```

Mọi SVG cần dùng `currentColor` cho nét hoặc mảng có thể đổi màu. Registry lưu
metadata và danh sách slot tương thích; renderer không `switch` theo ID item.

## 4. Nhịp bố cục mặc định

- **Bìa:** mái đình ở mép trên; tên ở vùng thoáng trung tâm; dải sóng–mây ở
  chân bìa; cổng tam quan làm watermark 5–8%.
- **Save the date:** divider đôi chim; nền giấy dó sạch.
- **Cô dâu & chú rể:** hai khối ảnh cân bằng; quạt giấy hoặc nón quai thao ở
  góc, không đặt trực tiếp lên mặt người.
- **Chuyện chúng mình:** dải yếm làm đường dẫn thị giác mảnh, không làm nền chữ.
- **Album:** khung triện tối giản; không dùng khung đỏ ở mọi ảnh.
- **Sự kiện:** tháp chùa hoặc tam quan làm watermark; nội dung ưu tiên dễ đọc.
- **RSVP:** tiết chế motif; hoa sen dùng làm divider, không đặt trong input.
- **Mừng cưới:** chữ Hỷ dùng một lần, không lặp thành pattern dày.
- **Sổ lưu bút:** sóng nước kết thúc trang; đôi chim làm điểm đóng.

## 5. Quy tắc custom

Admin được đổi:

- màu giấy, màu mực, màu nhấn và màu họa tiết;
- font display và font body trong danh sách đã kiểm tiếng Việt;
- item cho từng slot;
- opacity, scale và hướng lật theo giới hạn của slot;
- texture nền và mức opacity.

Admin không được:

- kéo item che nội dung;
- nhập màu làm độ tương phản chữ dưới chuẩn;
- dùng quá một motif kiến trúc lớn trong cùng viewport;
- đưa chữ vào prompt tạo ảnh.

## 6. Phần AI được phép tạo

1. Texture giấy dó hoặc vật liệu nền có tương phản thấp.
2. Tranh nền không khí đình làng/hội Lim khi một mẫu cụ thể cần, không chứa chữ.
3. Xử lý ảnh địa điểm hoặc ảnh cặp đôi theo palette của theme.
4. Biến thể raster theo yêu cầu riêng của khách.

Các mái đình, tam quan, tháp, nón, quạt, yếm, sen, triện/Hỷ, sóng–mây và đôi
chim trong thư viện chung không được AI raster hóa thay cho SVG.

## 7. Prompt gốc cho texture giấy dó

```text
Use case: stylized-concept
Asset type: seamless website invitation background texture
Primary request: a refined, understated traditional Vietnamese dó paper texture
suitable for a Bắc Ninh Quan họ wedding invitation
Scene/backdrop: flat full-frame warm ivory handmade dó paper
Style/medium: high-resolution scanned handmade paper texture, authentic and restrained
Composition/framing: evenly distributed seamless-looking texture with no focal point
Lighting/mood: diffuse neutral light, quiet ceremonial warmth
Color palette: warm ivory, aged cream, extremely subtle light tan fibers
Materials/textures: delicate visible mulberry paper fibers and slight natural tonal irregularity
Constraints: no text, calligraphy, symbols, flowers, architecture, border, objects,
shadows, vignette, watermark, pink tint or strong stains; keep contrast low
```

## 8. Prompt sửa raster theo yêu cầu khách

```text
Use case: precise-object-edit
Asset type: Quan họ Bắc Ninh wedding invitation raster layer
Primary request: <thay đổi khách yêu cầu>
Style/medium: restrained traditional Kinh Bắc visual language
Color palette: wood brown, vermilion, muted bronze and warm ivory dó paper
Constraints: change only <mục tiêu>; preserve composition, scale, texture and
negative space; keep all typography and shared SVG ornaments outside the image
Avoid: any text, pseudo-calligraphy, pastel pink, Western floral styling,
imperial-Huế styling, watermark and additional objects
```

## 9. Asset raster hiện có

- `Image_collections/themes/quan-ho-bac-ninh/backgrounds/giay-do-nga-v1.png`
  — nguồn nền giấy dó ngà, sinh bằng built-in ImageGen.

## 10. Asset SVG dùng chung hiện có

Registry: `Image_collections/shared-ornaments/registry.json`

- `mai-dinh-dau-dao.svg`
- `cong-tam-quan.svg`
- `thap-chua-keo.svg`
- `non-quai-thao.svg`
- `quat-giay.svg`
- `hoa-sen.svg`
- `song-nuoc-may-troi.svg`
- `doi-chim.svg`
- `chu-hy-trien.svg`
- `dai-yem.svg`

`contact-sheet.svg` và `contact-sheet.png` dùng để duyệt nhanh thư viện. Khi đưa
vào web, SVG phải được inline hoặc import thành component để `currentColor` nhận
màu từ token của theme; không dùng thẻ `<img>` nếu cần đổi màu động.

## 11. Phase minh họa cưới nét thanh

### 11.1 Hai cấp độ chi tiết

Không tiếp tục dùng icon silhouette hiện tại làm ngôn ngữ minh họa chính. Phase
sau tạo một họ asset mới theo hai cấp độ:

#### `watermark-line`

Theo tinh thần `couple-watermark-reference.png`:

- nét bút mảnh, nhẹ, có độ rung tự nhiên;
- hình người toàn thân, bố cục dọc;
- chi tiết vừa đủ để đọc được áo dài, khăn đóng, tà áo và bó hoa;
- không tô mảng lớn;
- dùng ở opacity 4–12% làm nền mờ, góc section hoặc lớp sau chữ;
- không đặt nét quan trọng ngay sau nội dung dài.

#### `primary-engraving`

Theo tinh thần `doves-primary-reference.png`:

- contour rõ, nét trong có chọn lọc;
- tương phản mạnh hơn `watermark-line`;
- nhận diện tốt ở chiều rộng 120–320 px;
- dùng làm focal ornament, divider lớn hoặc điểm đóng/mở section;
- không dùng hatch dày toàn bộ hình; chỉ dùng ở cánh, vải hoặc vùng cần diễn tả
  chuyển động.

Hai ảnh trong `Image_collections/references/wedding-line-art/` chỉ là **style
reference**, không phải asset production và không được phát hành cùng thiệp nếu
chưa xác minh quyền sử dụng.

### 11.2 Danh mục cần tạo

#### Trang phục và con người

1. Cô dâu áo dài, khăn đóng, cầm bó hoa — toàn thân.
2. Chú rể áo dài, khăn đóng — toàn thân.
3. Cặp cô dâu chú rể đứng cạnh nhau — dùng làm watermark.
4. Cặp cô dâu chú rể nhìn nhau — focal illustration.
5. Tà áo dài bay và đường cong vạt áo — corner/divider.
6. Liền chị Quan họ với áo nhiều lớp, váy, yếm và nón quai thao.
7. Liền anh Quan họ với áo the, khăn xếp.
8. Cặp liền anh liền chị hát đối đáp — chỉ dùng ở theme Quan họ, không thay thế
   hình cô dâu chú rể.

#### Vật phẩm cưới dùng chung

1. Đôi chim/uyên ương hoặc bồ câu.
2. Trầu cau và trầu têm cánh phượng.
3. Cặp nhẫn.
4. Bó hoa cưới.
5. Mâm quả.
6. Thiệp và phong bì.
7. Ruy băng hoặc dải lụa.
8. Chữ Hỷ dạng triện.
9. Bình hoa và chân nến.

#### Chi tiết riêng Kinh Bắc

1. Bánh phu thê Đình Bảng trong hộp vuông, buộc lạt đỏ.
2. Nón quai thao đặt nghiêng.
3. Quạt giấy.
4. Cơi trầu và miếng trầu cánh phượng.
5. Liền anh/liền chị ở tư thế hát đối đáp.
6. Đường nét mái đình hoặc tam quan làm bối cảnh rất mờ.

### 11.3 Ranh giới văn hóa

- Không mặc định cô dâu chú rể là liền anh/liền chị.
- Áo dài cưới và trang phục Quan họ là hai nhóm asset riêng.
- Không trộn áo Nhật Bình/cung đình Huế vào theme Kinh Bắc.
- Không biến nón quai thao thành nón lá thông thường.
- Không dùng hồng pastel hoặc hoa hồng Tây làm dấu hiệu chính của Kinh Bắc.
- Tránh mô tả trang phục quá chi tiết khi chưa có ảnh tư liệu đủ rõ.

### 11.4 Prompt khung cho `watermark-line`

```text
Use case: stylized-concept
Asset type: reusable wedding invitation watermark illustration
Primary request: <chủ thể>
Style/medium: elegant monochrome pen-and-ink fashion illustration, very fine
contour lines, restrained internal detail, subtle hand-drawn variation
Composition/framing: complete silhouette with generous padding; vertical when
the subject is a standing couple
Color palette: one ink color only; designed to inherit the invitation theme color
Constraints: no text, no background, no frame, no cast shadow, no large solid
black areas; culturally accurate Vietnamese clothing; readable at low opacity
Avoid: cartoon style, photorealism, dense cross-hatching, Western suits or
European bridal styling unless explicitly requested
```

### 11.5 Prompt khung cho `primary-engraving`

```text
Use case: stylized-concept
Asset type: reusable primary wedding ornament
Primary request: <chủ thể>
Style/medium: refined monochrome engraving-inspired line illustration; strong
outer contour with selective feather, fabric or botanical interior lines
Composition/framing: balanced emblem-like composition, clear negative space,
recognizable at small size
Color palette: one ink color only; suitable for recoloring
Constraints: no text, no background, no border, no watermark; keep line density
moderate; preserve a clean silhouette
Avoid: clip-art geometry, heavy black fill, excessive hatching, gradients,
photorealistic shading and unrelated decorative objects
```

## 12. Thứ tự sản xuất asset

1. Chốt các dáng cô dâu chú rể ở cấp `primary-decor`.
2. Generate riêng từng dáng được duyệt, không crop từ bảng phương án.
3. Tạo biến thể cô dâu chú rể ở cấp `watermark` nếu cần.
4. Chuyển sang phase **thư viện hoa**, ưu tiên nhiều dáng và nhiều cách ghép:
   - hoa đơn nhìn chính diện;
   - hoa đơn góc nghiêng;
   - nụ và cành;
   - cụm hoa nhỏ cho góc;
   - cụm hoa ngang làm divider;
   - cụm hoa dọc;
   - vòng hoa/khung hoa;
   - hoa rơi hoặc cánh hoa rời;
   - phiên bản `watermark`;
   - phiên bản `primary-decor`.
5. Mỗi loại hoa được generate thành file riêng, có biến thể được đánh số và chỉ
   lưu vào `Image_collections` sau khi duyệt.

### Trạng thái duyệt hiện tại

- Bảng decor chính gồm mái đình, tam quan, tháp, nón nghiêng, quạt, yếm, Hỷ và
  sóng–mây: đã duyệt về hướng hình ảnh; cần regenerate từng asset production.
- Bản nón quai thao individual trên nền xanh: loại bỏ, không lưu.
- Bảng bốn dáng cô dâu chú rể: đang chờ duyệt.
- Phase kế tiếp sau cô dâu chú rể: nhiều chi tiết hoa.
