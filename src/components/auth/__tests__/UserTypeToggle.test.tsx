import { render, screen, fireEvent } from '@testing-library/react'
import { UserTypeToggle } from '../UserTypeToggle'

describe('UserTypeToggle', () => {
  const mockSetUserType = jest.fn()

  beforeEach(() => {
    mockSetUserType.mockClear()
  })

  it('renders both user type options', () => {
    render(
      <UserTypeToggle userType="jobseeker" setUserType={mockSetUserType} />
    )

    expect(screen.getByText('🔍 Job Seeker')).toBeInTheDocument()
    expect(screen.getByText('🏢 Employer')).toBeInTheDocument()
  })

  it('highlights the selected user type', () => {
    render(
      <UserTypeToggle userType="employer" setUserType={mockSetUserType} />
    )

    const employerButton = screen.getByText('🏢 Employer')
    expect(employerButton).toHaveClass('border-green-500')
  })

  it('calls setUserType when a button is clicked', () => {
    render(
      <UserTypeToggle userType="jobseeker" setUserType={mockSetUserType} />
    )

    const employerButton = screen.getByText('🏢 Employer')
    fireEvent.click(employerButton)

    expect(mockSetUserType).toHaveBeenCalledWith('employer')
  })
})
