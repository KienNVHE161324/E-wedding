# Thiết lập môi trường (bản miễn phí)

Bốn việc, làm theo đúng thứ tự. Tổng cộng khoảng 30 phút.

| Dịch vụ | Dùng để | Gói miễn phí |
|---|---|---|
| Supabase | dữ liệu thiệp, RSVP, tài khoản nhân viên | 500MB |
| Cloudflare R2 | ảnh và nhạc khách tải lên | 10GB, không tính phí băng thông ra |
| Google Cloud | tổng hợp RSVP về Google Sheet | miễn phí |

---

## Phần 1 — Supabase (lưu dữ liệu và ảnh)

Gói Free: 500MB database, 1GB lưu ảnh, 50.000 người dùng. Thừa cho giai đoạn đầu.
Lưu ý: project bị **tạm dừng nếu 7 ngày không ai truy cập** — vào lại là chạy tiếp, chỉ chậm lần đầu.

### 1.1 Tạo project

1. Vào https://supabase.com → **Start your project** → đăng nhập bằng GitHub hoặc email.
2. **New project**, điền:
   - Name: `e-wedding`
   - Database Password: bấm **Generate a password** rồi **lưu lại vào chỗ an toàn**. Mật khẩu này không xem lại được.
   - Region: **Southeast Asia (Singapore)** — gần Việt Nam nhất, thiệp mở nhanh hơn.
3. Bấm **Create new project**, đợi khoảng 2 phút.

### 1.2 Chạy migration

1. Menu trái → biểu tượng **SQL Editor**.
2. Bấm **New query**.
3. Mở tệp `supabase/migrations/0001_khoi_tao.sql` trong dự án, copy **toàn bộ**, dán vào.
4. Bấm **Run** (hoặc Ctrl+Enter).
5. Thấy `Success. No rows returned` là xong.

Kiểm tra: menu trái → **Table Editor**, phải thấy hai bảng `invitations` và `rsvps`.

### 1.3 Tắt tự đăng ký và tạo tài khoản nhân viên

Quan trọng: không tắt thì người lạ tự đăng ký được và vào thẳng khu quản trị.

1. Menu trái → **Authentication** → **Sign In / Providers** → mục **Email**.
2. **Tắt** công tắc `Allow new users to sign up`. Bấm Save.
3. Sang tab **Users** → **Add user** → **Create new user**:
   - Email: email công ty của từng nhân viên
   - Password: đặt tạm rồi báo họ đổi
   - Bật **Auto Confirm User** (không thì họ phải bấm link xác nhận trong mail)
4. Lặp lại cho từng người. Thêm một tài khoản riêng cho kiểm thử, ví dụ `e2e@beamewa.com.vn`.

### 1.4 Lấy khóa

Menu trái → **Project Settings** (bánh răng) → **API Keys** và **Data API**. Chép ba giá trị:

| Trên Supabase | Điền vào .env.local |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

**`service_role` là khóa toàn quyền** — bỏ qua mọi kiểm soát truy cập. Không bao giờ dán nó lên chat, ảnh chụp màn hình, hay commit vào git.

---

## Phần 2 — Cloudflare R2 (lưu ảnh và nhạc)

Gói Free: 10GB lưu trữ, 1 triệu lượt ghi mỗi tháng, **không tính phí băng thông ra** — đây là điểm hơn hẳn các dịch vụ khác, vì ảnh cưới được xem rất nhiều lần.

Ước tính: mỗi đám cưới khoảng 30–50MB, tức chứa được khoảng **200 đám**.

Cloudflare có hỏi thẻ tín dụng khi bật R2, nhưng không trừ tiền nếu ở trong hạn mức miễn phí.

### 2.1 Tạo bucket

1. Vào https://dash.cloudflare.com → đăng ký hoặc đăng nhập.
2. Menu trái → **R2 Object Storage** → bấm bật dịch vụ nếu được hỏi.
3. **Create bucket**:
   - Name: `thiep`
   - Location: **Asia-Pacific (APAC)**
4. **Create bucket**.

### 2.2 Bật truy cập công khai

Ảnh phải xem được không cần đăng nhập, nếu không khách mở thiệp sẽ thấy ô trống.

1. Vào bucket `thiep` → tab **Settings**.
2. Mục **Public Development URL** → **Enable**, xác nhận.
3. Chép địa chỉ hiện ra, dạng `https://pub-xxxxxxxx.r2.dev` → đây là `R2_PUBLIC_URL`.

Địa chỉ `r2.dev` bị Cloudflare giới hạn tốc độ, đủ dùng lúc đầu. Khi chạy thật nên gắn tên miền riêng: tab **Settings** → **Custom Domains** → **Connect Domain**, ví dụ `anh.tenmiencuaban.vn`. Gắn xong thì đổi `R2_PUBLIC_URL` sang địa chỉ đó.

### 2.3 Tạo khóa API

1. Ở trang R2, menu phải → **API** → **Manage API tokens** → **Create API token**.
2. Token name: `e-wedding`
3. Permissions: chọn **Object Read & Write**.
4. Specify bucket: chọn riêng bucket `thiep` — đừng để "all buckets".
5. **Create API Token**.
6. Màn hình hiện ra ba giá trị, **chép ngay** vì đóng đi là không xem lại được:

| Trên Cloudflare | Điền vào .env.local |
|---|---|
| Access Key ID | `R2_ACCESS_KEY_ID` |
| Secret Access Key | `R2_SECRET_ACCESS_KEY` |
| Account ID (ở trang R2 Overview) | `R2_ACCOUNT_ID` |

