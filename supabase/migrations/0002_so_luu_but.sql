-- Sổ lưu bút: khách viết là hiện luôn, không qua duyệt.
-- Admin xóa dòng nào thấy phản cảm.

create table loi_chuc (
  id uuid primary key default gen_random_uuid(),
  slug text not null references invitations(slug) on delete cascade,
  ho_ten text not null,
  noi_dung text not null,
  ngay_gui timestamptz not null default now()
);

create index loi_chuc_slug_idx on loi_chuc (slug, ngay_gui desc);

alter table loi_chuc enable row level security;
-- Không tạo policy: mọi truy cập đi qua service role key phía máy chủ.
