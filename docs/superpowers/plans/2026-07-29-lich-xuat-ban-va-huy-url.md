# Lịch xuất bản và hủy URL thiệp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cho phép đặt chính xác ngày/giờ mở và đóng thiệp, tự động khóa trang theo đồng hồ, đồng thời hủy URL nhưng giữ toàn bộ dữ liệu và cho phép tái sử dụng URL.

**Architecture:** Tách khóa nội bộ `invitation_id` khỏi `public_slug`, để URL có thể bị gỡ mà quan hệ dữ liệu vẫn ổn định. Trạng thái hiển thị được suy ra tại thời điểm request từ trạng thái lưu và hai mốc UTC; giao diện quản trị nhập/hiển thị theo `Asia/Ho_Chi_Minh`.

**Tech Stack:** Next.js 16.2 App Router, React 19, TypeScript, Supabase/PostgreSQL, Zod 4, Vitest và Testing Library.

## Global Constraints

- Đọc tài liệu tương ứng trong `node_modules/next/dist/docs/` trước khi sửa route hoặc page.
- Dùng TDD: viết test, chạy thấy thất bại đúng lý do, rồi mới viết code tối thiểu.
- Ngày/giờ quản trị dùng múi giờ `Asia/Ho_Chi_Minh`; dữ liệu trong Supabase lưu UTC.
- Giờ đóng phải sau giờ xuất bản.
- Hủy URL không xóa nội dung, ảnh, RSVP, lời chúc hoặc lịch cũ.
- URL của thiệp đã hủy được phép dùng lại ngay.
- Không khôi phục hoặc gán URL mới cho chính thiệp đã hủy trong phạm vi này.
- Không ghi đè các thay đổi chưa commit hiện có ngoài phạm vi.

---

### Task 1: Mô hình vòng đời và chuyển đổi giờ Việt Nam

**Files:**
- Modify: `src/lib/vongDoi/types.ts`
- Modify: `src/lib/vongDoi/tinhTrangThai.ts`
- Create: `src/lib/vongDoi/thoiGian.ts`
- Test: `src/lib/vongDoi/__tests__/tinhTrangThai.test.ts`
- Create: `src/lib/vongDoi/__tests__/thoiGian.test.ts`

**Interfaces:**
- Produces: `TrangThaiThiep = 'nhap' | 'da-len-lich' | 'da-xuat-ban' | 'het-han' | 'da-huy'`
- Produces: `VongDoi { trangThaiLuu: 'nhap' | 'da-xuat-ban' | 'da-huy'; ngayXuatBan: string | null; ngayDong: string | null }`
- Produces: `tinhTrangThai(vd: VongDoi, bayGio: Date): TrangThaiThiep`
- Produces: `tuNgayGioVietNam(value: string): string` and `sangNgayGioVietNam(iso: string | null): string`

- [ ] **Step 1: Viết test thất bại cho các ranh giới trạng thái**

Thêm các ca với mốc cố định:

```ts
const vd = {
  trangThaiLuu: 'da-xuat-ban' as const,
  ngayXuatBan: '2026-08-01T01:00:00.000Z',
  ngayDong: '2026-08-20T16:00:00.000Z',
}

expect(tinhTrangThai(vd, new Date('2026-08-01T00:59:59.999Z'))).toBe('da-len-lich')
expect(tinhTrangThai(vd, new Date('2026-08-01T01:00:00.000Z'))).toBe('da-xuat-ban')
expect(tinhTrangThai(vd, new Date('2026-08-20T15:59:59.999Z'))).toBe('da-xuat-ban')
expect(tinhTrangThai(vd, new Date('2026-08-20T16:00:00.000Z'))).toBe('het-han')
expect(tinhTrangThai({ ...vd, trangThaiLuu: 'da-huy' }, new Date())).toBe('da-huy')
```

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `npm.cmd test -- src/lib/vongDoi/__tests__/tinhTrangThai.test.ts`

Expected: FAIL vì `ngayDong`, `da-len-lich` và `da-huy` chưa được hỗ trợ.

- [ ] **Step 3: Viết test thất bại cho múi giờ Việt Nam**

