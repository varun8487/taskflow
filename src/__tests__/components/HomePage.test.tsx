import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByText('Streamline Your')
    expect(heading).toBeInTheDocument()
    
    const subheading = screen.getByText("Team's Workflow")
    expect(subheading).toBeInTheDocument()
  })

  it('displays the TaskFlow logo and title', () => {
    render(<HomePage />)
    
    const logoText = screen.getAllByText('TaskFlow')
    expect(logoText.length).toBeGreaterThan(0)
  })

  it('shows pricing plans', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('$19')).toBeInTheDocument()
  })

  it('displays feature cards', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Team Collaboration')).toBeInTheDocument()
    expect(screen.getByText('Advanced Analytics')).toBeInTheDocument()
    expect(screen.getByText('File Management')).toBeInTheDocument()
    expect(screen.getByText('Real-time Updates')).toBeInTheDocument()
    expect(screen.getByText('Secure Authentication')).toBeInTheDocument()
    expect(screen.getByText('Task Management')).toBeInTheDocument()
  })

  it('includes call-to-action buttons', () => {
    render(<HomePage />)
    
    const getStartedButtons = screen.getAllByText('Get Started')
    expect(getStartedButtons.length).toBeGreaterThan(0)
    
    const signInButtons = screen.getAllByText('Sign In')
    expect(signInButtons.length).toBeGreaterThan(0)
  })

  it('displays feature comparison table', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Feature Comparison')).toBeInTheDocument()
    expect(screen.getByText('Team Members')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('File Storage')).toBeInTheDocument()
    expect(screen.getByText('Analytics')).toBeInTheDocument()
  })

  it('shows the hero description', () => {
    render(<HomePage />)
    
    const description = screen.getByText(/TaskFlow is a beautiful, modern project management platform/)
    expect(description).toBeInTheDocument()
  })
})
