# Image collections

Chỉ lưu asset production đã được duyệt và được generate riêng từng chi tiết.
Không crop asset production từ contact sheet hoặc review board.

## Cấu trúc

```text
Image_collections/
├── watermarks/
│   ├── architecture/
│   ├── attire-accessories/
│   ├── florals/
│   ├── symbols/
│   ├── nature/
│   └── birds/
├── primary-decor/
│   ├── architecture/
│   ├── attire-accessories/
│   ├── florals/
│   ├── symbols/
│   ├── nature/
│   └── birds/
├── people/
│   └── bride-groom/
│       ├── watermarks/
│       └── primary-decor/
├── themes/
└── references/
```

## Quy tắc file

- Mỗi file chỉ chứa đúng một chi tiết hoặc một bố cục đôi đã được duyệt.
- Generate riêng từng asset; không cắt từ ảnh chứa nhiều phương án.
- PNG production phải có nền trong suốt và padding đều.
- Review board nằm ngoài các folder production.
- Tên file dùng kebab-case và có số thứ tự cho biến thể.
- Asset văn hóa cần được kiểm tra hình dáng trước khi lưu.