```ts
expect(tuNgayGioVietNam('2026-08-01T08:00')).toBe('2026-08-01T01:00:00.000Z')
expect(sangNgayGioVietNam('2026-08-01T01:00:00.000Z')).toBe('2026-08-01T08:00')
expect(() => tuNgayGioVietNam('')).toThrow('Ngày giờ không hợp lệ')
```

- [ ] **Step 4: Chạy test và xác nhận RED**

Run: `npm.cmd test -- src/lib/vongDoi/__tests__/thoiGian.test.ts`

Expected: FAIL vì module chưa tồn tại.

- [ ] **Step 5: Cài đặt tối thiểu**

Suy trạng thái theo thứ tự `da-huy` → `nhap` → thiếu lịch là `nhap` → trước giờ mở là `da-len-lich` → từ giờ đóng là `het-han` → còn lại `da-xuat-ban`. Dùng offset cố định `+07:00` vì Việt Nam không có DST:

```ts
export function tuNgayGioVietNam(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error('Ngày giờ không hợp lệ')
  }
  const date = new Date(`${value}:00+07:00`)
  if (Number.isNaN(date.getTime())) throw new Error('Ngày giờ không hợp lệ')
  return date.toISOString()
}
```

- [ ] **Step 6: Chạy test GREEN và commit**

Run: `npm.cmd test -- src/lib/vongDoi/__tests__/tinhTrangThai.test.ts src/lib/vongDoi/__tests__/thoiGian.test.ts`

Commit:

```powershell
git add src/lib/vongDoi
git commit -m "feat: mo rong vong doi thiep theo lich"
```

### Task 2: Migration tách ID nội bộ khỏi URL

**Files:**
- Create: `supabase/migrations/0004_tach_id_va_url_thiep.sql`
- Create: `src/lib/db/__tests__/migrationVongDoi.test.ts`

**Interfaces:**
- Produces DB columns: `invitations.id`, `invitations.public_slug`, `invitations.ngay_dong`
- Produces DB foreign keys: `rsvps.invitation_id`, `loi_chuc.invitation_id`
- Preserves all existing rows and relationships.

- [ ] **Step 1: Viết kiểm thử migration thất bại**

Test đọc migration, chạy nó trên PostgreSQL/Supabase test database khi cấu hình integration DB có sẵn; nếu suite hiện không có DB test, tách SQL thành các statement và kiểm tra bằng một migration smoke script chạy trong CI/local Supabase. Các xác nhận bắt buộc:

```sql
select count(*) from invitations where id is null or public_slug is null;
select count(*) from rsvps where invitation_id is null;
select count(*) from loi_chuc where invitation_id is null;
```

Kỳ vọng đều bằng `0` ngay sau backfill, và insert hai `public_slug` giống nhau phải thất bại với unique violation.

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `npm.cmd test -- src/lib/db/__tests__/migrationVongDoi.test.ts`

Expected: FAIL vì migration `0004` chưa tồn tại/chưa tạo schema mới.

- [ ] **Step 3: Viết migration theo thứ tự an toàn**

Migration phải:

```sql
alter table invitations add column id uuid default gen_random_uuid();
alter table invitations add column public_slug text;
alter table invitations add column ngay_dong timestamptz;
update invitations set public_slug = slug, ngay_dong = ngay_het_han;
alter table invitations alter column id set not null;
alter table invitations add constraint invitations_id_key unique (id);
create unique index invitations_public_slug_key
  on invitations (public_slug) where public_slug is not null;

alter table rsvps add column invitation_id uuid;
update rsvps r set invitation_id = i.id from invitations i where r.slug = i.slug;
alter table rsvps alter column invitation_id set not null;

alter table loi_chuc add column invitation_id uuid;
update loi_chuc l set invitation_id = i.id from invitations i where l.slug = i.slug;
alter table loi_chuc alter column invitation_id set not null;
```

Sau backfill, thay PK của `invitations` sang `id`, thêm FK mới `on delete cascade`, đổi check constraint trạng thái để nhận `da-huy`, rồi mới bỏ FK/cột `slug` cũ ở bảng con và bỏ `slug`, `ngay_het_han` ở bảng chính. Tên constraint cũ phải được xác định từ migration hiện tại, không dùng `cascade`.

- [ ] **Step 4: Chạy migration test GREEN và commit**

