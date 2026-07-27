import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThanhDoDam } from '../ThanhDoDam'

describe('ThanhDoDam', () => {
  it('hiện nhãn và giá trị phần trăm', () => {
    render(<ThanhDoDam nhan="Họa tiết nền" giaTri={0.15} onDoi={() => {}} />)
    expect(screen.getByText('Họa tiết nền')).toBeInTheDocument()
    expect(screen.getByText('15%')).toBeInTheDocument()
  })

  it('coi giá trị thiếu là đậm hết mức', () => {
    render(<ThanhDoDam nhan="Viền bìa" giaTri={undefined} onDoi={() => {}} />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('báo giá trị mới theo thang 0 đến 1', () => {
    const onDoi = vi.fn()
    render(<ThanhDoDam nhan="Viền bìa" giaTri={1} onDoi={onDoi} />)
    fireEvent.change(screen.getByLabelText('Viền bìa'), { target: { value: '40' } })
    expect(onDoi).toHaveBeenCalledWith(0.4)
  })
})
