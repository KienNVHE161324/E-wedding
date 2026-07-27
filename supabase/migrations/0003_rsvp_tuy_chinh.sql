-- Các câu trả lời tùy chỉnh của form RSVP, cấu hình riêng theo từng thiệp.
alter table rsvps
  add column tuy_chinh jsonb not null default '{}'::jsonb;
