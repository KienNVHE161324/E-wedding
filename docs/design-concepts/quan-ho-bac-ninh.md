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