---

## Phần 3 — Google Cloud (ghi Google Sheet)

Hoàn toàn miễn phí. Sheets API cho 300 lượt ghi mỗi phút, không giới hạn tổng.

### 3.1 Tạo project

1. Vào https://console.cloud.google.com → đăng nhập bằng tài khoản Google sẽ sở hữu các file Sheet.
2. Thanh trên cùng, bấm ô chọn project → **New Project**.
3. Name: `e-wedding` → **Create**. Đợi vài giây rồi chọn project vừa tạo.

### 3.2 Bật hai API

Phải bật **cả hai**. Thiếu Drive API là tạo được Sheet nhưng không share được, đây là lỗi hay gặp nhất.

1. Menu ☰ → **APIs & Services** → **Library**.
2. Gõ `Google Sheets API` → chọn → **Enable**.
3. Quay lại Library, gõ `Google Drive API` → chọn → **Enable**.

### 3.3 Tạo service account

1. **APIs & Services** → **Credentials** → **Create Credentials** → **Service account**.
2. Name: `e-wedding-sheets` → **Create and Continue**.
3. Phần Role: bỏ trống, bấm **Continue** → **Done**.
4. Trong danh sách Service Accounts, bấm vào tài khoản vừa tạo.
5. Tab **Keys** → **Add Key** → **Create new key** → chọn **JSON** → **Create**.
6. Máy tự tải về một tệp `.json`. **Đừng để tệp này trong thư mục dự án** — nó là chìa khóa vào Google của bạn.

### 3.4 Lấy hai giá trị từ tệp JSON

Mở tệp bằng Notepad. Tìm hai dòng:

```json
"client_email": "e-wedding-sheets@e-wedding-123456.iam.gserviceaccount.com",
"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADAN...rất dài...\n-----END PRIVATE KEY-----\n",
```

- `client_email` → điền vào `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `private_key` → điền vào `GOOGLE_PRIVATE_KEY`

**Chỗ dễ hỏng nhất — private key:**
- Copy **nguyên văn** phần trong dấu ngoặc kép, gồm cả `-----BEGIN PRIVATE KEY-----` và `-----END PRIVATE KEY-----`.
- Giữ nguyên các ký tự `\n`, **không** thay bằng xuống dòng thật. Mã đã tự chuyển đổi chúng.
- Khi dán vào `.env.local`, **bọc trong dấu nháy kép**, viết trên một dòng duy nhất.

Đúng:
```
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"
```

Sai (xuống dòng thật, không có nháy kép):
```
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIIEvQIB...
```

---

## Phần 4 — Tạo tệp .env.local

1. Trong thư mục dự án, copy `.env.example` thành `.env.local`.
2. Điền các giá trị đã lấy ở trên.

`.env.local` đã nằm trong `.gitignore` nên không bị commit lên git. Đừng đổi tên nó.

Mẫu hoàn chỉnh:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdxyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

NOI_LUU_ANH=r2
R2_ACCOUNT_ID=1a2b3c4d5e6f...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=thiep
R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev

GOOGLE_SERVICE_ACCOUNT_EMAIL=e-wedding-sheets@e-wedding-123456.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIB...\n-----END PRIVATE KEY-----\n"

E2E_EMAIL=e2e@beamewa.com.vn
E2E_MAT_KHAU=mat-khau-tai-khoan-kiem-thu
```

---

## Chạy thử

```bash
npm run dev
```

Mở http://localhost:3000 — phải bị đưa về trang đăng nhập. Đăng nhập bằng tài khoản vừa tạo, bấm **Tạo đám cưới mới**.

## Nếu gặp lỗi

| Thông báo | Nguyên nhân |
|---|---|
| `Thiếu biến môi trường Supabase` | Tệp đặt sai tên hoặc sai chỗ. Phải là `.env.local` ở thư mục gốc. Sửa xong nhớ khởi động lại `npm run dev`. |
| `Email hoặc mật khẩu không đúng` | Chưa bật Auto Confirm khi tạo user, hoặc gõ nhầm. |
| `Thiếu biến môi trường R2_...` | Còn sót một biến R2 chưa điền. Thông báo ghi rõ tên biến nào. |
| Ảnh tải lên nhưng không hiện | Bucket R2 chưa bật Public Development URL, hoặc `R2_PUBLIC_URL` sai. |
| `Invalid src prop ... hostname not configured` | Đổi `R2_PUBLIC_URL` sang tên miền riêng nhưng chưa khởi động lại. Host được đọc từ biến này lúc khởi động. |
| Upload báo lỗi 500, log ghi `SignatureDoesNotMatch` | `R2_SECRET_ACCESS_KEY` sai hoặc thiếu ký tự. Tạo lại API token. |
| `Thiếu thông tin service account Google` | Chưa điền `GOOGLE_PRIVATE_KEY`, hoặc quên bọc dấu nháy kép. |
| `error:1E08010C:DECODER routines` | Private key bị hỏng — thường do xuống dòng thật thay vì `\n`. Copy lại từ tệp JSON. |
| Tạo được Sheet nhưng không mở được link | Chưa bật Google Drive API. |
| RSVP gửi thành công nhưng Sheet trống | Đúng thiết kế: Google lỗi thì dữ liệu vẫn nằm trong DB và được đẩy lại sau. Xem log máy chủ để biết lý do. |
