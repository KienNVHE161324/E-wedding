import { describe, it, expect } from 'vitest'
import { resolveSections } from '../sections'
import type { SectionRef } from '../types'

const thuTuTheme: SectionRef[] = [
  { id: 'bia' },
  { id: 'dem-nguoc' },
  { id: 'co-dau-chu-re' },
  { id: 'album' },
  { id: 'mung-cuoi' },
]

describe('resolveSections', () => {
  it('dùng thứ tự của theme khi thiệp không ghi đè', () => {
    expect(resolveSections(thuTuTheme, [])).toEqual([
      'bia', 'dem-nguoc', 'co-dau-chu-re', 'album', 'mung-cuoi',
    ])
  })

  it('dùng đúng thứ tự của thiệp khi có ghi đè', () => {
    const thuTuThiep: SectionRef[] = [
      { id: 'bia' },
      { id: 'mung-cuoi' },
      { id: 'co-dau-chu-re' },
    ]
    expect(resolveSections(thuTuTheme, thuTuThiep)).toEqual([
      'bia', 'mung-cuoi', 'co-dau-chu-re',
    ])
  })

  it('bỏ phần bị tắt', () => {
    const thuTuThiep: SectionRef[] = [
      { id: 'bia' },
      { id: 'chuyen-chung-minh', enabled: false },
      { id: 'album' },
    ]
    expect(resolveSections(thuTuTheme, thuTuThiep)).toEqual(['bia', 'album'])
  })

  it('bỏ phần bị tắt ngay trong thứ tự của theme', () => {
    const theme: SectionRef[] = [{ id: 'bia' }, { id: 'album', enabled: false }]
    expect(resolveSections(theme, [])).toEqual(['bia'])
  })

  it('loại phần trùng lặp, giữ lần xuất hiện đầu', () => {
    const thuTuThiep: SectionRef[] = [{ id: 'bia' }, { id: 'album' }, { id: 'bia' }]
    expect(resolveSections(thuTuTheme, thuTuThiep)).toEqual(['bia', 'album'])
  })
})
