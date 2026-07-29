import { ngayTrongThang, TEN_THU, tenThang } from './lich'
import type { TextRegionId } from './textTypes'
import type {
  Ben,
  ChangChuyen,
  Invitation,
  NguoiCuoi,
  OMungCuoi,
  SectionId,
  SuKien,
} from './types'

export type NhomVungChu = 'title' | 'body' | 'caption' | 'action'

export interface MoTaVungChu {
  id: TextRegionId
  section: SectionId | 'popup'
  nhan: string
  nhom: NhomVungChu
  noiDung: string
  choSuaNoiDung: boolean
  capNhatNoiDung?: (thiep: Invitation, noiDung: string) => Invitation
}

export function laNoiDungVungChuBatBuoc(moTa: MoTaVungChu): boolean {
  return (
    moTa.choSuaNoiDung &&
    !moTa.capNhatNoiDung &&
    (moTa.nhom === 'title' || moTa.nhom === 'action')
  )
}

type CapNhatNoiDung = NonNullable<MoTaVungChu['capNhatNoiDung']>

function vungHeThong(
  id: TextRegionId,
  section: MoTaVungChu['section'],
  nhan: string,
  nhom: NhomVungChu,
  noiDung: string,
): MoTaVungChu {
  return { id, section, nhan, nhom, noiDung, choSuaNoiDung: true }
}

function vungNghiepVu(
  id: TextRegionId,
  section: SectionId,
  nhan: string,
  nhom: NhomVungChu,
  noiDung: string,
  capNhatNoiDung: CapNhatNoiDung,
): MoTaVungChu {
  return { id, section, nhan, nhom, noiDung, choSuaNoiDung: true, capNhatNoiDung }
}

function vungSinhTuDuLieu(
  id: TextRegionId,
  section: SectionId,
  nhan: string,
  nhom: NhomVungChu,
  noiDung: string,
): MoTaVungChu {
  return { id, section, nhan, nhom, noiDung, choSuaNoiDung: false }
}

function suaNguoiCuoi(
  thiep: Invitation,
  ben: 'chuRe' | 'coDau',
  patch: Partial<NguoiCuoi>,
): Invitation {
  return { ...thiep, [ben]: { ...thiep[ben], ...patch } }
}

function suaChuyen(
  thiep: Invitation,
  id: string,
  patch: Partial<ChangChuyen>,
): Invitation {
  return {
    ...thiep,
    chuyenChungMinh: thiep.chuyenChungMinh.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    ),
  }
}

function suaSuKien(thiep: Invitation, id: string, patch: Partial<SuKien>): Invitation {
  return {
    ...thiep,
    suKien: thiep.suKien.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  }
}

function suaOMungCuoi(
  thiep: Invitation,
  ben: Ben,
  patch: Partial<OMungCuoi>,
): Invitation {
  const daCo = thiep.mungCuoi.some((item) => item.ben === ben)
  const mungCuoi = daCo
    ? thiep.mungCuoi.map((item) => (item.ben === ben ? { ...item, ...patch } : item))
    : [
        ...thiep.mungCuoi,
        { ben, chuTaiKhoan: '', soTaiKhoan: '', nganHang: '', ...patch },
      ]
  return { ...thiep, mungCuoi }
}

function biaRegions(thiep: Invitation): MoTaVungChu[] {
  return [
    vungHeThong('bia.loi-mo-dau', 'bia', 'Lời mở đầu', 'caption', 'THÂN MỜI'),
    vungNghiepVu('bia.chu-re.ten', 'bia', 'Tên chú rể', 'title', thiep.chuRe.ten, (t, v) =>
      suaNguoiCuoi(t, 'chuRe', { ten: v }),
    ),
    vungHeThong('bia.ky-hieu-noi', 'bia', 'Ký hiệu nối', 'title', '&'),
    vungNghiepVu('bia.co-dau.ten', 'bia', 'Tên cô dâu', 'title', thiep.coDau.ten, (t, v) =>
      suaNguoiCuoi(t, 'coDau', { ten: v }),
    ),
    vungHeThong('bia.nut-mo', 'bia', 'Nút mở thiệp', 'action', 'Mở thiệp'),
  ]
}