Run: `npm.cmd test -- src/lib/db/__tests__/migrationVongDoi.test.ts`

Commit:

```powershell
git add supabase/migrations/0004_tach_id_va_url_thiep.sql src/lib/db/__tests__/migrationVongDoi.test.ts
git commit -m "feat: tach id noi bo khoi url thiep"
```

### Task 3: Repository dùng ID nội bộ và bảo vệ URL duy nhất

**Files:**
- Modify: `src/lib/db/invitations.ts`
- Modify: `src/lib/db/danhSach.ts`
- Modify: `src/lib/db/rsvps.ts`
- Modify: `src/lib/db/loiChuc.ts`
- Modify: `src/lib/rsvp/xuLy.ts`
- Modify: `src/lib/rsvp/types.ts`
- Create: `src/lib/db/__tests__/invitations.test.ts`
- Modify: `src/lib/rsvp/__tests__/xuLy.test.ts`

**Interfaces:**
- Produces: `layThiepTheoPublicSlug(slug: string): Promise<BanThiep | null>`
- Produces: `layThiepTheoId(id: string): Promise<BanThiep | null>`
- Produces: `datLich(id: string, ngayXuatBan: string, ngayDong: string): Promise<void>`
- Produces: `huyUrl(id: string): Promise<void>`
- `BanThiep` includes `id`, `publicSlug`, `thiep`, `vongDoi`, `spreadsheetId`.
- RSVP/lời chúc ghi và lọc bằng `invitation_id`.

- [ ] **Step 1: Viết test repository thất bại**

Với Supabase query fake chỉ ở ranh giới external DB, kiểm tra hành vi quan sát được:

```ts
await expect(taoThiepTrongDb(thiep, userId)).rejects.toThrow('Đường dẫn đã tồn tại')
await datLich(id, '2026-08-01T01:00:00.000Z', '2026-08-20T16:00:00.000Z')
await huyUrl(id)
```

Fake trả lỗi PostgreSQL `23505` cho unique URL; kiểm tra lời gọi cập nhật lịch dùng `ngay_xuat_ban`, `ngay_dong`, và hủy dùng `{ trang_thai: 'da-huy', public_slug: null }`.

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `npm.cmd test -- src/lib/db/__tests__/invitations.test.ts`

Expected: FAIL vì API repository mới chưa tồn tại.

- [ ] **Step 3: Cài đặt repository tối thiểu**

Đổi mọi lookup công khai sang `public_slug`; mọi thao tác quản trị sang `id`. Khi tạo:

```ts
insert({
  public_slug: hopLe.slug,
  theme_id: hopLe.themeId,
  noi_dung: hopLe,
  nguoi_tao: nguoiTao,
})
```

Ánh xạ mọi lỗi `23505` của `public_slug` thành đúng thông báo `Đường dẫn đã tồn tại`. `huyUrl` phải idempotent và không xóa hàng.

- [ ] **Step 4: Chuyển RSVP/lời chúc sang `invitation_id`**

API nghiệp vụ nhận `invitationId`; dữ liệu trả về vẫn có thể mang `publicSlug` để đồng bộ Sheet, nhưng không dùng URL làm khóa quan hệ.

- [ ] **Step 5: Chạy test GREEN và commit**

Run: `npm.cmd test -- src/lib/db/__tests__/invitations.test.ts src/lib/rsvp/__tests__/xuLy.test.ts`

Commit:

```powershell
git add src/lib/db src/lib/rsvp
git commit -m "refactor: dung id noi bo cho du lieu thiep"
```

### Task 4: API đặt lịch, hủy URL và giới hạn API công khai

**Files:**
- Modify: `src/app/api/admin/xuat-ban/route.ts`
- Create: `src/app/api/admin/huy-url/route.ts`
- Modify: `src/app/api/admin/tao/route.ts`
- Modify: `src/app/api/rsvp/route.ts`
- Modify: `src/app/api/loi-chuc/route.ts`
- Modify: `src/app/api/admin/luu/route.ts`
- Modify: `src/app/api/admin/sheet/route.ts`
- Create: `src/app/api/admin/__tests__/vongDoiRoutes.test.ts`

