-- Tách danh tính ổn định của thiệp khỏi đường dẫn công khai.
-- Nhờ đó có thể gỡ và tái sử dụng URL mà không mất RSVP hay lời chúc.

alter table invitations
  add column id uuid default gen_random_uuid(),
  add column public_slug text,
  add column ngay_dong timestamptz;

update invitations
set public_slug = slug,
    ngay_dong = ngay_het_han;

alter table invitations
  alter column id set not null,
  add constraint invitations_id_key unique (id);

create unique index invitations_public_slug_key
  on invitations (public_slug)
  where public_slug is not null;

alter table rsvps add column invitation_id uuid;

update rsvps r
set invitation_id = i.id
from invitations i
where r.slug = i.slug;

alter table rsvps
  alter column invitation_id set not null,
  add constraint rsvps_invitation_id_fkey
    foreign key (invitation_id) references invitations(id) on delete cascade;

alter table loi_chuc add column invitation_id uuid;

update loi_chuc l
set invitation_id = i.id
from invitations i
where l.slug = i.slug;

alter table loi_chuc
  alter column invitation_id set not null,
  add constraint loi_chuc_invitation_id_fkey
    foreign key (invitation_id) references invitations(id) on delete cascade;

drop index rsvps_slug_idx;
drop index loi_chuc_slug_idx;

alter table rsvps
  drop constraint rsvps_slug_fkey,
  drop column slug;

alter table loi_chuc
  drop constraint loi_chuc_slug_fkey,
  drop column slug;

alter table invitations
  drop constraint invitations_trang_thai_check,
  add constraint invitations_trang_thai_check
    check (trang_thai in ('nhap', 'da-xuat-ban', 'da-huy'));

alter table invitations drop constraint invitations_pkey;
alter table invitations add constraint invitations_pkey primary key (id);

alter table invitations
  drop column slug,
  drop column ngay_het_han;

create index rsvps_invitation_id_idx on rsvps (invitation_id);
create index loi_chuc_invitation_id_idx
  on loi_chuc (invitation_id, ngay_gui desc);
