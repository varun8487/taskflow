import { render, screen } from '@testing-library/react'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { FeatureGate, UsageLimit } from '@/components/FeatureGate'

// Mock the hooks
jest.mock('@clerk/nextjs')
jest.mock('convex/react')

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>

describe('FeatureGate', () => {
  const mockUser = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'john@example.com' }]
  }

  const mockConvexUser = {
    _id: 'convex_user_123',
    subscriptionTier: 'free',
    subscriptionStatus: 'active'
  }

  beforeEach(() => {
    mockUseUser.mockReturnValue({ 
      user: mockUser, 
      isLoaded: true, 
      isSignedIn: true 
    })
    
    mockUseQuery.mockReturnValue(mockConvexUser)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render children when user has access to feature', () => {
    mockUseQuery.mockReturnValue({
      ...mockConvexUser,
      subscriptionTier: 'pro'
    })

    render(
      <FeatureGate feature="analyticsAccess" requiredTier="pro">
        <div>Analytics Dashboard</div>
      </FeatureGate>
    )

    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument()
  })

  it('should render upgrade prompt when user lacks access', () => {
    mockUseQuery.mockReturnValue({
      ...mockConvexUser,
      subscriptionTier: 'free'
    })

    render(
      <FeatureGate feature="analyticsAccess" requiredTier="starter">
        <div>Analytics Dashboard</div>
      </FeatureGate>
    )

    expect(screen.getByText('Premium Feature')).toBeInTheDocument()
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument()
    expect(screen.queryByText('Analytics Dashboard')).not.toBeInTheDocument()
  })

  it('should render custom fallback when provided', () => {
    mockUseQuery.mockReturnValue({
      ...mockConvexUser,
      subscriptionTier: 'free'
    })

    render(
      <FeatureGate 
        feature="prioritySupport" 
        requiredTier="pro"
        fallback={<div>Custom Fallback</div>}
      >
        <div>Priority Support</div>
      </FeatureGate>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Priority Support')).not.toBeInTheDocument()
    expect(screen.queryByText('Premium Feature')).not.toBeInTheDocument()
  })

  it('should render nothing when showUpgrade is false and no fallback', () => {
    mockUseQuery.mockReturnValue({
      ...mockConvexUser,
      subscriptionTier: 'free'
    })

    const { container } = render(
      <FeatureGate 
        feature="customIntegrations" 
        requiredTier="enterprise"
        showUpgrade={false}
      >
        <div>Custom Integrations</div>
      </FeatureGate>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when user is not available', () => {
    mockUseUser.mockReturnValue({ 
      user: null, 
      isLoaded: true, 
      isSignedIn: false 
    })

    const { container } = render(
      <FeatureGate feature="analyticsAccess">
        <div>Analytics Dashboard</div>
      </FeatureGate>
    )

    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when convex user is not available', () => {
    mockUseQuery.mockReturnValue(null)

    const { container } = render(
      <FeatureGate feature="analyticsAccess">
        <div>Analytics Dashboard</div>
      </FeatureGate>
    )

    expect(container.firstChild).toBeNull()
  })
})

describe('UsageLimit', () => {
  const mockUser = {
    id: 'user_123',
    firstName: 'John',
    lastName: 'Doe',
    emailAddresses: [{ emailAddress: 'john@example.com' }]
  }

  const mockConvexUser = {
    _id: 'convex_user_123',
    subscriptionTier: 'free',
    subscriptionStatus: 'active'
  }

  beforeEach(() => {
    mockUseUser.mockReturnValue({ 
      user: mockUser, 
      isLoaded: true, 
      isSignedIn: true 
    })
    
    mockUseQuery.mockReturnValue(mockConvexUser)
  })

  it('should render children when under limit', () => {
    render(
      <UsageLimit feature="maxTeams" currentUsage={0}>
        <button>Create Team</button>
      </UsageLimit>
    )

    expect(screen.getByText('Create Team')).toBeInTheDocument()
  })

  it('should show warning when near limit', () => {
    render(
      <UsageLimit feature="maxProjects" currentUsage={2}>
        <button>Create Project</button>
      </UsageLimit>
    )

    expect(screen.getByText('Create Project')).toBeInTheDocument()
    expect(screen.getByText(/Usage Warning.*2\/3.*maxProjects used/)).toBeInTheDocument()
  })

  it('should show limit reached message when at limit', () => {
    render(
      <UsageLimit feature="maxTeams" currentUsage={1}>
        <button>Create Team</button>
      </UsageLimit>
    )

    expect(screen.getByText('Limit Reached')).toBeInTheDocument()
    expect(screen.getByText(/You've reached your.*limit \(1\/1\)/)).toBeInTheDocument()
    expect(screen.queryByText('Create Team')).not.toBeInTheDocument()
  })

  it('should render children for unlimited features', () => {
    mockUseQuery.mockReturnValue({
      ...mockConvexUser,
      subscriptionTier: 'enterprise'
    })

    render(
      <UsageLimit feature="maxTeams" currentUsage={100}>
        <button>Create Team</button>
      </UsageLimit>
    )

    expect(screen.getByText('Create Team')).toBeInTheDocument()
  })

  it('should not show warning when showWarning is false', () => {
    render(
      <UsageLimit feature="maxProjects" currentUsage={2} showWarning={false}>
        <button>Create Project</button>
      </UsageLimit>
    )

    expect(screen.getByText('Create Project')).toBeInTheDocument()
    expect(screen.queryByText(/Usage Warning/)).not.toBeInTheDocument()
  })
})