**Interfaces:**
- `POST /api/admin/xuat-ban` body: `{ invitationId, ngayXuatBan: 'YYYY-MM-DDTHH:mm', ngayDong: 'YYYY-MM-DDTHH:mm' }`
- `POST /api/admin/huy-url` body: `{ invitationId }`
- Schedule API returns `400` if close is not later than publish.
- Cancel API returns `404` for unknown ID and success if already cancelled.

- [ ] **Step 1: Viết route tests thất bại**

Gọi trực tiếp `POST` với `Request` thực. Ca bắt buộc:

```ts
expect((await POST(scheduleRequest)).status).toBe(200)
expect((await POST(invalidOrderRequest)).status).toBe(400)
expect((await cancelPOST(cancelRequest)).status).toBe(200)
```

Kiểm tra payload hợp lệ được đổi từ `08:00` giờ Việt Nam thành `01:00Z`, và thiệp ngoài khoảng mở khiến RSVP/lời chúc trả `403`.

- [ ] **Step 2: Chạy test và xác nhận RED**

Run: `npm.cmd test -- src/app/api/admin/__tests__/vongDoiRoutes.test.ts`

Expected: FAIL vì payload/API hủy mới chưa tồn tại.

- [ ] **Step 3: Cài đặt route tối thiểu**

Zod schema:

```ts
const lichSchema = z.object({
  invitationId: z.uuid(),
  ngayXuatBan: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  ngayDong: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
})
```

Chuyển sang UTC bằng `tuNgayGioVietNam`, so sánh timestamp rồi gọi `datLich`. Route hủy gọi `huyUrl`; tất cả route quản trị tiếp tục được proxy bảo vệ.

- [ ] **Step 4: Chuyển các API còn lại sang ID**

`luu`, `sheet`, upload metadata và các thao tác quản trị nhận `invitationId`; upload vẫn có thể dùng một thư mục ổn định theo `invitationId`. API công khai phân giải `public_slug` một lần rồi truyền `invitationId`.

- [ ] **Step 5: Chạy test GREEN và commit**

Run: `npm.cmd test -- src/app/api/admin/__tests__/vongDoiRoutes.test.ts src/lib/rsvp/__tests__/xuLy.test.ts`

Commit:

```powershell
git add src/app/api
git commit -m "feat: them api dat lich va huy url"
```

### Task 5: Giao diện đặt lịch và hủy URL

**Files:**
- Modify: `src/components/admin/NutXuatBan.tsx`
- Rename: `src/components/admin/NutXuatBan.tsx` → `src/components/admin/QuanLyXuatBan.tsx`
- Create: `src/components/admin/__tests__/QuanLyXuatBan.test.tsx`
- Create: `src/components/admin/HuyUrl.tsx`
- Create: `src/components/admin/__tests__/HuyUrl.test.tsx`
- Modify: `src/components/admin/BangSua.tsx`

**Interfaces:**
- `QuanLyXuatBan({ invitationId, vongDoi })`
- `HuyUrl({ invitationId, publicSlug })`
- On cancel success, client navigates back to `/admin`.

- [ ] **Step 1: Viết component tests thất bại cho lịch**

```tsx
render(<QuanLyXuatBan invitationId={id} vongDoi={vd} />)
await user.type(screen.getByLabelText('Ngày giờ xuất bản'), '2026-08-01T08:00')
await user.type(screen.getByLabelText('Ngày giờ đóng'), '2026-08-20T23:00')
await user.click(screen.getByRole('button', { name: 'Lưu lịch xuất bản' }))
```

Kiểm tra request body chứa đúng `invitationId`, hai chuỗi local datetime và không còn `soNgay`.

- [ ] **Step 2: Chạy test RED**

Run: `npm.cmd test -- src/components/admin/__tests__/QuanLyXuatBan.test.tsx`

Expected: FAIL vì component chưa tồn tại.

- [ ] **Step 3: Cài đặt form lịch tối thiểu**

Hai `input type="datetime-local"` lấy giá trị ban đầu qua `sangNgayGioVietNam`. Hiện lỗi inline nếu thiếu mốc hoặc giờ đóng không sau giờ mở; vẫn để API kiểm tra lại.

- [ ] **Step 4: Viết và chạy test RED cho hủy**

Test yêu cầu người dùng xác nhận, gửi `{ invitationId }`, và chỉ điều hướng sau response thành công:

