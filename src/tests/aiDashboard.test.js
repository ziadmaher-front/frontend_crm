import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AIDashboard from '../components/dashboard/AIDashboard.jsx';

// Mock the useAdvancedAI hook
jest.mock('../hooks/useAdvancedAI.js', () => ({
  __esModule: true,
  default: () => ({
    isInitialized: true,
    isLoading: false,
    error: null,
    activeProcesses: [],
    insights: {
      leadScoring: { totalLeads: 150, averageScore: 75, highValueLeads: 45 },
      dealPrediction: { totalDeals: 89, predictedRevenue: 2500000, winRate: 0.68 },
      customerBehavior: { activeCustomers: 320, churnRisk: 0.12, engagementScore: 0.78 }
    },
    recommendations: [
      { id: 1, type: 'lead_prioritization', title: 'Focus on High-Value Leads', priority: 'high' },
      { id: 2, type: 'deal_optimization', title: 'Accelerate Q1 Pipeline', priority: 'medium' }
    ],
    predictions: {
      revenue: { nextQuarter: 3200000, confidence: 0.85 },
      churn: { riskCustomers: 38, preventionActions: 12 }
    },
    automations: [
      { id: 1, name: 'Lead Follow-up Automation', status: 'active', efficiency: 0.92 },
      { id: 2, name: 'Deal Stage Progression', status: 'active', efficiency: 0.87 }
    ],
    performance: {
      team: { efficiency: 0.89, collaboration: 0.82, productivity: 0.91 },
      individual: { topPerformers: 5, improvementAreas: 3 }
    },
    config: {
      enabledFeatures: {
        leadScoring: true,
        dealPrediction: true,
        customerBehavior: true,
        revenueOptimization: true,
        teamPerformance: true,
        automation: true
      }
    },
    initializeAI: jest.fn(),
    calculateLeadScore: jest.fn().mockResolvedValue(85),
    predictDealOutcome: jest.fn().mockResolvedValue({ probability: 0.75, confidence: 0.88 }),
    optimizeCustomerJourney: jest.fn().mockResolvedValue({ stage: 'consideration', actions: [] }),
    optimizeRevenue: jest.fn().mockResolvedValue({ recommendedPrice: 1200, expectedRevenue: 150000 }),
    optimizeTeamPerformance: jest.fn().mockResolvedValue({ efficiency: 0.92, recommendations: [] }),
    createAutomation: jest.fn().mockResolvedValue({ id: 'auto-123', status: 'created' }),
    getAIRecommendations: jest.fn().mockReturnValue([]),
    getAIAnalytics: jest.fn().mockReturnValue({ totalInsights: 25, accuracy: 0.89 })
  })
}));

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Brain: () => <div data-testid="brain-icon">Brain</div>,
  TrendingUp: () => <div data-testid="trending-up-icon">TrendingUp</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  DollarSign: () => <div data-testid="dollar-sign-icon">DollarSign</div>,
  Bot: () => <div data-testid="bot-icon">Bot</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  AlertCircle: () => <div data-testid="alert-circle-icon">AlertCircle</div>,
  CheckCircle: () => <div data-testid="check-circle-icon">CheckCircle</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Zap: () => <div data-testid="zap-icon">Zap</div>
}));

// Mock UI components
jest.mock('../components/ui/card', () => ({
  Card: ({ children, className }) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }) => <div data-testid="card-title">{children}</div>
}));

jest.mock('../components/ui/badge', () => ({
  Badge: ({ children, variant }) => <span data-testid="badge" data-variant={variant}>{children}</span>
}));

jest.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, variant, size }) => (
    <button onClick={onClick} data-testid="button" data-variant={variant} data-size={size}>
      {children}
    </button>
  )
}));

jest.mock('../components/ui/progress', () => ({
  Progress: ({ value }) => <div data-testid="progress" data-value={value}></div>
}));

