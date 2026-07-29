'use client'

import { createContext, type PointerEvent } from 'react'
import type { TextRegionId } from '@/lib/invitation/textTypes'

export interface TextEditorBridgeValue {
  dangChinh: boolean
  dangChon: TextRegionId | null
  chon: (id: TextRegionId) => void
  batDauKeo: (
    id: TextRegionId,
    event: PointerEvent<HTMLElement>,
  ) => void
  dichBangPhim: (
    id: TextRegionId,
    dx: number,
    dy: number,
  ) => void
}

export const TextEditorBridge =
  createContext<TextEditorBridgeValue | null>(null)
