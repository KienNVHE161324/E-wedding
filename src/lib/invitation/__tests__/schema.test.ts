import { describe, it, expect } from 'vitest'
import { invitationSchema } from '../schema'
import { thiepMau } from '../mau'

describe('invitationSchema', () => {
  it('chấp nhận thiệp mẫu', () => {
    expect(() => invitationSchema.parse(thiepMau)).not.toThrow()
  })

  it('từ chối ngày cưới sai định dạng', () => {
    expect(() => invitationSchema.parse({ ...thiepMau, ngayCuoi: '26/04/2026' })).toThrow()
  })

  it('từ chối section id không có thật', () => {
    expect(() =>
      invitationSchema.parse({ ...thiepMau, sections: [{ id: 'khong-ton-tai' }] }),
    ).toThrow()
  })

  it('từ chối slug rỗng', () => {
    expect(() => invitationSchema.parse({ ...thiepMau, slug: '' })).toThrow()
  })

  it('chấp nhận tùy chỉnh màu và độ đậm hợp lệ', () => {
    const thiep = {
      ...thiepMau,
      tuyChinhGiaoDien: { mauChinh: '#123456', doDam: { watermark: 0.15 } },
    }
    expect(() => invitationSchema.parse(thiep)).not.toThrow()
  })

  it('giữ cấu hình chữ hợp lệ của chi tiết trang trí', () => {
    const ketQua = invitationSchema.parse({
      ...thiepMau,
      chiTietTrangTri: [
        {
          id: 'primary-decor/wedding-ritual/thiep-phong-bi-giay-do-trien-doi-chim-01',
          section: 'album',
          x: 50,
          y: 50,
          mau: '#8B2F20',
          doDam: 1,
          kichThuoc: 60,
          chu: {
            noiDung: 'Trân trọng kính mời',
            font: 'viet-tay',
            coChu: 24,
            mauChu: '#6B2F24',
            canLe: 'center',
          },
        },
      ],
    })

    expect(ketQua.chiTietTrangTri?.[0].chu?.noiDung).toBe('Trân trọng kính mời')
    expect(ketQua.chiTietTrangTri?.[0].chu?.font).toBe('viet-tay')
  })

  it('từ chối cấu hình chữ chi tiết không hợp lệ', () => {
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        chiTietTrangTri: [
          {
            id: 'x',
            section: 'bia',
            x: 50,
            y: 50,
            mau: '#8B2F20',
            doDam: 1,
            kichThuoc: 25,
            chu: {
              noiDung: '',
              font: 'sai',
              coChu: 100,
              mauChu: 'red',
              canLe: 'sai',
            },
          },
        ],
      }),
    ).toThrow()
  })

  it('từ chối độ đậm ngoài khoảng 0 đến 1', () => {
    const thiep = { ...thiepMau, tuyChinhGiaoDien: { doDam: { watermark: 1.5 } } }
    expect(() => invitationSchema.parse(thiep)).toThrow()
  })

  it('từ chối slot họa tiết không có thật', () => {
    const thiep = { ...thiepMau, tuyChinhGiaoDien: { doDam: { 'khong-co': 0.5 } } }
    expect(() => invitationSchema.parse(thiep)).toThrow()
  })

  it('giữ cấu hình họa tiết theme và góc xoay chi tiết tự do', () => {
    const ketQua = invitationSchema.parse({
      ...thiepMau,
      tuyChinhGiaoDien: {
        hoaTiet: {
          watermark: {
            id: 'primary-decor/symbols/chu-hy-trien-01',
            x: 48,
            y: 42,
            kichThuoc: 55,
            gocXoay: -30,
            mau: '#123456',
            doDam: 0.25,
            raSauChu: true,
            an: false,
          },
        },
      },
      chiTietTrangTri: [
        {
          id: 'primary-decor/symbols/chu-hy-trien-01',
          section: 'bia',
          x: 50,
          y: 50,
          mau: '#123456',
          doDam: 0.5,
          kichThuoc: 25,
          gocXoay: 45,
        },
      ],
    })

    expect(ketQua.tuyChinhGiaoDien?.hoaTiet?.watermark?.gocXoay).toBe(-30)
    expect(ketQua.chiTietTrangTri?.[0].gocXoay).toBe(45)
  })

  it('từ chối góc xoay ngoài khoảng -180 đến 180', () => {
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        tuyChinhGiaoDien: { hoaTiet: { corner: { gocXoay: 181 } } },
      }),
    ).toThrow()
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        chiTietTrangTri: [
          {
            id: 'primary-decor/symbols/chu-hy-trien-01',
            section: 'bia',
            x: 50,
            y: 50,
            mau: '#123456',
            doDam: 0.5,
            kichThuoc: 25,
            gocXoay: -181,
          },
        ],
      }),
    ).toThrow()
  })

  it('giữ cấu hình QR hợp lệ và vẫn chấp nhận thiệp cũ', () => {
    expect(() => invitationSchema.parse(thiepMau)).not.toThrow()

    const ketQua = invitationSchema.parse({
      ...thiepMau,
      kieuKhungQr: 'phong-bao',
      mungCuoi: [
        {
          ...thiepMau.mungCuoi[0],
          tuyChinhQr: {
            kieuKhung: 'toi-gian',
            mauQr: '#111111',
            mauNen: '#FFFFFF',
          },
        },
      ],
    })

    expect(ketQua.kieuKhungQr).toBe('phong-bao')
    expect(ketQua.mungCuoi[0].tuyChinhQr?.mauQr).toBe('#111111')
  })

  it('từ chối preset và màu QR không hợp lệ', () => {
    expect(() =>
      invitationSchema.parse({ ...thiepMau, kieuKhungQr: 'khong-co' }),
    ).toThrow()
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        mungCuoi: [
          {
            ...thiepMau.mungCuoi[0],
            tuyChinhQr: { mauQr: 'red' },
          },
        ],
      }),
    ).toThrow()
  })

  it('chấp nhận cấu hình đoạn nhạc và vẫn nhận dữ liệu nhạc cũ', () => {
    expect(() => invitationSchema.parse(thiepMau)).not.toThrow()
    const ketQua = invitationSchema.parse({
      ...thiepMau,
      nhac: { ...thiepMau.nhac!, batDau: 80, thoiLuong: 30 },
    })
    expect(ketQua.nhac).toMatchObject({ batDau: 80, thoiLuong: 30 })
  })

  it('từ chối thời lượng đoạn và điểm bắt đầu không hợp lệ', () => {
    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        nhac: { ...thiepMau.nhac!, batDau: -1, thoiLuong: 45 },
      }),
    ).toThrow()
  })
  it('keeps valid per-region text overrides', () => {
    const tuyChinhChuHopLe = {
      'bia.chu-re.ten': {
        font: 'viet-tay',
        coChu: 42,
        mauChu: '#8B2F20',
        x: 12.5,
        y: -3,
      },
    }

    expect(
      invitationSchema.parse({ ...thiepMau, tuyChinhChu: tuyChinhChuHopLe }).tuyChinhChu,
    ).toEqual(tuyChinhChuHopLe)
  })

  it('rejects invalid per-region text overrides', () => {
    for (const sai of [
      { font: 'comic-sans' },
      { coChu: 121 },
      { coChu: 7 },
      { mauChu: 'red' },
      { x: -101 },
      { y: 101 },
      { noiDung: 'x'.repeat(501) },
    ]) {
      expect(() =>
        invitationSchema.parse({ ...thiepMau, tuyChinhChu: { 'bia.loi-mo-dau': sai } }),
      ).toThrow()
    }

    expect(() =>
      invitationSchema.parse({
        ...thiepMau,
        tuyChinhChu: Object.fromEntries(
          Array.from({ length: 251 }, (_, i) => [`vung-${i}`, { x: 0 }]),
        ),
      }),
    ).toThrow()
  })

  it.each([
    ['rsvp.tieu-de', ''],
    ['rsvp.nut-mo', '   '],
  ])(
    'rejects blank required system copy for %s',
    (id, noiDung) => {
      expect(() =>
        invitationSchema.parse({
          ...thiepMau,
          tuyChinhChu: { [id]: { noiDung } },
        }),
      ).toThrow()
    },
  )

  it('accepts old invitations without IDs or text overrides', () => {
    expect(() => invitationSchema.parse(thiepMau)).not.toThrow()
  })
})
