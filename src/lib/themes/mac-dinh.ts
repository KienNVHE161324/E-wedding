import type { Theme } from './types'

/**
 * Theme tối giản để nền tảng chạy và test được.
 * Session thiết kế thêm các theme thật vào cùng thư mục này theo đúng hình dạng Theme.
 */
export const macDinh: Theme = {
  id: 'mac-dinh',
  ten: 'Mặc định',
  mau: {
    nen: '#FFFFFF',
    chu: '#1F1F1F',
    chinh: '#8B2F20',
    phu: '#6B6B6B',
    nhan: '#B0833C',
  },
  font: {
    tieuDe: 'serif',
    noiDung: 'sans-serif',
  },
  // Đường dẫn dưới /hoa-tiet, sinh bởi `npm run hoa-tiet`.
  hoaTiet: {
    divider: 'primary-decor/nature/song-nuoc-may-troi-01.png',
    corner: 'watermarks/florals/single-flowers/WF01-lotus-front.png',
    watermark: 'primary-decor/symbols/chu-hy-trien-01.png',
    seal: 'primary-decor/symbols/chu-hy-trien-01.png',
  },
  doDam: {
    divider: 0.5,
    corner: 0.4,
    watermark: 0.08,
    seal: 0.6,
  },
  thuTuSection: [
    { id: 'bia' },
    { id: 'dem-nguoc' },
    { id: 'co-dau-chu-re' },
    { id: 'chuyen-chung-minh' },
    { id: 'album' },
    { id: 'su-kien' },
    { id: 'rsvp' },
    { id: 'mung-cuoi' },
    { id: 'so-luu-but' },
  ],
}
