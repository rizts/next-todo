import { render, screen } from '@testing-library/react'
import DashboardPage from '@/app/dashboard/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock auth client
const mockUseSession = jest.fn()
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => mockUseSession(),
    signOut: jest.fn(),
    passkey: {
      addPasskey: jest.fn(),
    },
  },
}))

describe('DashboardPage', () => {
  it('renders loading state when session is pending', () => {
    mockUseSession.mockReturnValue({
      data: null,
      isPending: true,
      error: null,
    })
    
    render(<DashboardPage />)
    expect(screen.getByText(/Setting up your space/i)).toBeInTheDocument()
  })

  it('renders user info when session is loaded', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      isPending: false,
      error: null,
    })
    
    render(<DashboardPage />)
    expect(screen.getByText(/Hello, John!/i)).toBeInTheDocument()
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument()
  })
})
