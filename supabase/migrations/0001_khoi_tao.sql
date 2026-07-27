-- Lược đồ khởi tạo cho nền tảng thiệp cưới E-Wedding.

create table invitations (
  slug text primary key,
  theme_id text not null,
  noi_dung jsonb not null,
  spreadsheet_id text,
  trang_thai text not null default 'nhap' check (trang_thai in ('nhap', 'da-xuat-ban')),
  ngay_xuat_ban timestamptz,
  ngay_het_han timestamptz,
  nguoi_tao uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trạng thái 'het-han' KHÔNG lưu ở đây mà suy ra từ ngay_het_han,
-- để không cần tiến trình nền chạy đổi cờ mỗi ngày.

create table rsvps (
  id uuid primary key default gen_random_uuid(),
  slug text not null references invitations(slug) on delete cascade,
  ho_ten text not null,
  ben text not null check (ben in ('nha-trai', 'nha-gai')),
  quan_he text not null,
  phuong_tien text not null,
  ngay_an text not null,
  loi_chuc text,
  loi_chuc_da_duyet boolean not null default false,
  da_dong_bo_sheet boolean not null default false,
  ngay_dang_ky timestamptz not null default now()
);

create index rsvps_slug_idx on rsvps (slug);
create index rsvps_chua_dong_bo_idx on rsvps (da_dong_bo_sheet) where da_dong_bo_sheet = false;

alter table invitations enable row level security;
alter table rsvps enable row level security;
-- Không tạo policy: mọi truy cập đi qua service role key phía máy chủ,
-- quyền được kiểm ở tầng ứng dụng (middleware + trang quản trị).
