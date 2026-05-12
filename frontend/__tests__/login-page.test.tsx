import { render, screen } from '@testing-library/react'
import LoginPage from '@/app/login/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock auth client
jest.mock('@/lib/auth-client', () => ({
  authClient: {
    signIn: {
      social: jest.fn(),
      passkey: jest.fn(),
    },
  },
}))

describe('LoginPage', () => {
  it('renders the login page with auth buttons', () => {
    render(<LoginPage />)
    
    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument()
    expect(screen.getByText(/Sign in with Passkey/i)).toBeInTheDocument()
  })
})
