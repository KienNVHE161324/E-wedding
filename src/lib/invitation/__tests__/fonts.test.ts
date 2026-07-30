import { describe, expect, it } from 'vitest'
import { FONT_CHU_OPTIONS } from '../fonts'

describe('FONT_CHU_OPTIONS', () => {
  it('offers each supported font exactly once', () => {
    const ids = FONT_CHU_OPTIONS.map((font) => font.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toEqual(expect.arrayContaining(['serif-co-dien', 'sans-sach', 'viet-tay']))
  })
})