```ts
expect(screen.getByText(/giữ nguyên nội dung, RSVP và lời chúc/i)).toBeInTheDocument()
```

Run: `npm.cmd test -- src/components/admin/__tests__/HuyUrl.test.tsx`

- [ ] **Step 5: Cài đặt hộp xác nhận hủy**

Nút màu nguy hiểm có nhãn “Hủy thiệp và gỡ đường dẫn”; xác nhận lần hai nêu rõ URL được giải phóng và dữ liệu được giữ.

- [ ] **Step 6: Chạy component tests GREEN và commit**

Run: `npm.cmd test -- src/components/admin/__tests__/QuanLyXuatBan.test.tsx src/components/admin/__tests__/HuyUrl.test.tsx`

Commit:

```powershell
git add src/components/admin
git commit -m "feat: them giao dien dat lich va huy url"
```

### Task 6: Route quản trị ổn định theo ID và dashboard

**Files:**
- Create: `src/app/admin/thiep/[id]/page.tsx`
- Create: `src/app/admin/thiep/[id]/loi-chuc/page.tsx`
- Delete: `src/app/admin/[slug]/page.tsx`
- Delete: `src/app/admin/[slug]/loi-chuc/page.tsx`
- Modify: `src/components/admin/BangDieuKhien.tsx`
- Modify: `src/components/admin/__tests__/BangDieuKhien.test.tsx`
- Modify: `src/lib/db/danhSach.ts`
- Modify: `src/lib/vongDoi/types.ts`

**Interfaces:**
- `ThiepTomTat` contains `id: string`, `publicSlug: string | null`, `ngayXuatBan`, `ngayDong`.
- Edit link: `/admin/thiep/${id}`.
- Public link only renders when `publicSlug !== null`.

- [ ] **Step 1: Viết dashboard tests thất bại**

Thêm fixture `da-len-lich` và `da-huy`. Kiểm tra:

```ts
expect(within(cancelledRow).getByText('Đã hủy')).toBeInTheDocument()
expect(within(cancelledRow).queryByRole('link', { name: 'Xem thiệp' })).not.toBeInTheDocument()
expect(within(cancelledRow).getByRole('link', { name: 'Sửa thiệp' }))
  .toHaveAttribute('href', `/admin/thiep/${cancelled.id}`)
```

- [ ] **Step 2: Chạy test RED**

Run: `npm.cmd test -- src/components/admin/__tests__/BangDieuKhien.test.tsx`

Expected: FAIL vì dashboard còn phụ thuộc `slug`.

- [ ] **Step 3: Cài đặt route và dashboard tối thiểu**

Page đọc `params: Promise<{ id: string }>` theo tài liệu Next 16 và gọi `layThiepTheoId`. Dashboard tìm kiếm URL bằng `publicSlug ?? ''`, hiển thị “Đã gỡ URL” cho thiệp hủy, và thêm lựa chọn lọc `da-len-lich`, `da-huy`.

- [ ] **Step 4: Chạy test GREEN và commit**

Run: `npm.cmd test -- src/components/admin/__tests__/BangDieuKhien.test.tsx`

Commit:

```powershell
git add src/app/admin src/components/admin/BangDieuKhien.tsx src/components/admin/__tests__/BangDieuKhien.test.tsx src/lib/db/danhSach.ts src/lib/vongDoi/types.ts
git commit -m "refactor: dung id cho duong dan quan tri"
```

### Task 7: Trang công khai và thông báo đóng

**Files:**
- Modify: `src/app/[slug]/page.tsx`
- Modify: `src/components/ThongBaoTrangThai.tsx`
- Modify: `src/components/__tests__/ThongBaoTrangThai.test.tsx`
- Modify: `src/app/api/rsvp/route.ts`
- Modify: `src/app/api/loi-chuc/route.ts`

**Interfaces:**
- Public lookup is exclusively by non-null `public_slug`.
- `ThongBaoTrangThai` accepts only public-visible blocked states: `'nhap' | 'da-len-lich' | 'het-han'`.
- `da-huy` is unreachable publicly because cancelled records have no URL.

- [ ] **Step 1: Viết test thông báo thất bại**