function demNguocRegions(thiep: Invitation): MoTaVungChu[] {
  return [
    vungHeThong('dem-nguoc.tieu-de', 'dem-nguoc', 'Tiêu đề', 'title', 'Save the date'),
    vungSinhTuDuLieu(
      'dem-nguoc.thang',
      'dem-nguoc',
      'Tháng và năm',
      'caption',
      tenThang(thiep.ngayCuoi).toUpperCase(),
    ),
    vungSinhTuDuLieu(
      'dem-nguoc.thu',
      'dem-nguoc',
      'Các thứ trong tuần',
      'caption',
      TEN_THU.join(' · '),
    ),
    vungSinhTuDuLieu(
      'dem-nguoc.ngay',
      'dem-nguoc',
      'Các ngày trong tháng',
      'body',
      String(ngayTrongThang(thiep.ngayCuoi)),
    ),
  ]
}

function nguoiCuoiRegions(
  thiep: Invitation,
  ben: 'chuRe' | 'coDau',
  idBen: 'chu-re' | 'co-dau',
  nhanBen: string,
): MoTaVungChu[] {
  const nguoi = thiep[ben]
  const prefix = `co-dau-chu-re.${idBen}`
  return [
    vungHeThong(`${prefix}.vai-tro`, 'co-dau-chu-re', `Vai trò ${nhanBen}`, 'caption', nhanBen),
    vungNghiepVu(`${prefix}.ten`, 'co-dau-chu-re', `Tên ${nhanBen}`, 'title', nguoi.ten, (t, v) =>
      suaNguoiCuoi(t, ben, { ten: v }),
    ),
    vungNghiepVu(
      `${prefix}.gioi-thieu`,
      'co-dau-chu-re',
      `Giới thiệu ${nhanBen}`,
      'body',
      nguoi.gioiThieu ?? '',
      (t, v) => suaNguoiCuoi(t, ben, { gioiThieu: v || undefined }),
    ),
    vungNghiepVu(
      `${prefix}.ten-bo`,
      'co-dau-chu-re',
      `Tên bố ${nhanBen}`,
      'caption',
      nguoi.tenBo ?? '',
      (t, v) => suaNguoiCuoi(t, ben, { tenBo: v || undefined }),
    ),
    vungNghiepVu(
      `${prefix}.ten-me`,
      'co-dau-chu-re',
      `Tên mẹ ${nhanBen}`,
      'caption',
      nguoi.tenMe ?? '',
      (t, v) => suaNguoiCuoi(t, ben, { tenMe: v || undefined }),
    ),
  ]
}

function coDauChuReRegions(thiep: Invitation): MoTaVungChu[] {
  return [
    vungHeThong(
      'co-dau-chu-re.tieu-de',
      'co-dau-chu-re',
      'Tiêu đề',
      'title',
      'Cô dâu & Chú rể',
    ),
    vungHeThong(
      'co-dau-chu-re.ky-hieu-noi',
      'co-dau-chu-re',
      'Ký hiệu nối',
      'title',
      '&',
    ),
    ...nguoiCuoiRegions(thiep, 'chuRe', 'chu-re', 'CHÚ RỂ'),
    ...nguoiCuoiRegions(thiep, 'coDau', 'co-dau', 'CÔ DÂU'),
  ]
}

function chuyenRegions(chuyen: ChangChuyen): MoTaVungChu[] {
  if (!chuyen.id) return []
  const id = chuyen.id
  const prefix = `chuyen-chung-minh.${id}`
  return [
    vungNghiepVu(
      `${prefix}.tieu-de`,
      'chuyen-chung-minh',
      'Tiêu đề câu chuyện',
      'title',
      chuyen.tieuDe,
      (t, v) => suaChuyen(t, id, { tieuDe: v }),
    ),
  ]
}

function suKienRegions(suKien: SuKien): MoTaVungChu[] {
  if (!suKien.id) return []
  const id = suKien.id
  const prefix = `su-kien.${id}`
  return [
    vungNghiepVu(`${prefix}.gio`, 'su-kien', 'Giờ sự kiện', 'caption', suKien.gio, (t, v) =>
      suaSuKien(t, id, { gio: v }),
    ),
    vungNghiepVu(`${prefix}.ten`, 'su-kien', 'Tên sự kiện', 'title', suKien.ten, (t, v) =>
      suaSuKien(t, id, { ten: v }),
    ),
    vungNghiepVu(
      `${prefix}.dia-diem`,
      'su-kien',
      'Địa điểm',
      'body',
      suKien.diaDiem ?? '',
      (t, v) => suaSuKien(t, id, { diaDiem: v || undefined }),
    ),
    vungHeThong(
      `${prefix}.nut-them-lich`,
      'su-kien',
      'Nút thêm vào lịch',
      'action',
      'Thêm vào lịch',
    ),
  ]
}

function suKienSectionRegions(thiep: Invitation): MoTaVungChu[] {
  const ngay = [...new Set(thiep.suKien.map((item) => item.ngay))]
  return [
    vungHeThong(
      'su-kien.tieu-de',
      'su-kien',
      'Tiêu đề',
      'title',
      'Lịch trình đám cưới',
    ),
    ...ngay.map((giaTri) =>
      vungSinhTuDuLieu(
        `su-kien.ngay.${giaTri}`,
        'su-kien',
        `Ngày ${giaTri}`,
        'caption',
        giaTri,
      ),
    ),
    ...thiep.suKien.flatMap(suKienRegions),
  ]
}

function dressCodeRegions(thiep: Invitation): MoTaVungChu[] {
  return [
    vungHeThong('dress-code.tieu-de', 'dress-code', 'Tiêu đề', 'title', 'Dress code'),
    vungNghiepVu(
      'dress-code.mo-ta',
      'dress-code',
      'Mô tả dress code',
      'body',
      thiep.dressCode?.moTa ?? '',
      (t, v) => ({
        ...t,
        dressCode: t.dressCode
          ? { ...t.dressCode, moTa: v }
          : { moTa: v, mauSac: [] },
      }),
    ),
    vungHeThong(
      'dress-code.huong-dan',
      'dress-code',
      'Hướng dẫn tông màu',
      'caption',
      'Vui lòng mặc trang phục theo tông màu dưới đây để bức ảnh chung thêm trọn vẹn.',
    ),
  ]
}

const TEN_BEN: Record<Ben, string> = {
  'nha-trai': 'Nhà trai',
  'nha-gai': 'Nhà gái',
}

function mungCuoiBenRegions(thiep: Invitation, ben: Ben): MoTaVungChu[] {
  const o = thiep.mungCuoi.find((item) => item.ben === ben)
  const prefix = `mung-cuoi.${ben}`
  const tenBen = TEN_BEN[ben]
  return [
    vungHeThong(`${prefix}.ten-ben`, 'mung-cuoi', `Tên ${tenBen}`, 'caption', tenBen),
    vungNghiepVu(
      `${prefix}.chu-tai-khoan`,
      'mung-cuoi',
      `Chủ tài khoản ${tenBen}`,
      'body',
      o?.chuTaiKhoan ?? '',
      (t, v) => suaOMungCuoi(t, ben, { chuTaiKhoan: v }),
    ),
    vungNghiepVu(
      `${prefix}.so-tai-khoan`,
      'mung-cuoi',
      `Số tài khoản ${tenBen}`,
      'body',
      o?.soTaiKhoan ?? '',
      (t, v) => suaOMungCuoi(t, ben, { soTaiKhoan: v }),
    ),
    vungNghiepVu(
      `${prefix}.ngan-hang`,
      'mung-cuoi',
      `Ngân hàng ${tenBen}`,
      'body',
      o?.nganHang ?? '',
      (t, v) => suaOMungCuoi(t, ben, { nganHang: v }),
    ),
    vungHeThong(`${prefix}.goi-y-mo`, 'mung-cuoi', `Gợi ý mở ${tenBen}`, 'action', 'Chạm để mở'),
    vungHeThong(
      `${prefix}.nut-sao-chep`,
      'mung-cuoi',
      `Nút sao chép ${tenBen}`,
      'action',
      'Chép số tài khoản',
    ),
  ]
}

function mungCuoiRegions(thiep: Invitation): MoTaVungChu[] {
  return [
    vungHeThong('mung-cuoi.tieu-de', 'mung-cuoi', 'Tiêu đề', 'title', 'Mừng cưới'),
    ...thiep.mungCuoi.flatMap((item) => mungCuoiBenRegions(thiep, item.ben)),
  ]
}

function systemCopyRegions(): MoTaVungChu[] {
  return [
    vungHeThong(
      'chuyen-chung-minh.tieu-de',
      'chuyen-chung-minh',
      'Tiêu đề',
      'title',
      'Chuyện chúng mình',
    ),
    vungHeThong('album.tieu-de', 'album', 'Tiêu đề', 'title', 'Album ảnh'),
    vungHeThong('rsvp.tieu-de', 'rsvp', 'Tiêu đề', 'title', 'Xác nhận tham dự'),
    vungHeThong(
      'rsvp.loi-moi',
      'rsvp',
      'Lời mời xác nhận',
      'body',
      'Sự hiện diện của bạn là niềm vinh hạnh của gia đình chúng tôi. Vui lòng cho chúng tôi biết bạn có tới dự được không nhé.',
    ),
    vungHeThong('rsvp.nut-mo', 'rsvp', 'Nút mở xác nhận', 'action', 'Điền xác nhận'),
    vungHeThong('so-luu-but.tieu-de', 'so-luu-but', 'Tiêu đề', 'title', 'Sổ lưu bút'),
    vungHeThong(
      'so-luu-but.trang-thai-rong',
      'so-luu-but',
      'Trạng thái chưa có lời chúc',
      'body',
      'Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc tới cô dâu chú rể.',
    ),
    vungHeThong(
      'so-luu-but.nut-gui',
      'so-luu-but',
      'Nút gửi lời chúc',
      'action',
      'Gửi lời chúc',
    ),
    vungHeThong(
      'so-luu-but.cam-on',
      'so-luu-but',
      'Lời cảm ơn',
      'caption',
      'Cảm ơn lời chúc của bạn!',
    ),
    vungHeThong(
      'popup-rsvp.tieu-de',
      'popup',
      'Tiêu đề popup RSVP',
      'title',
      'Xác nhận tham dự',
    ),
    vungHeThong(
      'nut-rsvp-noi',
      'popup',
      'Nút RSVP nổi',
      'action',
      'Xác nhận tham dự',
    ),
    vungHeThong(
      'popup-loi-chuc.tieu-de',
      'popup',
      'Tiêu đề popup lời chúc',
      'title',
      'Gửi lời chúc',
    ),
    vungHeThong(
      'popup-mung-cuoi.tieu-de',
      'popup',
      'Tiêu đề popup mừng cưới',
      'title',
      'Mừng cưới',
    ),
  ]
}

function loaiIdTrung(vung: MoTaVungChu[]): MoTaVungChu[] {
  const daCo = new Set<TextRegionId>()
  return vung.filter((item) => {
    if (daCo.has(item.id)) return false
    daCo.add(item.id)
    return true
  })
}

export function lietKeVungChu(thiep: Invitation): MoTaVungChu[] {
  return loaiIdTrung([
    ...biaRegions(thiep),
    ...demNguocRegions(thiep),
    ...coDauChuReRegions(thiep),
    ...systemCopyRegions(),
    ...thiep.chuyenChungMinh.slice(0, 1).flatMap(chuyenRegions),
    ...suKienSectionRegions(thiep),
    ...dressCodeRegions(thiep),
    ...mungCuoiRegions(thiep),
  ])
}

export function timVungChu(
  thiep: Invitation,
  id: TextRegionId,
): MoTaVungChu | undefined {
  return lietKeVungChu(thiep).find((vung) => vung.id === id)
}
