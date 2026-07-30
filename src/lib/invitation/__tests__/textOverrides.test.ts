import { describe, expect, it } from 'vitest'
import {
  capNhatVungChu,
  deltaSangToaDo,
  xoaOverrideTheoPrefix,
} from '../textOverrides'

describe('capNhatVungChu', () => {
  it('creates an override for a region when none exists', () => {
    expect(capNhatVungChu(undefined, 'bia.loi-mo-dau', { x: 2 })).toEqual({
      'bia.loi-mo-dau': { x: 2 },
    })
  })

  it('removes undefined keys and an empty region override', () => {
    expect(
      capNhatVungChu(
        { 'bia.loi-mo-dau': { x: 2 } },
        'bia.loi-mo-dau',
        { x: undefined },
      ),
    ).toBeUndefined()
  })
})

describe('xoaOverrideTheoPrefix', () => {
  it('removes only region overrides whose IDs start with the prefix', () => {
    expect(
      xoaOverrideTheoPrefix(
        {
          'su-kien.a.ten': { x: 1 },
          'su-kien.a.gio': { y: 2 },
          'su-kien.b.ten': { x: 3 },
        },
        'su-kien.a.',
      ),
    ).toEqual({ 'su-kien.b.ten': { x: 3 } })
  })
})

describe('deltaSangToaDo', () => {
  it('converts a frame delta into rounded percentage coordinates', () => {
    expect(deltaSangToaDo(52, -26, 520, { x: 1, y: 2 })).toEqual({ x: 11, y: -3 })
  })

  it('clamps coordinates to the supported range', () => {
    expect(deltaSangToaDo(10_000, -10_000, 520, { x: 0, y: 0 })).toEqual({
      x: 100,
      y: -100,
    })
  })
})
