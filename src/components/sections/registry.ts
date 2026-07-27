import type { FC } from 'react'
import type { SectionId } from '@/lib/invitation/types'
import type { SectionProps } from './types'
import { Bia } from './Bia'
import { DemNguoc } from './DemNguoc'
import { CoDauChuRe } from './CoDauChuRe'
import { ChuyenChungMinh } from './ChuyenChungMinh'
import { Album } from './Album'
import { SuKien } from './SuKien'
import { Rsvp } from './Rsvp'
import { MungCuoi } from './MungCuoi'
import { SoLuuBut } from './SoLuuBut'

/** Mọi SectionId phải có đúng một component. TypeScript ép điều này. */
export const SECTION_REGISTRY: Record<SectionId, FC<SectionProps>> = {
  'bia': Bia,
  'dem-nguoc': DemNguoc,
  'co-dau-chu-re': CoDauChuRe,
  'chuyen-chung-minh': ChuyenChungMinh,
  'album': Album,
  'su-kien': SuKien,
  'rsvp': Rsvp,
  'mung-cuoi': MungCuoi,
  'so-luu-but': SoLuuBut,
}
