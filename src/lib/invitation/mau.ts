import type { Invitation } from './types'

const anhMau = (moTa: string): { url: string; moTa: string } => ({ url: '/mau/anh.jpg', moTa })

/** Thiệp mẫu dùng cho test và xem trước. Không phải dữ liệu thật của khách. */
export const thiepMau: Invitation = {
  slug: 'nam-linh',
  themeId: 'mac-dinh',
  sections: [],
  chuRe: {
    ten: 'Nguyễn Hoài Nam',
    anh: anhMau('Ảnh chú rể'),
    gioiThieu: 'Sinh ra và lớn lên tại Từ Sơn, Bắc Ninh.',
    tenBo: 'Ông Nguyễn Văn Bình',
    tenMe: 'Bà Trần Thị Hoa',
  },
  coDau: {
    ten: 'Trần Thùy Linh',
    anh: anhMau('Ảnh cô dâu'),
    gioiThieu: 'Yêu dân ca quan họ từ nhỏ.',
    tenBo: 'Ông Trần Văn Hùng',
    tenMe: 'Bà Lê Thị Mai',
  },
  ngayCuoi: '2026-11-14',
  nhac: { url: '/mau/nhac.mp3', ten: 'Người ở đừng về' },
  chuyenChungMinh: [
    { anh: anhMau('Lần đầu gặp'), tieuDe: 'Lần đầu gặp nhau', noiDung: 'Hội Lim mùa xuân năm ấy.' },
    { anh: anhMau('Ngày cầu hôn'), tieuDe: 'Lời hẹn ước', noiDung: 'Bên hồ Đền Đô, một chiều tháng Chín.' },
  ],
  album: [anhMau('Ảnh cưới 1'), anhMau('Ảnh cưới 2'), anhMau('Ảnh cưới 3'), anhMau('Ảnh cưới 4')],
  suKien: [
    {
      ngay: '2026-11-14',
      gio: '06:30',
      ten: 'Đón dâu',
      diaDiem: 'Tư gia nhà gái',
    },
    {
      ngay: '2026-11-14',
      gio: '09:00',
      ten: 'Lễ Vu Quy',
      diaDiem: 'Tư gia nhà gái',
      banDoAnh: anhMau('Bản đồ nhà gái'),
    },
    {
      ngay: '2026-11-15',
      gio: '11:00',
      ten: 'Tiệc cưới',
      diaDiem: 'Trung tâm tiệc cưới Kinh Bắc',
      banDoAnh: anhMau('Bản đồ nhà hàng'),
    },
  ],
  dressCode: {
    moTa: 'Mời quý khách mặc tông đỏ – be để bức ảnh chung thêm đẹp.',
    mauSac: ['#8B2F20', '#F5EFE2', '#B0833C'],
  },
  mungCuoi: [
    {
      ben: 'nha-trai',
      chuTaiKhoan: 'NGUYEN HOAI NAM',
      soTaiKhoan: '0123456789',
      nganHang: 'Vietcombank',
      qrAnh: anhMau('QR nhà trai'),
    },
    {
      ben: 'nha-gai',
      chuTaiKhoan: 'TRAN THUY LINH',
      soTaiKhoan: '9876543210',
      nganHang: 'Techcombank',
      qrAnh: anhMau('QR nhà gái'),
    },
  ],
}
