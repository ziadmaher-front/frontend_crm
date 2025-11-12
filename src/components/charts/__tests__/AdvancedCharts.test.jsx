/**
 * Comprehensive Test Suite for Advanced Chart Components
 * Tests all chart components for rendering, interactions, and accessibility
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  HeatmapChart,
  FunnelChart,
  WaterfallChart,
  ScatterPlotMatrix,
  InteractiveDashboard
} from '../AdvancedCharts';
import {
  renderWithProviders,
  testDataGenerators,
  chartTestUtils,
  accessibilityTestUtils,
  performanceTestUtils,
  testSetup
} from '../../../utils/testUtils';

// Mock D3 and chart libraries
jest.mock('d3', () => ({
  select: jest.fn(() => ({
    selectAll: jest.fn(() => ({
      data: jest.fn(() => ({
        enter: jest.fn(() => ({
          append: jest.fn(() => ({
            attr: jest.fn(() => ({
              style: jest.fn(() => ({
                text: jest.fn()
              }))
            }))
          }))
        }))
      }))
    })),
    append: jest.fn(() => ({
      attr: jest.fn(() => ({
        style: jest.fn()
      }))
    })),
    attr: jest.fn(() => ({
      style: jest.fn()
    })),
    style: jest.fn(),
    text: jest.fn()
  })),
  scaleLinear: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn()
    })),
    range: jest.fn()
  })),
  scaleOrdinal: jest.fn(() => ({
    domain: jest.fn(() => ({
      range: jest.fn()
    })),
    range: jest.fn()
  })),
  schemeCategory10: ['#1f77b4', '#ff7f0e', '#2ca02c'],
  max: jest.fn(),
  min: jest.fn(),
  extent: jest.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

describe('Advanced Chart Components', () => {
  beforeEach(() => {
    testSetup.beforeEach();
    testSetup.mockResizeObserver();
  });

  afterEach(() => {
    testSetup.afterEach();
  });

  describe('HeatmapChart', () => {
    const mockHeatmapData = [
      { x: 'Jan', y: 'Product A', value: 10 },
      { x: 'Jan', y: 'Product B', value: 20 },
      { x: 'Feb', y: 'Product A', value: 15 },
      { x: 'Feb', y: 'Product B', value: 25 }
    ];

    test('renders heatmap chart with data', () => {
      renderWithProviders(
        <HeatmapChart 
          data={mockHeatmapData}
          width={400}
          height={300}
        />
      );

      expect(screen.getByTestId('heatmap-chart')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: /heatmap/i })).toBeInTheDocument();
    });

    test('handles empty data gracefully', () => {
      renderWithProviders(
        <HeatmapChart 
          data={[]}
          width={400}
          height={300}
        />
      );

      expect(screen.getByText(/no data available/i)).toBeInTheDocument();
    });

    test('is accessible with proper ARIA labels', () => {
      renderWithProviders(
        <HeatmapChart 
          data={mockHeatmapData}
          width={400}
          height={300}
          title="Sales Heatmap"
        />
      );

      const chart = screen.getByRole('img');
      expect(chart).toHaveAttribute('aria-label', expect.stringContaining('Sales Heatmap'));
    });

    test('supports keyboard navigation', async () => {
      renderWithProviders(
        <HeatmapChart 
          data={mockHeatmapData}
          width={400}
          height={300}
        />
      );

      const chart = screen.getByTestId('heatmap-chart');
      await accessibilityTestUtils.testKeyboardNavigation(chart);
    });

    test('shows tooltips on hover', async () => {
      renderWithProviders(
        <HeatmapChart 
          data={mockHeatmapData}
          width={400}
          height={300}
        />
      );

      const heatmapCells = screen.getAllByTestId(/heatmap-cell/);
      if (heatmapCells.length > 0) {
        await userEvent.hover(heatmapCells[0]);
        
        await waitFor(() => {
          expect(screen.getByRole('tooltip')).toBeInTheDocument();
        });
      }
    });

    test('is responsive to container size changes', () => {
      const { rerender } = renderWithProviders(
        <HeatmapChart 
          data={mockHeatmapData}
          width={400}
          height={300}
        />
      );

      // Change size
      rerender(
        <HeatmapChart 
          data={mockHeatmapData}
          width={800}
          height={600}
        />
      );

      const chart = screen.getByTestId('heatmap-chart');
      chartTestUtils.testChartResponsiveness(chart);
    });
  });

  describe('FunnelChart', () => {
    const mockFunnelData = [
      { stage: 'Leads', value: 1000, color: '#3B82F6' },
      { stage: 'Qualified', value: 500, color: '#10B981' },
      { stage: 'Proposal', value: 200, color: '#F59E0B' },
      { stage: 'Closed', value: 100, color: '#EF4444' }
    ];

    test('renders funnel chart with stages', () => {
      renderWithProviders(
        <FunnelChart 
          data={mockFunnelData}
          width={400}
          height={300}
        />
      );

      expect(screen.getByTestId('funnel-chart')).toBeInTheDocument();
      
      // Check all stages are rendered
      mockFunnelData.forEach(stage => {
        expect(screen.getByText(stage.stage)).toBeInTheDocument();
      });
    });

    test('calculates conversion rates correctly', () => {
      renderWithProviders(
        <FunnelChart 
          data={mockFunnelData}
          width={400}
          height={300}
          showConversionRates={true}
        />
      );

      // Should show conversion rates between stages
      expect(screen.getByText(/50%/)).toBeInTheDocument(); // Qualified to Leads
      expect(screen.getByText(/40%/)).toBeInTheDocument(); // Proposal to Qualified
    });

    test('handles click interactions', async () => {
      const onStageClick = jest.fn();
      
      renderWithProviders(
        <FunnelChart 
          data={mockFunnelData}
          width={400}
          height={300}
          onStageClick={onStageClick}
        />
      );

      const firstStage = screen.getByTestId('funnel-stage-0');
      await userEvent.click(firstStage);

      expect(onStageClick).toHaveBeenCalledWith(mockFunnelData[0], 0);
    });

    test('supports custom colors and styling', () => {
      renderWithProviders(
        <FunnelChart 
          data={mockFunnelData}
          width={400}
          height={300}
          colorScheme="custom"
        />
      );

      const stages = screen.getAllByTestId(/funnel-stage/);
      stages.forEach((stage, index) => {
        expect(stage).toHaveStyle({
          backgroundColor: mockFunnelData[index].color
        });
      });
    });
  });

  describe('WaterfallChart', () => {
    const mockWaterfallData = [
      { category: 'Starting Revenue', value: 100000, type: 'start' },
      { category: 'New Sales', value: 25000, type: 'positive' },
      { category: 'Churn', value: -5000, type: 'negative' },
      { category: 'Upsells', value: 15000, type: 'positive' },
      { category: 'Ending Revenue', value: 135000, type: 'end' }
    ];

    test('renders waterfall chart with correct flow', () => {
      renderWithProviders(
        <WaterfallChart 
          data={mockWaterfallData}
          width={500}
          height={400}
        />
      );

      expect(screen.getByTestId('waterfall-chart')).toBeInTheDocument();
      
      // Check all categories are rendered
      mockWaterfallData.forEach(item => {
        expect(screen.getByText(item.category)).toBeInTheDocument();
      });
    });

    test('displays correct values and calculations', () => {
      renderWithProviders(
        <WaterfallChart 
          data={mockWaterfallData}
          width={500}
          height={400}
        />
      );

      // Check values are displayed
      expect(screen.getByText('$100,000')).toBeInTheDocument();
      expect(screen.getByText('$25,000')).toBeInTheDocument();
      expect(screen.getByText('-$5,000')).toBeInTheDocument();
      expect(screen.getByText('$135,000')).toBeInTheDocument();
    });

    test('shows connecting lines between bars', () => {
      renderWithProviders(
        <WaterfallChart 
          data={mockWaterfallData}
          width={500}
          height={400}
          showConnectors={true}
        />
      );

      const connectors = screen.getAllByTestId(/waterfall-connector/);
      expect(connectors.length).toBeGreaterThan(0);
    });

    test('handles different value types correctly', () => {
      renderWithProviders(
        <WaterfallChart 
          data={mockWaterfallData}
          width={500}
          height={400}
        />
      );

      // Positive values should have different styling than negative
      const positiveBars = screen.getAllByTestId(/positive-bar/);
      const negativeBars = screen.getAllByTestId(/negative-bar/);
      
      expect(positiveBars.length).toBeGreaterThan(0);
      expect(negativeBars.length).toBeGreaterThan(0);
    });
  });

  describe('ScatterPlotMatrix', () => {
    const mockScatterData = [
      { revenue: 10000, deals: 5, leads: 20, contacts: 15 },
      { revenue: 15000, deals: 8, leads: 30, contacts: 25 },
      { revenue: 20000, deals: 12, leads: 40, contacts: 35 },
      { revenue: 25000, deals: 15, leads: 50, contacts: 45 }
    ];

    test('renders scatter plot matrix with multiple dimensions', () => {
      renderWithProviders(
        <ScatterPlotMatrix 
          data={mockScatterData}
          dimensions={['revenue', 'deals', 'leads', 'contacts']}
          width={600}
          height={600}
        />
      );

      expect(screen.getByTestId('scatter-plot-matrix')).toBeInTheDocument();
      
      // Should render multiple scatter plots
      const scatterPlots = screen.getAllByTestId(/scatter-plot-/);
      expect(scatterPlots.length).toBeGreaterThan(1);
    });

    test('shows correlation coefficients', () => {
      renderWithProviders(
        <ScatterPlotMatrix 
          data={mockScatterData}
          dimensions={['revenue', 'deals', 'leads', 'contacts']}
          width={600}
          height={600}
          showCorrelations={true}
        />
      );

      // Should display correlation values
      const correlations = screen.getAllByTestId(/correlation-/);
      expect(correlations.length).toBeGreaterThan(0);
    });

    test('supports brushing and linking', async () => {
      const onBrush = jest.fn();
      
      renderWithProviders(
        <ScatterPlotMatrix 
          data={mockScatterData}
          dimensions={['revenue', 'deals', 'leads', 'contacts']}
          width={600}
          height={600}
          onBrush={onBrush}
        />
      );

      // Simulate brush selection
      const firstPlot = screen.getByTestId('scatter-plot-0');
      fireEvent.mouseDown(firstPlot, { clientX: 100, clientY: 100 });
      fireEvent.mouseMove(firstPlot, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(firstPlot, { clientX: 200, clientY: 200 });

      expect(onBrush).toHaveBeenCalled();
    });

    test('handles large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        revenue: Math.random() * 50000,
        deals: Math.random() * 50,
        leads: Math.random() * 100,
        contacts: Math.random() * 80
      }));

      const renderTime = await performanceTestUtils.measureRenderTime(() => {
        renderWithProviders(
          <ScatterPlotMatrix 
            data={largeDataset}
            dimensions={['revenue', 'deals', 'leads', 'contacts']}
            width={600}
            height={600}
          />
        );
      });

      // Should render large datasets efficiently
      expect(renderTime).toBeLessThan(3000); // 3 seconds
    });
  });

  describe('InteractiveDashboard', () => {
    const mockDashboardData = {
      metrics: testDataGenerators.generateDashboardMetrics(),
      sales: testDataGenerators.generateSalesData(),
      leads: testDataGenerators.generateLeadData(),
      team: testDataGenerators.generateTeamData()
    };

    test('renders interactive dashboard with all components', () => {
      renderWithProviders(
        <InteractiveDashboard 
          data={mockDashboardData}
          width={1200}
          height={800}
        />
      );

      expect(screen.getByTestId('interactive-dashboard')).toBeInTheDocument();
      
      // Check main sections
      expect(screen.getByText(/metrics/i)).toBeInTheDocument();
      expect(screen.getByText(/sales/i)).toBeInTheDocument();
      expect(screen.getByText(/leads/i)).toBeInTheDocument();
      expect(screen.getByText(/team/i)).toBeInTheDocument();
    });

    test('supports filtering and cross-filtering', async () => {
      const onFilter = jest.fn();
      
      renderWithProviders(
        <InteractiveDashboard 
          data={mockDashboardData}
          width={1200}
          height={800}
          onFilter={onFilter}
        />
      );

      // Test filter interaction
      const filterButton = screen.getByTestId('dashboard-filter');
      await userEvent.click(filterButton);

      expect(onFilter).toHaveBeenCalled();
    });

    test('updates charts when data changes', () => {
      const { rerender } = renderWithProviders(
        <InteractiveDashboard 
          data={mockDashboardData}
          width={1200}
          height={800}
        />
      );

      // Update data
      const updatedData = {
        ...mockDashboardData,
        metrics: { ...mockDashboardData.metrics, totalRevenue: 200000 }
      };

      rerender(
        <InteractiveDashboard 
          data={updatedData}
          width={1200}
          height={800}
        />
      );

      // Should reflect updated data
      expect(screen.getByText('$200,000')).toBeInTheDocument();
    });

    test('provides drill-down capabilities', async () => {
      const onDrillDown = jest.fn();
      
      renderWithProviders(
        <InteractiveDashboard 
          data={mockDashboardData}
          width={1200}
          height={800}
          onDrillDown={onDrillDown}
        />
      );

      // Test drill-down interaction
      const drillDownElement = screen.getByTestId('drill-down-trigger');
      await userEvent.click(drillDownElement);

      expect(onDrillDown).toHaveBeenCalled();
    });

    test('is fully responsive', () => {
      const { rerender } = renderWithProviders(
        <InteractiveDashboard 
          data={mockDashboardData}
          width={1200}
          height={800}
        />
      );

      // Test mobile size
      rerender(
        <InteractiveDashboard 
          data={mockDashboardData}
          width={375}
          height={667}
        />
      );

      const dashboard = screen.getByTestId('interactive-dashboard');
      expect(dashboard).toHaveClass('responsive-dashboard');
    });
  });

  describe('Common Chart Features', () => {
    test('all charts support theming', () => {
      const charts = [
        <HeatmapChart data={[]} theme="dark" />,
        <FunnelChart data={[]} theme="dark" />,
        <WaterfallChart data={[]} theme="dark" />,
        <ScatterPlotMatrix data={[]} dimensions={[]} theme="dark" />,
        <InteractiveDashboard data={{}} theme="dark" />
      ];

      charts.forEach((chart, index) => {
        const { unmount } = renderWithProviders(chart);
        
        const chartElement = screen.getByTestId(new RegExp('chart|dashboard'));
        expect(chartElement).toHaveClass('theme-dark');
        
        unmount();
      });
    });

    test('all charts handle loading states', () => {
      const charts = [
        <HeatmapChart data={[]} loading={true} />,
        <FunnelChart data={[]} loading={true} />,
        <WaterfallChart data={[]} loading={true} />,
        <ScatterPlotMatrix data={[]} dimensions={[]} loading={true} />,
        <InteractiveDashboard data={{}} loading={true} />
      ];

      charts.forEach((chart, index) => {
        const { unmount } = renderWithProviders(chart);
        
        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
        
        unmount();
      });
    });

    test('all charts support export functionality', async () => {
      const onExport = jest.fn();
      
      const charts = [
        <HeatmapChart data={[]} onExport={onExport} />,
        <FunnelChart data={[]} onExport={onExport} />,
        <WaterfallChart data={[]} onExport={onExport} />,
        <ScatterPlotMatrix data={[]} dimensions={[]} onExport={onExport} />,
        <InteractiveDashboard data={{}} onExport={onExport} />
      ];

      for (const chart of charts) {
        const { unmount } = renderWithProviders(chart);
        
        const exportButton = screen.getByLabelText(/export/i);
        await userEvent.click(exportButton);
        
        expect(onExport).toHaveBeenCalled();
        
        unmount();
        jest.clearAllMocks();
      }
    });
  });
});