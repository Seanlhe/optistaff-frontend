import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mocks
const mockCreateShift = vi.fn()
const mockNavigate = vi.fn()

vi.mock('../../../src/hooks/useShifts', () => ({
    useShifts: () => ({
        createShift: mockCreateShift,
    }),
}))

// Mock react-router-dom useNavigate while keeping other exports intact
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Mock CustomInputField to a simple labeled input
vi.mock('../../../src/components/CustomInputField', () => ({
    __esModule: true,
    default: ({ name, title, type = 'text', onChange }: { name: string; title: string; type?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
        <label>
            {title}
            <input name={name} type={type} aria-label={title} onChange={onChange} />
        </label>
    ),
}))

// Mock CustomTextArea to a simple labeled textarea
vi.mock('../../../src/components/CustomTextArea', () => ({
    __esModule: true,
    default: ({ name, title, onChange }: { name: string; title: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => (
        <label>
            {title}
            <textarea name={name} aria-label={title} onChange={onChange} />
        </label>
    ),
}))

// Mock CustomSelect to a simple select that calls onInput
vi.mock('../../../src/components/CustomSelect', () => ({
    __esModule: true,
    default: ({ name, title, options, onInput }: { name: string; title: string; options: Array<{ value: string; label: string }>; onInput: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
        <label>
            {title}
            <select name={name} aria-label={title} onChange={onInput}>
                <option value="">Select...</option>
                {options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </label>
    ),
}))

// Mock DateInput to a simple date input that calls onChange with string
vi.mock('../../../src/components/DateInput', () => ({
    __esModule: true,
    DateInput: ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
        <label>
            {label}
            <input type="date" aria-label={label} value={value} onChange={(e) => onChange((e.target as HTMLInputElement).value)} />
        </label>
    ),
}))

// Import after mocks
import UploadJobs from '../../../src/pages/employer/UploadJobs'

// Helper to type in inputs by label
const typeIn = (labelText: string, value: string) => {
    const el = screen.getByLabelText(labelText)
    fireEvent.change(el, { target: { value } })
}

describe('UploadJobs - create shift flow', () => {
    beforeEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
        mockCreateShift.mockResolvedValue({ shift_id: 'new-shift' })
    })
    afterEach(() => {
        vi.useRealTimers()
    })

    it('fills form, posts job, shows success, and navigates after delay', async () => {
        render(<UploadJobs />)

        // Fill fields
        // Set date first so time fields use correct base date
        const dateInput = screen.getByLabelText('Date') as HTMLInputElement
        fireEvent.change(dateInput, { target: { value: '2099-08-15' } })

        typeIn('Start Time', '09:00')
        typeIn('End Time', '17:00')

        typeIn('Job Title', 'Software Engineer')
        typeIn('Description', 'Build awesome UIs')
        typeIn('Requirements', 'React, TS')

        // Select job category (choose first non-empty option if available)
        const jobCat = screen.getByLabelText('Job Category')
        fireEvent.change(jobCat, { target: { value: 'Waiter/Waitress' } })

        typeIn('Pay Rate (/hr)', '35')
        typeIn('No. Pax', '3')
        typeIn('Break Duration (hrs)', '1')

        typeIn('Address', '123 Street')
        typeIn('Postal Code', '123456')

        // Submit
        const postBtn = screen.getByRole('button', { name: /post job/i })
        fireEvent.click(postBtn)

        // CreateShift called once with a payload
        await waitFor(() => expect(mockCreateShift).toHaveBeenCalledTimes(1))
        const payload = mockCreateShift.mock.calls[0][0]

        // Basic payload assertions
        expect(payload.job_title).toBe('Software Engineer')
        expect(payload.job_type).toBe('Waiter/Waitress')
        expect(payload.pay_rate).toBeGreaterThan(0)
        expect(payload.staff_needed).toBeGreaterThan(0)
        expect(payload.postal_code).toBe(123456)
        expect(payload.start_time instanceof Date).toBe(true)
        expect(payload.end_time instanceof Date).toBe(true)

        // Success alert appears
        await waitFor(() => expect(screen.getByText(/Job listing created successfully!/i)).toBeTruthy())

        // Wait using real timers for the 3s navigation delay
        await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/employer/dashboard'), { timeout: 5500 })
    })
})