jest.mock('../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange }) => (
    <input 
      type="checkbox" 
      checked={checked} 
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="switch"
    />
  )
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AI Dashboard Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should render AI Dashboard without crashing', () => {
    renderWithRouter(<AIDashboard />);
    expect(screen.getByText('AI Intelligence Dashboard')).toBeInTheDocument();
  });

  it('should display AI status and metrics', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Intelligence Dashboard')).toBeInTheDocument();
    });

    // Check for key metrics
    expect(screen.getByText('150')).toBeInTheDocument(); // Total leads
    expect(screen.getByText('89')).toBeInTheDocument(); // Total deals
    expect(screen.getByText('320')).toBeInTheDocument(); // Active customers
  });

  it('should display AI recommendations', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Recommendations')).toBeInTheDocument();
    });

    expect(screen.getByText('Focus on High-Value Leads')).toBeInTheDocument();
    expect(screen.getByText('Accelerate Q1 Pipeline')).toBeInTheDocument();
  });

  it('should display active automations', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Automations')).toBeInTheDocument();
    });

    expect(screen.getByText('Lead Follow-up Automation')).toBeInTheDocument();
    expect(screen.getByText('Deal Stage Progression')).toBeInTheDocument();
  });

  it('should display team performance metrics', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Team Performance')).toBeInTheDocument();
    });

    // Check for performance indicators
    const progressElements = screen.getAllByTestId('progress');
    expect(progressElements.length).toBeGreaterThan(0);
  });

  it('should handle AI feature configuration', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('AI Configuration')).toBeInTheDocument();
    });

    // Check for feature toggles
    const switches = screen.getAllByTestId('switch');
    expect(switches.length).toBeGreaterThan(0);
  });

  it('should display revenue predictions', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Revenue Predictions')).toBeInTheDocument();
    });

    expect(screen.getByText('$3,200,000')).toBeInTheDocument(); // Next quarter prediction
  });

  it('should show active processes', async () => {
    renderWithRouter(<AIDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active AI Processes')).toBeInTheDocument();
    });
  });

  it('should handle loading states', () => {
    // Mock loading state
    jest.doMock('../hooks/useAdvancedAI.js', () => ({
      __esModule: true,
      default: () => ({
        isInitialized: false,
        isLoading: true,
        error: null,
        activeProcesses: [],
        insights: {},
        recommendations: [],
        predictions: {},
        automations: [],
        performance: {},
        config: { enabledFeatures: {} }
      })
    }));

    renderWithRouter(<AIDashboard />);
    
    // Should show loading indicators
    expect(screen.getByText('AI Intelligence Dashboard')).toBeInTheDocument();
  });

  it('should handle error states', () => {
    // Mock error state
    jest.doMock('../hooks/useAdvancedAI.js', () => ({
      __esModule: true,
      default: () => ({
        isInitialized: false,
        isLoading: false,
        error: 'Failed to initialize AI engines',
        activeProcesses: [],
        insights: {},
        recommendations: [],
        predictions: {},
        automations: [],
        performance: {},
        config: { enabledFeatures: {} }
      })
    }));

    renderWithRouter(<AIDashboard />);
    
    expect(screen.getByText('AI Intelligence Dashboard')).toBeInTheDocument();
  });
});

describe('AI Dashboard Component Structure', () => {
  it('should have proper component hierarchy', () => {
    renderWithRouter(<AIDashboard />);
    
    // Check for main container
    expect(screen.getByTestId('card')).toBeInTheDocument();
    
    // Check for multiple cards (metrics, recommendations, etc.)
    const cards = screen.getAllByTestId('card');
    expect(cards.length).toBeGreaterThan(1);
  });

  it('should display proper icons for different sections', () => {
    renderWithRouter(<AIDashboard />);
    
    // Check for various icons
    expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('should have interactive elements', () => {
    renderWithRouter(<AIDashboard />);
    
    // Check for buttons and switches
    const buttons = screen.getAllByTestId('button');
    const switches = screen.getAllByTestId('switch');
    
    expect(buttons.length).toBeGreaterThan(0);
    expect(switches.length).toBeGreaterThan(0);
  });
});