```tsx
render(<ThongBaoTrangThai trangThai="da-len-lich" />)
expect(screen.getByRole('heading', { name: 'Thiệp chưa được mở' })).toBeInTheDocument()

render(<ThongBaoTrangThai trangThai="het-han" />)
expect(screen.getByRole('heading', { name: 'Thiệp đã đóng' })).toBeInTheDocument()
```

- [ ] **Step 2: Chạy test RED**

Run: `npm.cmd test -- src/components/__tests__/ThongBaoTrangThai.test.tsx`

Expected: FAIL vì trạng thái lên lịch và nội dung “đã đóng” chưa đúng.

- [ ] **Step 3: Cài đặt render công khai tối thiểu**

`generateMetadata` và page cùng dùng `layThiepTheoPublicSlug`. Chỉ tạo metadata tên/ảnh khi trạng thái là `da-xuat-ban`; các trạng thái còn lại đặt `robots.index = false`.

- [ ] **Step 4: Chạy test GREEN và commit**

Run: `npm.cmd test -- src/components/__tests__/ThongBaoTrangThai.test.tsx src/components/__tests__/InvitationRenderer.test.tsx`

Commit:

```powershell
git add src/app/[slug] src/app/api/rsvp src/app/api/loi-chuc src/components/ThongBaoTrangThai.tsx src/components/__tests__/ThongBaoTrangThai.test.tsx
git commit -m "feat: tu dong mo va dong trang thiep"
```

### Task 8: Cập nhật luồng tạo, upload và kiểm thử toàn hệ thống

**Files:**
- Modify: `src/components/admin/FormTaoMoi.tsx`
- Modify: `src/components/admin/__tests__/FormTaoMoi.test.tsx`
- Modify: `src/app/api/admin/upload/route.ts`
- Modify: `src/components/admin/OAnh.tsx`
- Modify: `src/components/admin/OAlbum.tsx`
- Modify: `src/components/admin/ONhac.tsx`
- Modify: `src/components/admin/OSheet.tsx`
- Modify: `src/components/admin/BangSua.tsx`
- Modify: callers/types found by `rg -n "\\bslug\\b|ngayHetHan|soNgayConLai|SO_NGAY_MAC_DINH" src`

**Interfaces:**
- Create response returns `{ ok: true, invitationId, publicSlug }`.
- Admin navigation after create goes to `/admin/thiep/${invitationId}`.
- Upload keys use `${invitationId}/${crypto.randomUUID()}.${extension}`.

- [ ] **Step 1: Viết test tạo URL thất bại**

Thêm test cho response `409` hiển thị đúng “Đường dẫn đã tồn tại”, và response thành công điều hướng bằng `invitationId`, không bằng URL.

- [ ] **Step 2: Chạy test RED**

Run: `npm.cmd test -- src/components/admin/__tests__/FormTaoMoi.test.tsx`

Expected: FAIL vì form còn điều hướng `/admin/${slug}`.

- [ ] **Step 3: Cài đặt các caller còn lại**

Giữ trường URL tùy chọn ở form với pattern `[a-z0-9]+(-[a-z0-9]+)*`. Dùng `invitationId` cho upload/sheet/admin; dùng `publicSlug` chỉ cho liên kết khách.

- [ ] **Step 4: Quét biểu tượng cũ**

Run:

```powershell
rg -n "ngayHetHan|soNgayConLai|SO_NGAY_MAC_DINH|/admin/\\$\\{.*slug" src
```

Expected: không còn tham chiếu vòng đời/route quản trị cũ; các kết quả `slug` còn lại chỉ thuộc URL công khai hoặc dữ liệu cấu hình legacy có chủ đích.

- [ ] **Step 5: Chạy toàn bộ xác minh**

Run:

```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

Expected: cả ba lệnh exit `0`, không có test thất bại, lỗi lint hoặc lỗi build.

- [ ] **Step 6: Kiểm tra diff và commit**

Run:

```powershell
git diff --check
git status --short
```

Chỉ stage các file thuộc tính năng, không stage các thay đổi sẵn có của người dùng.

Commit:

```powershell
git add src/app src/components/admin src/lib supabase/migrations/0004_tach_id_va_url_thiep.sql
git commit -m "feat: hoan tat lich xuat ban va huy url"
```
