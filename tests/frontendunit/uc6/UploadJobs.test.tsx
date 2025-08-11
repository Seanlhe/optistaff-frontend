import '@testing-library/jest-dom/vitest'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type React from 'react'

// Mocks
const navigateMock = vi.fn()
const createShiftMock = vi.fn().mockResolvedValue({ shift_id: 'shift-1' })

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => navigateMock }
})

vi.mock('../../../src/hooks/useShifts', () => ({
  useShifts: () => ({ createShift: createShiftMock }),
}))

// Minimal typed mocks for custom UI components to simplify DOM interactions

type Option = { label?: string; value?: string } | string

interface InputProps {
  name: string
  title?: string
  placeholder?: string
  type?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  valid?: boolean
  error?: unknown
  numericOnly?: boolean
  maxLength?: number
}

interface TextAreaProps {
  name: string
  title?: string
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
  valid?: boolean
  error?: unknown
}

interface SelectProps {
  name: string
  options?: Option[]
  onInput?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  className?: string
  title?: string
  placeholder?: string
  valid?: boolean
  error?: unknown
}

interface DateInputProps {
  label: string
  value: string
  onChange?: (value: string) => void
  required?: boolean
  error?: string
  placeholder?: string
  minDate?: Date
  maxDate?: Date
}

vi.mock('../../../src/components/CustomInputField', () => ({
  default: (props: InputProps) => (
    <input
      data-testid={props.name}
      name={props.name}
      placeholder={props.placeholder || props.title}
      type={props.type || 'text'}
      onChange={props.onChange}
    />
  ),
}))

vi.mock('../../../src/components/CustomTextArea', () => ({
  default: (props: TextAreaProps) => (
    <textarea
      data-testid={props.name}
      name={props.name}
      placeholder={props.placeholder || props.title}
      onChange={props.onChange}
    />
  ),
}))

vi.mock('../../../src/components/CustomSelect', () => ({
  default: (props: SelectProps) => (
    <select
      data-testid={props.name}
      name={props.name}
      onChange={(e) => props.onInput?.(e)}
      defaultValue=""
    >
      <option value="" disabled>
        Select
      </option>
      {(props.options || []).map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value ?? ''
        const label = typeof opt === 'string' ? opt : opt.label ?? value
        return (
          <option key={value} value={value}>
            {label}
          </option>
        )
      })}
    </select>
  ),
}))

vi.mock('../../../src/components/DateInput', () => ({
  DateInput: (props: DateInputProps) => (
    <label>
      {props.label}
      <input
        aria-label={props.label}
        type="date"
        value={props.value}
        onChange={(e) => props.onChange?.(e.target.value)}
      />
    </label>
  ),
}))

// Import after mocks
import UploadJobs from '../../../src/pages/employer/UploadJobs'
import { validateShift } from '../../../src/utils/uploadjobs'
import type { Shift } from '../../../src/types/hooks'

describe('UploadJobs - rendering', () => {
  it('renders all required input fields', () => {
    render(<UploadJobs />)

    // Title & description section
    expect(screen.getByTestId('job_title')).toBeInTheDocument()
    expect(screen.getByTestId('job_type')).toBeInTheDocument()
    expect(screen.getByTestId('job_description')).toBeInTheDocument()
    expect(screen.getByTestId('job_requirements')).toBeInTheDocument()

    // Time and venue
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
    expect(screen.getByTestId('start_time')).toBeInTheDocument()
    expect(screen.getByTestId('end_time')).toBeInTheDocument()
    expect(screen.getByTestId('job_location')).toBeInTheDocument()
    expect(screen.getByTestId('postal_code')).toBeInTheDocument()

    // Staffing requirements
    expect(screen.getByTestId('pay_rate')).toBeInTheDocument()
    expect(screen.getByTestId('staff_needed')).toBeInTheDocument()
    expect(screen.getByTestId('break_duration')).toBeInTheDocument()

    // Buttons
    expect(screen.getByRole('button', { name: /post job/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})

describe('validateShift', () => {
  type ShiftInput = Omit<
    Shift,
    | 'shift_id'
    | 'created_at'
    | 'status'
    | 'staff_assigned'
    | 'employer_name'
    | 'submission_cycle'
    | 'company_name'
  >

  it('returns no errors for a valid shift', () => {
    const now = new Date()
    const start = new Date(now.getTime() + 24 * 60 * 60 * 1000) // +1 day
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // +2 hours
    const shift: ShiftInput = {
      job_title: 'Banquet Server',
      job_description: 'Serve guests',
      job_requirements: 'Black attire',
      job_type: 'Waiter/Waitress',
      pay_rate: 20,
      job_location: '123 Test Street',
      postal_code: 123456,
      start_time: start,
      end_time: end,
      break_duration: 0.5,
      staff_needed: 2,
    }

    const errors = validateShift(shift)
    expect(Object.values(errors).every((v) => v === null)).toBe(true)
  })

  it('returns errors for an invalid shift', () => {
    const now = new Date()
    const startPast = new Date(now.getTime() - 24 * 60 * 60 * 1000) // yesterday
    const endTooShort = new Date(startPast.getTime() + 30 * 60 * 1000) // +30 mins
    const shift: ShiftInput = {
      job_title: '',
      job_description: '',
      job_requirements: '',
      job_type: '',
      pay_rate: 0,
      job_location: '',
      postal_code: 1234 as unknown as number, // force invalid length
      start_time: startPast,
      end_time: endTooShort,
      break_duration: 3, // longer than duration
      staff_needed: 0,
    }

    const errors = validateShift(shift)

    expect(errors.job_title).toBe('Job title is required.')
    expect(errors.job_location).toBe('Job location is required.')
    expect(errors.job_description).toBe('Job description is required.')
    expect(errors.job_requirements).toBe('Job requirements are required.')
    expect(errors.postal_code).toBe('Postal code must be a 6-digit number.')
    expect(errors.job_type).toBe('Job type is required.')
    expect(errors.pay_rate).toBe('Pay rate must be a positive number.')
    expect(errors.staff_needed).toBe('Staff No. must be a positive number.')
    // Date-related validations
    expect(errors.date).toBe('Please enter a date later than today')
    expect(errors.end_time).toBe('Job duration must be at least 1 hour.')
    expect(errors.break_duration).toBe('Break duration must be shorter than job duration.')
  })
})
