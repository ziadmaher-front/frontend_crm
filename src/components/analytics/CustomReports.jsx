// Custom Reports Builder with Drag & Drop Interface
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import {
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  FunnelIcon,
  ChartBarIcon,
  TableCellsIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { DateRangePicker } from '../ui/DateRangePicker';
import { useAnalytics } from '../../hooks/useAnalytics';
import { useNotifications } from '../../hooks/useNotifications';
import { useLocalStorage } from '../../hooks/useLocalStorage';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Report Builder Engine
class ReportBuilder {
  constructor() {
    this.availableFields = [
      // Lead fields
      { id: 'leads_count', label: 'Lead Count', category: 'Leads', type: 'number' },
      { id: 'leads_source', label: 'Lead Source', category: 'Leads', type: 'string' },
      { id: 'leads_status', label: 'Lead Status', category: 'Leads', type: 'string' },
      { id: 'leads_score', label: 'Lead Score', category: 'Leads', type: 'number' },
      { id: 'leads_created_date', label: 'Lead Created Date', category: 'Leads', type: 'date' },
      
      // Deal fields
      { id: 'deals_count', label: 'Deal Count', category: 'Deals', type: 'number' },
      { id: 'deals_value', label: 'Deal Value', category: 'Deals', type: 'currency' },
      { id: 'deals_stage', label: 'Deal Stage', category: 'Deals', type: 'string' },
      { id: 'deals_probability', label: 'Deal Probability', category: 'Deals', type: 'percentage' },
      { id: 'deals_close_date', label: 'Deal Close Date', category: 'Deals', type: 'date' },
      
      // Contact fields
      { id: 'contacts_count', label: 'Contact Count', category: 'Contacts', type: 'number' },
      { id: 'contacts_company', label: 'Company', category: 'Contacts', type: 'string' },
      { id: 'contacts_industry', label: 'Industry', category: 'Contacts', type: 'string' },
      { id: 'contacts_created_date', label: 'Contact Created Date', category: 'Contacts', type: 'date' },
      
      // Activity fields
      { id: 'activities_count', label: 'Activity Count', category: 'Activities', type: 'number' },
      { id: 'activities_type', label: 'Activity Type', category: 'Activities', type: 'string' },
      { id: 'activities_date', label: 'Activity Date', category: 'Activities', type: 'date' },
      
      // Revenue fields
      { id: 'revenue_total', label: 'Total Revenue', category: 'Revenue', type: 'currency' },
      { id: 'revenue_monthly', label: 'Monthly Revenue', category: 'Revenue', type: 'currency' },
      { id: 'revenue_quarterly', label: 'Quarterly Revenue', category: 'Revenue', type: 'currency' },
    ];

    this.chartTypes = [
      { id: 'line', label: 'Line Chart', icon: PresentationChartLineIcon },
      { id: 'bar', label: 'Bar Chart', icon: ChartBarIcon },
      { id: 'doughnut', label: 'Doughnut Chart', icon: ChartBarIcon },
      { id: 'pie', label: 'Pie Chart', icon: ChartBarIcon },
      { id: 'radar', label: 'Radar Chart', icon: ChartBarIcon },
      { id: 'table', label: 'Data Table', icon: TableCellsIcon },
    ];

    this.aggregationTypes = [
      { id: 'sum', label: 'Sum' },
      { id: 'avg', label: 'Average' },
      { id: 'count', label: 'Count' },
      { id: 'min', label: 'Minimum' },
      { id: 'max', label: 'Maximum' },
    ];
  }

  createReport(config) {
    return {
      id: Date.now().toString(),
      name: config.name || 'Untitled Report',
      description: config.description || '',
      chartType: config.chartType || 'bar',
      fields: config.fields || [],
      filters: config.filters || [],
      groupBy: config.groupBy || null,
      aggregation: config.aggregation || 'sum',
      dateRange: config.dateRange || { start: null, end: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  generateChartData(report, data) {
    if (!data || !report.fields.length) return null;

    const { chartType, fields, groupBy, aggregation } = report;

    // Process data based on report configuration
    const processedData = this.processData(data, report);

    switch (chartType) {
      case 'line':
      case 'bar':
        return this.generateLineBarData(processedData, fields);
      case 'doughnut':
      case 'pie':
        return this.generatePieData(processedData, fields);
      case 'radar':
        return this.generateRadarData(processedData, fields);
      case 'table':
        return this.generateTableData(processedData, fields);
      default:
        return null;
    }
  }

  processData(data, report) {
    let processed = [...data];

    // Apply filters
    report.filters.forEach(filter => {
      processed = processed.filter(item => {
        const value = item[filter.field];
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return value && value.toString().toLowerCase().includes(filter.value.toLowerCase());
          case 'greater_than':
            return Number(value) > Number(filter.value);
          case 'less_than':
            return Number(value) < Number(filter.value);
          case 'between':
            return Number(value) >= Number(filter.value[0]) && Number(value) <= Number(filter.value[1]);
          default:
            return true;
        }
      });
    });

    // Apply date range filter
    if (report.dateRange.start && report.dateRange.end) {
      processed = processed.filter(item => {
        const itemDate = new Date(item.date || item.created_at);
        return itemDate >= new Date(report.dateRange.start) && itemDate <= new Date(report.dateRange.end);
      });
    }

    // Group and aggregate data
    if (report.groupBy) {
      const grouped = processed.reduce((acc, item) => {
        const key = item[report.groupBy];
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
      }, {});

      processed = Object.entries(grouped).map(([key, items]) => ({
        [report.groupBy]: key,
        ...this.aggregateItems(items, report.fields, report.aggregation),
      }));
    }

    return processed;
  }

  aggregateItems(items, fields, aggregationType) {
    const result = {};

    fields.forEach(field => {
      const values = items.map(item => Number(item[field.id]) || 0);
      
      switch (aggregationType) {
        case 'sum':
          result[field.id] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          result[field.id] = values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'count':
          result[field.id] = values.length;
          break;
        case 'min':
          result[field.id] = Math.min(...values);
          break;
        case 'max':
          result[field.id] = Math.max(...values);
          break;
        default:
          result[field.id] = values.reduce((sum, val) => sum + val, 0);
      }
    });

    return result;
  }

  generateLineBarData(data, fields) {
    const labels = data.map((item, index) => item.label || `Item ${index + 1}`);
    const datasets = fields.map((field, index) => {
      const colors = [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(139, 92, 246)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
      ];

      return {
        label: field.label,
        data: data.map(item => item[field.id] || 0),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        fill: false,
      };
    });

    return { labels, datasets };
  }

  generatePieData(data, fields) {
    if (fields.length === 0) return null;

    const field = fields[0];
    const labels = data.map(item => item.label || 'Unknown');
    const dataValues = data.map(item => item[field.id] || 0);

    const colors = [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(139, 92, 246)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
      'rgb(34, 197, 94)',
      'rgb(168, 85, 247)',
      'rgb(251, 191, 36)',
    ];

    return {
      labels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    };
  }

  generateRadarData(data, fields) {
    const labels = fields.map(field => field.label);
    const datasets = data.map((item, index) => {
      const colors = [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(139, 92, 246)',
      ];

      return {
        label: item.label || `Dataset ${index + 1}`,
        data: fields.map(field => item[field.id] || 0),
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length] + '20',
        pointBackgroundColor: colors[index % colors.length],
      };
    });

    return { labels, datasets };
  }

  generateTableData(data, fields) {
    return {
      columns: fields.map(field => ({
        id: field.id,
        label: field.label,
        type: field.type,
      })),
      rows: data,
    };
  }
}

const CustomReports = ({ className = '' }) => {
  const [reports, setReports] = useLocalStorage('custom_reports', []);
  const [activeReport, setActiveReport] = useState(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedFields, setSelectedFields] = useState([]);
  const [reportConfig, setReportConfig] = useState({
    name: '',
    description: '',
    chartType: 'bar',
    groupBy: null,
    aggregation: 'sum',
    dateRange: { start: null, end: null },
    filters: [],
  });
  const [activeTab, setActiveTab] = useState('reports');
  const [reportBuilder] = useState(() => new ReportBuilder());

  const { data: analyticsData, isLoading } = useAnalytics();
  const { addNotification } = useNotifications();

  // Sample data for demonstration
  const sampleData = useMemo(() => [
    { id: 1, leads_count: 45, deals_value: 15000, revenue_total: 12000, date: '2024-01-01', label: 'January' },
    { id: 2, leads_count: 52, deals_value: 18000, revenue_total: 15000, date: '2024-02-01', label: 'February' },
    { id: 3, leads_count: 38, deals_value: 22000, revenue_total: 18000, date: '2024-03-01', label: 'March' },
    { id: 4, leads_count: 61, deals_value: 25000, revenue_total: 22000, date: '2024-04-01', label: 'April' },
    { id: 5, leads_count: 47, deals_value: 19000, revenue_total: 16000, date: '2024-05-01', label: 'May' },
  ], []);

  // Create new report
  const createReport = useCallback(() => {
    if (!reportConfig.name.trim()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter a report name',
      });
      return;
    }

    if (selectedFields.length === 0) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select at least one field',
      });
      return;
    }

    const newReport = reportBuilder.createReport({
      ...reportConfig,
      fields: selectedFields,
    });

    setReports(prev => [...prev, newReport]);
    setActiveReport(newReport);
    setIsBuilderOpen(false);
    resetBuilder();

    addNotification({
      type: 'success',
      title: 'Report Created',
      message: `Report "${newReport.name}" has been created successfully`,
    });
  }, [reportConfig, selectedFields, reportBuilder, setReports, addNotification]);

  // Update existing report
  const updateReport = useCallback((reportId, updates) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, ...updates, updatedAt: new Date().toISOString() }
        : report
    ));

    if (activeReport?.id === reportId) {
      setActiveReport(prev => ({ ...prev, ...updates }));
    }

    addNotification({
      type: 'success',
      title: 'Report Updated',
      message: 'Report has been updated successfully',
    });
  }, [setReports, activeReport, addNotification]);

  // Delete report
  const deleteReport = useCallback((reportId) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    
    if (activeReport?.id === reportId) {
      setActiveReport(null);
    }

    addNotification({
      type: 'success',
      title: 'Report Deleted',
      message: 'Report has been deleted successfully',
    });
  }, [setReports, activeReport, addNotification]);

  // Duplicate report
  const duplicateReport = useCallback((report) => {
    const duplicated = {
      ...report,
      id: Date.now().toString(),
      name: `${report.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setReports(prev => [...prev, duplicated]);

    addNotification({
      type: 'success',
      title: 'Report Duplicated',
      message: `Report "${duplicated.name}" has been created`,
    });
  }, [setReports, addNotification]);

  // Reset builder
  const resetBuilder = useCallback(() => {
    setReportConfig({
      name: '',
      description: '',
      chartType: 'bar',
      groupBy: null,
      aggregation: 'sum',
      dateRange: { start: null, end: null },
      filters: [],
    });
    setSelectedFields([]);
  }, []);

  // Handle field drag and drop
  const handleDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'available-fields' && destination.droppableId === 'selected-fields') {
      const field = reportBuilder.availableFields[source.index];
      if (!selectedFields.find(f => f.id === field.id)) {
        setSelectedFields(prev => [...prev, field]);
      }
    } else if (source.droppableId === 'selected-fields' && destination.droppableId === 'selected-fields') {
      const newFields = Array.from(selectedFields);
      const [reorderedField] = newFields.splice(source.index, 1);
      newFields.splice(destination.index, 0, reorderedField);
      setSelectedFields(newFields);
    } else if (source.droppableId === 'selected-fields' && destination.droppableId === 'available-fields') {
      setSelectedFields(prev => prev.filter((_, index) => index !== source.index));
    }
  }, [selectedFields, reportBuilder.availableFields]);

  // Generate chart data for active report
  const chartData = useMemo(() => {
    if (!activeReport) return null;
    return reportBuilder.generateChartData(activeReport, sampleData);
  }, [activeReport, reportBuilder, sampleData]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeReport?.name || 'Custom Report',
      },
    },
  };

  // Render chart based on type
  const renderChart = useCallback(() => {
    if (!chartData || !activeReport) return null;

    const { chartType } = activeReport;

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'radar':
        return <Radar data={chartData} options={chartOptions} />;
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {chartData.columns.map(column => (
                    <th key={column.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {chartData.rows.map((row, index) => (
                  <tr key={index}>
                    {chartData.columns.map(column => (
                      <td key={column.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row[column.id]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  }, [chartData, activeReport, chartOptions]);

  const tabs = [
    { id: 'reports', label: 'My Reports' },
    { id: 'builder', label: 'Report Builder' },
    { id: 'templates', label: 'Templates' },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Custom Reports</h2>
        <Button
          onClick={() => {
            resetBuilder();
            setIsBuilderOpen(true);
            setActiveTab('builder');
          }}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Report</span>
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Content */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Reports</h3>
              <div className="space-y-3">
                {reports.map(report => (
                  <div
                    key={report.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      activeReport?.id === report.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveReport(report)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.name}</h4>
                        <p className="text-sm text-gray-500">{report.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="secondary" size="sm">
                            {report.chartType}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(report.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateReport(report);
                          }}
                        >
                          <DocumentDuplicateIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteReport(report.id);
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {reports.length === 0 && (
                  <div className="text-center py-8">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reports created yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Create your first custom report to get started
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Report Viewer */}
          <div className="lg:col-span-2">
            {activeReport ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{activeReport.name}</h3>
                    <p className="text-sm text-gray-500">{activeReport.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="secondary" size="sm">
                      <ShareIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="sm">
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-96">
                  {renderChart()}
                </div>

                {/* Report Info */}
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Chart Type:</span>
                    <span className="ml-2 text-gray-600">{activeReport.chartType}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Fields:</span>
                    <span className="ml-2 text-gray-600">{activeReport.fields.length}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(activeReport.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(activeReport.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-12">
                  <EyeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a report to view</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'builder' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Available Fields */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Fields</h3>
              <Droppable droppableId="available-fields">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                  >
                    {reportBuilder.availableFields.map((field, index) => (
                      <Draggable key={field.id} draggableId={field.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg border cursor-move transition-colors ${
                              snapshot.isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{field.label}</p>
                                <p className="text-sm text-gray-500">{field.category}</p>
                              </div>
                              <Badge variant="secondary" size="sm">
                                {field.type}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Card>

            {/* Report Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Configuration</h3>
              <div className="space-y-4">
                <Input
                  label="Report Name"
                  value={reportConfig.name}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />

                <Input
                  label="Description"
                  value={reportConfig.description}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description (optional)"
                />

                <Select
                  label="Chart Type"
                  value={reportConfig.chartType}
                  onChange={(value) => setReportConfig(prev => ({ ...prev, chartType: value }))}
                  options={reportBuilder.chartTypes.map(type => ({
                    value: type.id,
                    label: type.label,
                  }))}
                />

                <Select
                  label="Aggregation"
                  value={reportConfig.aggregation}
                  onChange={(value) => setReportConfig(prev => ({ ...prev, aggregation: value }))}
                  options={reportBuilder.aggregationTypes.map(type => ({
                    value: type.id,
                    label: type.label,
                  }))}
                />

                <DateRangePicker
                  label="Date Range"
                  startDate={reportConfig.dateRange.start}
                  endDate={reportConfig.dateRange.end}
                  onChange={(start, end) => setReportConfig(prev => ({
                    ...prev,
                    dateRange: { start, end }
                  }))}
                />

                <div className="flex space-x-2">
                  <Button
                    onClick={createReport}
                    className="flex-1"
                    disabled={!reportConfig.name.trim() || selectedFields.length === 0}
                  >
                    Create Report
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={resetBuilder}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Card>

            {/* Selected Fields */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Fields</h3>
              <Droppable droppableId="selected-fields">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2 min-h-[200px]"
                  >
                    {selectedFields.map((field, index) => (
                      <Draggable key={field.id} draggableId={`selected-${field.id}`} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 rounded-lg border cursor-move transition-colors ${
                              snapshot.isDragging
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{field.label}</p>
                                <p className="text-sm text-gray-500">{field.category}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFields(prev => 
                                  prev.filter(f => f.id !== field.id)
                                )}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {selectedFields.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">Drag fields here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </Card>
          </div>
        </DragDropContext>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Report Templates */}
          {[
            {
              name: 'Sales Performance',
              description: 'Track sales metrics and performance indicators',
              fields: ['deals_value', 'deals_count', 'revenue_total'],
              chartType: 'bar',
            },
            {
              name: 'Lead Analysis',
              description: 'Analyze lead sources and conversion rates',
              fields: ['leads_count', 'leads_score', 'leads_source'],
              chartType: 'pie',
            },
            {
              name: 'Revenue Trends',
              description: 'Monitor revenue trends over time',
              fields: ['revenue_total', 'revenue_monthly'],
              chartType: 'line',
            },
          ].map((template, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{template.description}</p>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm font-medium text-gray-700">Includes:</p>
                <div className="flex flex-wrap gap-1">
                  {template.fields.map(fieldId => {
                    const field = reportBuilder.availableFields.find(f => f.id === fieldId);
                    return field ? (
                      <Badge key={fieldId} variant="secondary" size="sm">
                        {field.label}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  const templateFields = template.fields
                    .map(fieldId => reportBuilder.availableFields.find(f => f.id === fieldId))
                    .filter(Boolean);
                  
                  setReportConfig(prev => ({
                    ...prev,
                    name: template.name,
                    description: template.description,
                    chartType: template.chartType,
                  }));
                  setSelectedFields(templateFields);
                  setActiveTab('builder');
                }}
              >
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomReports;