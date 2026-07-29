import { describe, expect, it } from 'vitest'
import { thiepMau } from '../mau'
import { lietKeVungChu, timVungChu } from '../textRegions'
import type { Invitation } from '../types'

const ID_HE_THONG = [
  'bia.loi-mo-dau',
  'bia.ky-hieu-noi',
  'bia.nut-mo',
  'dem-nguoc.tieu-de',
  'co-dau-chu-re.tieu-de',
  'co-dau-chu-re.ky-hieu-noi',
  'co-dau-chu-re.chu-re.vai-tro',
  'co-dau-chu-re.co-dau.vai-tro',
  'chuyen-chung-minh.tieu-de',
  'album.tieu-de',
  'su-kien.tieu-de',
  'dress-code.tieu-de',
  'dress-code.huong-dan',
  'rsvp.tieu-de',
  'rsvp.loi-moi',
  'rsvp.nut-mo',
  'mung-cuoi.tieu-de',
  'mung-cuoi.nha-trai.ten-ben',
  'mung-cuoi.nha-trai.goi-y-mo',
  'mung-cuoi.nha-trai.nut-sao-chep',
  'mung-cuoi.nha-gai.ten-ben',
  'mung-cuoi.nha-gai.goi-y-mo',
  'mung-cuoi.nha-gai.nut-sao-chep',
  'so-luu-but.tieu-de',
  'so-luu-but.trang-thai-rong',
  'so-luu-but.nut-gui',
  'so-luu-but.cam-on',
  'popup-rsvp.tieu-de',
  'nut-rsvp-noi',
  'popup-loi-chuc.tieu-de',
  'popup-mung-cuoi.tieu-de',
] as const

const ID_SINH_TU_DU_LIEU = ['dem-nguoc.thang', 'dem-nguoc.thu', 'dem-nguoc.ngay'] as const

const ID_NOI_DUNG_NGHIEP_VU = [
  'bia.chu-re.ten',
  'bia.co-dau.ten',
  'co-dau-chu-re.chu-re.ten',
  'co-dau-chu-re.chu-re.gioi-thieu',
  'co-dau-chu-re.chu-re.ten-bo',
  'co-dau-chu-re.chu-re.ten-me',
  'co-dau-chu-re.co-dau.ten',
  'co-dau-chu-re.co-dau.gioi-thieu',
  'co-dau-chu-re.co-dau.ten-bo',
  'co-dau-chu-re.co-dau.ten-me',
  'dress-code.mo-ta',
  'mung-cuoi.nha-trai.chu-tai-khoan',
  'mung-cuoi.nha-trai.so-tai-khoan',
  'mung-cuoi.nha-trai.ngan-hang',
  'mung-cuoi.nha-gai.chu-tai-khoan',
  'mung-cuoi.nha-gai.so-tai-khoan',
  'mung-cuoi.nha-gai.ngan-hang',
] as const

function thiepCoId(): Invitation {
  return {
    ...thiepMau,
    chuyenChungMinh: [
      {
        ...thiepMau.chuyenChungMinh[0],
        id: 'story-a',
      },
      {
        ...thiepMau.chuyenChungMinh[1],
        id: 'story-b',
      },
    ],
    suKien: [
      {
        ...thiepMau.suKien[0],
        id: 'abc',
      },
      {
        ...thiepMau.suKien[1],
        id: 'def',
      },
    ],
  }
}

describe('lietKeVungChu', () => {
  it('liệt kê đủ contract ID và mỗi ID chỉ xuất hiện một lần', () => {
    const ids = lietKeVungChu(thiepCoId()).map((vung) => vung.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(
      expect.arrayContaining([
        ...ID_HE_THONG,
        ...ID_SINH_TU_DU_LIEU,
        ...ID_NOI_DUNG_NGHIEP_VU,
        'su-kien.ngay.2026-11-14',
        'su-kien.abc.gio',
        'su-kien.abc.ten',
        'su-kien.abc.dia-diem',
        'su-kien.abc.nut-them-lich',
        'chuyen-chung-minh.story-a.tieu-de',
      ]),
    )
  })

  it('loại ID trùng từ dữ liệu lặp thay vì tạo vùng DOM không hợp lệ', () => {
    const thiep = thiepCoId()
    const suKienTrungId = { ...thiep.suKien[1], id: 'abc' }
    const ids = lietKeVungChu({ ...thiep, suKien: [thiep.suKien[0], suKienTrungId] }).map(
      (vung) => vung.id,
    )

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids.filter((id) => id === 'su-kien.abc.ten')).toHaveLength(1)
    expect(ids.filter((id) => id === 'su-kien.ngay.2026-11-14')).toHaveLength(1)
  })

  it('setter sự kiện chỉ thay đổi item có đúng ID', () => {
    const thiep = thiepCoId()
    const vungTen = timVungChu(thiep, 'su-kien.abc.ten')
    const vungGio = timVungChu(thiep, 'su-kien.abc.gio')
    const vungDiaDiem = timVungChu(thiep, 'su-kien.abc.dia-diem')

    const doiTen = vungTen!.capNhatNoiDung!(thiep, 'Lễ thành hôn')
    const doiGio = vungGio!.capNhatNoiDung!(thiep, '08:30')
    const xoaDiaDiem = vungDiaDiem!.capNhatNoiDung!(thiep, '')

    expect(doiTen.suKien.map(({ id, ten }) => ({ id, ten }))).toEqual([
      { id: 'abc', ten: 'Lễ thành hôn' },
      { id: 'def', ten: thiep.suKien[1].ten },
    ])
    expect(doiGio.suKien.map(({ id, gio }) => ({ id, gio }))).toEqual([
      { id: 'abc', gio: '08:30' },
      { id: 'def', gio: thiep.suKien[1].gio },
    ])
    expect(xoaDiaDiem.suKien[0].diaDiem).toBeUndefined()
    expect(xoaDiaDiem.suKien[1]).toEqual(thiep.suKien[1])
    expect(thiep.suKien[0].ten).not.toBe('Lễ thành hôn')
  })

  it('chỉ đăng ký trường câu chuyện mà component thực sự render', () => {
    const ids = lietKeVungChu(thiepCoId())
      .map((vung) => vung.id)
      .filter((id) => id.startsWith('chuyen-chung-minh.story-'))

    expect(ids).toEqual(['chuyen-chung-minh.story-a.tieu-de'])
  })

  it('setter câu chuyện chỉ thay đổi item có đúng ID', () => {
    const thiep = thiepCoId()
    const vung = timVungChu(thiep, 'chuyen-chung-minh.story-a.tieu-de')

    const ketQua = vung!.capNhatNoiDung!(thiep, 'Một tiêu đề mới')

    expect(ketQua.chuyenChungMinh[0].tieuDe).toBe('Một tiêu đề mới')
    expect(ketQua.chuyenChungMinh[1]).toEqual(thiep.chuyenChungMinh[1])
    expect(thiep.chuyenChungMinh[0].tieuDe).not.toBe('Một tiêu đề mới')
  })

  it('nội dung nghiệp vụ có setter, system copy chỉ dùng text override', () => {
    const thiep = thiepCoId()

    for (const id of ID_NOI_DUNG_NGHIEP_VU) {
      const vung = timVungChu(thiep, id)
      expect(vung, id).toBeDefined()
      expect(vung?.choSuaNoiDung, id).toBe(true)
      expect(vung?.capNhatNoiDung, id).toBeTypeOf('function')
    }

    for (const id of ID_HE_THONG) {
      const vung = timVungChu(thiep, id)
      expect(vung, id).toBeDefined()
      expect(vung?.choSuaNoiDung, id).toBe(true)
      expect(vung?.capNhatNoiDung, id).toBeUndefined()
    }
  })

  it('nội dung sinh từ lịch chỉ cho chỉnh kiểu chữ, không cho sửa nội dung', () => {
    const thiep = thiepCoId()
    const ids = [...ID_SINH_TU_DU_LIEU, 'su-kien.ngay.2026-11-14']

    for (const id of ids) {
      const vung = timVungChu(thiep, id)
      expect(vung?.choSuaNoiDung, id).toBe(false)
      expect(vung?.capNhatNoiDung, id).toBeUndefined()
    }
  })

  it('không lộ nhãn form, accessibility copy, mô tả ảnh hay nội dung của khách', () => {
    const noiDungCam = [
      'Nhãn RSVP bí mật',
      'Mô tả ảnh accessibility bí mật',
      'Lời chúc do khách gửi',
    ]
    const thiep: Invitation = {
      ...thiepCoId(),
      album: [{ url: '/anh.jpg', moTa: noiDungCam[1] }],
      cauHinhRsvp: {
        truongChuan: ['hoTen'],
        truongTuyChinh: [{ id: 'bi-mat', nhan: noiDungCam[0], kieu: 'text' }],
      },
    }

    const vung = lietKeVungChu(thiep)

    expect(vung.map((item) => item.noiDung)).not.toEqual(expect.arrayContaining(noiDungCam))
    expect(vung.map((item) => item.id).some((id) => /form|label|placeholder|aria|guest|khach/.test(id))).toBe(
      false,
    )
  })
})

describe('timVungChu', () => {
  it('trả về undefined khi ID không thuộc registry', () => {
    expect(timVungChu(thiepMau, 'rsvp.form.ho-ten')).toBeUndefined()
  })
})
