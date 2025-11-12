import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  DocumentChartBarIcon,
  CodeBracketIcon,
  PhotoIcon,
  FilmIcon,
  MusicalNoteIcon,
  ArchiveBoxIcon,
  FolderIcon,
  CloudArrowDownIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShareIcon,
  PrinterIcon,
  EnvelopeIcon,
  LinkIcon,
  ServerIcon,
  DatabaseIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  BoltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

// Data Export/Import Engine
class DataExportImportEngine {
  constructor() {
    this.exportFormats = new Map();
    this.importFormats = new Map();
    this.exportHistory = [];
    this.importHistory = [];
    this.templates = new Map();
    this.scheduledExports = [];
    this.exportQueue = [];
    this.importQueue = [];
    this.processors = new Map();
    this.validators = new Map();
    this.transformers = new Map();
    
    this.initializeFormats();
    this.initializeProcessors();
    this.initializeValidators();
    this.initializeTransformers();
  }

  // Initialize supported formats
  initializeFormats() {
    // Export formats
    this.exportFormats.set('csv', {
      name: 'CSV',
      extension: 'csv',
      mimeType: 'text/csv',
      icon: TableCellsIcon,
      description: 'Comma-separated values for spreadsheet applications',
      supports: ['customers', 'deals', 'tasks', 'contacts', 'reports'],
      options: {
        delimiter: ',',
        includeHeaders: true,
        encoding: 'utf-8',
        dateFormat: 'YYYY-MM-DD'
      }
    });

    this.exportFormats.set('excel', {
      name: 'Excel',
      extension: 'xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      icon: DocumentChartBarIcon,
      description: 'Microsoft Excel workbook with multiple sheets',
      supports: ['customers', 'deals', 'tasks', 'contacts', 'reports', 'analytics'],
      options: {
        includeCharts: true,
        includeFormatting: true,
        multipleSheets: true,
        password: null
      }
    });

    this.exportFormats.set('json', {
      name: 'JSON',
      extension: 'json',
      mimeType: 'application/json',
      icon: CodeBracketIcon,
      description: 'JavaScript Object Notation for API integration',
      supports: ['customers', 'deals', 'tasks', 'contacts', 'reports', 'settings'],
      options: {
        pretty: true,
        includeMetadata: true,
        includeRelations: true,
        compression: false
      }
    });

    this.exportFormats.set('pdf', {
      name: 'PDF',
      extension: 'pdf',
      mimeType: 'application/pdf',
      icon: DocumentTextIcon,
      description: 'Portable Document Format for reports and presentations',
      supports: ['reports', 'analytics', 'invoices', 'statements'],
      options: {
        pageSize: 'A4',
        orientation: 'portrait',
        includeCharts: true,
        includeImages: true,
        watermark: null,
        password: null
      }
    });

    this.exportFormats.set('xml', {
      name: 'XML',
      extension: 'xml',
      mimeType: 'application/xml',
      icon: CodeBracketIcon,
      description: 'Extensible Markup Language for data exchange',
      supports: ['customers', 'deals', 'tasks', 'contacts', 'settings'],
      options: {
        pretty: true,
        includeSchema: true,
        encoding: 'utf-8',
        rootElement: 'data'
      }
    });

    // Import formats (subset of export formats)
    this.importFormats.set('csv', this.exportFormats.get('csv'));
    this.importFormats.set('excel', this.exportFormats.get('excel'));
    this.importFormats.set('json', this.exportFormats.get('json'));
    this.importFormats.set('xml', this.exportFormats.get('xml'));
  }

  // Initialize data processors
  initializeProcessors() {
    // CSV Processor
    this.processors.set('csv', {
      export: async (data, options) => {
        const { delimiter = ',', includeHeaders = true, encoding = 'utf-8' } = options;
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('No data to export');
        }

        const headers = Object.keys(data[0]);
        let csv = '';

        if (includeHeaders) {
          csv += headers.join(delimiter) + '\n';
        }

        data.forEach(row => {
          const values = headers.map(header => {
            let value = row[header] || '';
            // Escape quotes and wrap in quotes if contains delimiter
            if (typeof value === 'string' && (value.includes(delimiter) || value.includes('"') || value.includes('\n'))) {
              value = '"' + value.replace(/"/g, '""') + '"';
            }
            return value;
          });
          csv += values.join(delimiter) + '\n';
        });

        return new Blob([csv], { type: 'text/csv;charset=' + encoding });
      },

      import: async (file, options) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const csv = e.target.result;
              const lines = csv.split('\n').filter(line => line.trim());
              const { delimiter = ',', hasHeaders = true } = options;
              
              if (lines.length === 0) {
                reject(new Error('Empty file'));
                return;
              }

              let headers;
              let dataStartIndex = 0;

              if (hasHeaders) {
                headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
                dataStartIndex = 1;
              } else {
                headers = lines[0].split(delimiter).map((_, i) => `column_${i + 1}`);
              }

              const data = lines.slice(dataStartIndex).map(line => {
                const values = this.parseCSVLine(line, delimiter);
                const row = {};
                headers.forEach((header, index) => {
                  row[header] = values[index] || '';
                });
                return row;
              });

              resolve({ data, headers, totalRows: data.length });
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
    });

    // JSON Processor
    this.processors.set('json', {
      export: async (data, options) => {
        const { pretty = true, includeMetadata = true } = options;
        
        const exportData = {
          ...(includeMetadata && {
            metadata: {
              exportedAt: new Date().toISOString(),
              version: '1.0',
              totalRecords: Array.isArray(data) ? data.length : 1
            }
          }),
          data
        };

        const jsonString = pretty ? JSON.stringify(exportData, null, 2) : JSON.stringify(exportData);
        return new Blob([jsonString], { type: 'application/json' });
      },

      import: async (file, options) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const jsonData = JSON.parse(e.target.result);
              const data = jsonData.data || jsonData;
              const metadata = jsonData.metadata || {};
              
              resolve({ 
                data: Array.isArray(data) ? data : [data], 
                metadata,
                totalRows: Array.isArray(data) ? data.length : 1
              });
            } catch (error) {
              reject(new Error('Invalid JSON format'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsText(file);
        });
      }
    });

    // Excel Processor (simplified - would use a library like SheetJS in production)
    this.processors.set('excel', {
      export: async (data, options) => {
        // This would use a library like SheetJS (xlsx) in production
        // For demo, we'll create a CSV-like format
        const csvProcessor = this.processors.get('csv');
        return csvProcessor.export(data, { ...options, delimiter: '\t' });
      },

      import: async (file, options) => {
        // This would use a library like SheetJS (xlsx) in production
        // For demo, we'll treat as CSV
        const csvProcessor = this.processors.get('csv');
        return csvProcessor.import(file, { ...options, delimiter: '\t' });
      }
    });

    // PDF Processor (simplified - would use a library like jsPDF in production)
    this.processors.set('pdf', {
      export: async (data, options) => {
        // This would use a library like jsPDF in production
        // For demo, we'll create a text representation
        const text = JSON.stringify(data, null, 2);
        return new Blob([text], { type: 'application/pdf' });
      }
    });
  }

  // Initialize validators
  initializeValidators() {
    this.validators.set('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    this.validators.set('phone', (value) => {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
    });

    this.validators.set('date', (value) => {
      return !isNaN(Date.parse(value));
    });

    this.validators.set('number', (value) => {
      return !isNaN(parseFloat(value)) && isFinite(value);
    });

    this.validators.set('required', (value) => {
      return value !== null && value !== undefined && value !== '';
    });
  }

  // Initialize transformers
  initializeTransformers() {
    this.transformers.set('uppercase', (value) => {
      return typeof value === 'string' ? value.toUpperCase() : value;
    });

    this.transformers.set('lowercase', (value) => {
      return typeof value === 'string' ? value.toLowerCase() : value;
    });

    this.transformers.set('trim', (value) => {
      return typeof value === 'string' ? value.trim() : value;
    });

    this.transformers.set('date_format', (value, format = 'YYYY-MM-DD') => {
      const date = new Date(value);
      if (isNaN(date.getTime())) return value;
      
      // Simple date formatting (would use a library like moment.js in production)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day);
    });

    this.transformers.set('currency', (value) => {
      const num = parseFloat(value);
      return isNaN(num) ? value : `$${num.toFixed(2)}`;
    });
  }

  // Parse CSV line handling quoted values
  parseCSVLine(line, delimiter = ',') {
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  // Export data
  async exportData(dataType, format, options = {}) {
    try {
      const formatConfig = this.exportFormats.get(format);
      if (!formatConfig) {
        throw new Error(`Unsupported export format: ${format}`);
      }

      if (!formatConfig.supports.includes(dataType)) {
        throw new Error(`Format ${format} does not support ${dataType} data`);
      }

      // Get data (this would integrate with your actual data source)
      const data = await this.fetchData(dataType, options.filters);
      
      // Apply transformations
      const transformedData = this.applyTransformations(data, options.transformations);
      
      // Process export
      const processor = this.processors.get(format);
      if (!processor || !processor.export) {
        throw new Error(`No export processor for format: ${format}`);
      }

      const blob = await processor.export(transformedData, { ...formatConfig.options, ...options });
      
      // Create download
      const filename = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${formatConfig.extension}`;
      this.downloadBlob(blob, filename);
      
      // Add to history
      this.addToExportHistory({
        dataType,
        format,
        filename,
        recordCount: Array.isArray(transformedData) ? transformedData.length : 1,
        timestamp: new Date(),
        options
      });

      return { success: true, filename, recordCount: transformedData.length };
      
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }

  // Import data
  async importData(file, format, options = {}) {
    try {
      const formatConfig = this.importFormats.get(format);
      if (!formatConfig) {
        throw new Error(`Unsupported import format: ${format}`);
      }

      const processor = this.processors.get(format);
      if (!processor || !processor.import) {
        throw new Error(`No import processor for format: ${format}`);
      }

      // Process import
      const result = await processor.import(file, options);
      
      // Validate data
      const validationResults = this.validateImportData(result.data, options.validationRules);
      
      // Apply transformations
      const transformedData = this.applyTransformations(result.data, options.transformations);
      
      // Add to history
      this.addToImportHistory({
        filename: file.name,
        format,
        recordCount: result.totalRows,
        validRecords: validationResults.validCount,
        invalidRecords: validationResults.invalidCount,
        timestamp: new Date(),
        options
      });

      return {
        success: true,
        data: transformedData,
        validation: validationResults,
        totalRows: result.totalRows,
        metadata: result.metadata
      };
      
    } catch (error) {
      console.error('Import error:', error);
      throw error;
    }
  }

  // Fetch data for export
  async fetchData(dataType, filters = {}) {
    // This would integrate with your actual data source
    // For demo purposes, we'll return mock data
    const mockData = {
      customers: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1234567890', company: 'Acme Corp', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', company: 'Tech Inc', status: 'active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1234567892', company: 'StartupXYZ', status: 'inactive' }
      ],
      deals: [
        { id: 1, title: 'Enterprise Deal', value: 50000, stage: 'negotiation', customer: 'Acme Corp', closeDate: '2024-02-15' },
        { id: 2, title: 'Small Business Package', value: 5000, stage: 'proposal', customer: 'Tech Inc', closeDate: '2024-01-30' }
      ],
      tasks: [
        { id: 1, title: 'Follow up with John', description: 'Call about proposal', dueDate: '2024-01-25', status: 'pending', assignee: 'Sales Rep 1' },
        { id: 2, title: 'Prepare demo', description: 'Demo for Jane Smith', dueDate: '2024-01-28', status: 'in-progress', assignee: 'Sales Rep 2' }
      ]
    };

    return mockData[dataType] || [];
  }

  // Apply data transformations
  applyTransformations(data, transformations = []) {
    if (!Array.isArray(transformations) || transformations.length === 0) {
      return data;
    }

    return data.map(row => {
      const transformedRow = { ...row };
      
      transformations.forEach(transformation => {
        const { field, type, options = {} } = transformation;
        const transformer = this.transformers.get(type);
        
        if (transformer && transformedRow[field] !== undefined) {
          transformedRow[field] = transformer(transformedRow[field], options);
        }
      });
      
      return transformedRow;
    });
  }

  // Validate import data
  validateImportData(data, validationRules = []) {
    const results = {
      validCount: 0,
      invalidCount: 0,
      errors: [],
      warnings: []
    };

    if (!Array.isArray(validationRules) || validationRules.length === 0) {
      results.validCount = data.length;
      return results;
    }

    data.forEach((row, index) => {
      let isValid = true;
      
      validationRules.forEach(rule => {
        const { field, type, required = false, message } = rule;
        const value = row[field];
        const validator = this.validators.get(type);
        
        if (required && !this.validators.get('required')(value)) {
          results.errors.push({
            row: index + 1,
            field,
            message: message || `${field} is required`,
            value
          });
          isValid = false;
        } else if (value && validator && !validator(value)) {
          results.errors.push({
            row: index + 1,
            field,
            message: message || `Invalid ${type} format for ${field}`,
            value
          });
          isValid = false;
        }
      });
      
      if (isValid) {
        results.validCount++;
      } else {
        results.invalidCount++;
      }
    });

    return results;
  }

  // Download blob as file
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Add to export history
  addToExportHistory(exportRecord) {
    this.exportHistory.unshift(exportRecord);
    this.exportHistory = this.exportHistory.slice(0, 50); // Keep last 50
    this.saveHistory();
  }

  // Add to import history
  addToImportHistory(importRecord) {
    this.importHistory.unshift(importRecord);
    this.importHistory = this.importHistory.slice(0, 50); // Keep last 50
    this.saveHistory();
  }

  // Save history to localStorage
  saveHistory() {
    try {
      localStorage.setItem('export_import_history', JSON.stringify({
        exports: this.exportHistory,
        imports: this.importHistory
      }));
    } catch (error) {
      console.warn('Failed to save history:', error);
    }
  }

  // Load history from localStorage
  loadHistory() {
    try {
      const stored = localStorage.getItem('export_import_history');
      if (stored) {
        const history = JSON.parse(stored);
        this.exportHistory = history.exports || [];
        this.importHistory = history.imports || [];
      }
    } catch (error) {
      console.warn('Failed to load history:', error);
    }
  }

  // Get supported formats
  getSupportedFormats(operation = 'export') {
    const formats = operation === 'export' ? this.exportFormats : this.importFormats;
    return Array.from(formats.entries()).map(([key, config]) => ({
      key,
      ...config
    }));
  }

  // Get export history
  getExportHistory() {
    return this.exportHistory;
  }

  // Get import history
  getImportHistory() {
    return this.importHistory;
  }
}

// Export Configuration Component
const ExportConfiguration = ({ dataType, onExport, loading }) => {
  const [format, setFormat] = useState('csv');
  const [options, setOptions] = useState({});
  const [engine] = useState(() => new DataExportImportEngine());

  const formats = engine.getSupportedFormats('export')
    .filter(f => f.supports.includes(dataType));

  const selectedFormat = formats.find(f => f.key === format);

  const handleExport = async () => {
    try {
      await engine.exportData(dataType, format, options);
      onExport?.({ dataType, format, options });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowDownTrayIcon className="h-5 w-5" />
          <span>Export {dataType}</span>
        </CardTitle>
        <CardDescription>
          Choose format and configure export options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Format Selection */}
        <div className="space-y-2">
          <Label>Export Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((formatOption) => (
              <Button
                key={formatOption.key}
                variant={format === formatOption.key ? 'default' : 'outline'}
                className="flex items-center space-x-2 h-auto p-3"
                onClick={() => setFormat(formatOption.key)}
              >
                <formatOption.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{formatOption.name}</div>
                  <div className="text-xs text-gray-500">.{formatOption.extension}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Format-specific Options */}
        {selectedFormat && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">Format Options</Label>
            
            {format === 'csv' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHeaders"
                    checked={options.includeHeaders !== false}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeHeaders: checked }))
                    }
                  />
                  <Label htmlFor="includeHeaders" className="text-sm">Include headers</Label>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Delimiter</Label>
                  <Select
                    value={options.delimiter || ','}
                    onValueChange={(value) => 
                      setOptions(prev => ({ ...prev, delimiter: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Comma (,)</SelectItem>
                      <SelectItem value=";">Semicolon (;)</SelectItem>
                      <SelectItem value="\t">Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {format === 'excel' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCharts"
                    checked={options.includeCharts !== false}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeCharts: checked }))
                    }
                  />
                  <Label htmlFor="includeCharts" className="text-sm">Include charts</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="multipleSheets"
                    checked={options.multipleSheets !== false}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, multipleSheets: checked }))
                    }
                  />
                  <Label htmlFor="multipleSheets" className="text-sm">Multiple sheets</Label>
                </div>
              </div>
            )}

            {format === 'json' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pretty"
                    checked={options.pretty !== false}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, pretty: checked }))
                    }
                  />
                  <Label htmlFor="pretty" className="text-sm">Pretty format</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeMetadata"
                    checked={options.includeMetadata !== false}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeMetadata: checked }))
                    }
                  />
                  <Label htmlFor="includeMetadata" className="text-sm">Include metadata</Label>
                </div>
              </div>
            )}

            {format === 'pdf' && (
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs">Page Size</Label>
                  <Select
                    value={options.pageSize || 'A4'}
                    onValueChange={(value) => 
                      setOptions(prev => ({ ...prev, pageSize: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Orientation</Label>
                  <Select
                    value={options.orientation || 'portrait'}
                    onValueChange={(value) => 
                      setOptions(prev => ({ ...prev, orientation: value }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleExport} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export {selectedFormat?.name}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Import Configuration Component
const ImportConfiguration = ({ onImport, loading }) => {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('csv');
  const [options, setOptions] = useState({});
  const [preview, setPreview] = useState(null);
  const [engine] = useState(() => new DataExportImportEngine());
  const fileInputRef = useRef(null);

  const formats = engine.getSupportedFormats('import');

  const handleFileSelect = async (selectedFile) => {
    setFile(selectedFile);
    
    // Generate preview for small files
    if (selectedFile.size < 1024 * 1024) { // 1MB limit for preview
      try {
        const result = await engine.processors.get(format).import(selectedFile, options);
        setPreview(result.data.slice(0, 5)); // Show first 5 rows
      } catch (error) {
        console.warn('Preview generation failed:', error);
        setPreview(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    try {
      const result = await engine.importData(file, format, options);
      onImport?.(result);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ArrowUpTrayIcon className="h-5 w-5" />
          <span>Import Data</span>
        </CardTitle>
        <CardDescription>
          Upload and configure data import
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Upload */}
        <div className="space-y-2">
          <Label>Select File</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.json,.xml"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0];
                if (selectedFile) {
                  handleFileSelect(selectedFile);
                }
              }}
            />
            
            {file ? (
              <div className="space-y-2">
                <DocumentTextIcon className="h-8 w-8 text-green-600 mx-auto" />
                <div className="text-sm font-medium">{file.name}</div>
                <div className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <CloudArrowUpIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <div className="text-sm text-gray-600">
                  Click to upload or drag and drop
                </div>
                <div className="text-xs text-gray-500">
                  CSV, Excel, JSON, XML files
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Format Selection */}
        <div className="space-y-2">
          <Label>File Format</Label>
          <div className="grid grid-cols-2 gap-2">
            {formats.map((formatOption) => (
              <Button
                key={formatOption.key}
                variant={format === formatOption.key ? 'default' : 'outline'}
                className="flex items-center space-x-2 h-auto p-3"
                onClick={() => setFormat(formatOption.key)}
              >
                <formatOption.icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{formatOption.name}</div>
                  <div className="text-xs text-gray-500">.{formatOption.extension}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Import Options */}
        {format === 'csv' && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <Label className="text-sm font-medium">CSV Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasHeaders"
                checked={options.hasHeaders !== false}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, hasHeaders: checked }))
                }
              />
              <Label htmlFor="hasHeaders" className="text-sm">First row contains headers</Label>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Delimiter</Label>
              <Select
                value={options.delimiter || ','}
                onValueChange={(value) => 
                  setOptions(prev => ({ ...prev, delimiter: value }))
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=",">Comma (,)</SelectItem>
                  <SelectItem value=";">Semicolon (;)</SelectItem>
                  <SelectItem value="\t">Tab</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0] || {}).map((header) => (
                        <th key={header} className="px-2 py-1 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-t">
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex} className="px-2 py-1 truncate max-w-24">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={handleImport} 
          disabled={!file || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Import Data
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Export/Import History Component
const ExportImportHistory = () => {
  const [engine] = useState(() => new DataExportImportEngine());
  const [activeTab, setActiveTab] = useState('exports');

  useEffect(() => {
    engine.loadHistory();
  }, [engine]);

  const exportHistory = engine.getExportHistory();
  const importHistory = engine.getImportHistory();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ClockIcon className="h-5 w-5" />
          <span>History</span>
        </CardTitle>
        <CardDescription>
          Recent export and import activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="exports">
              Exports ({exportHistory.length})
            </TabsTrigger>
            <TabsTrigger value="imports">
              Imports ({importHistory.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="exports" className="space-y-3 mt-4">
            {exportHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No export history
              </p>
            ) : (
              exportHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ArrowDownTrayIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{record.filename}</div>
                      <div className="text-xs text-gray-500">
                        {record.recordCount} records • {record.format.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="imports" className="space-y-3 mt-4">
            {importHistory.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No import history
              </p>
            ) : (
              importHistory.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ArrowUpTrayIcon className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium">{record.filename}</div>
                      <div className="text-xs text-gray-500">
                        {record.validRecords}/{record.recordCount} valid • {record.format.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {record.timestamp.toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Main Data Export/Import Component
const DataExportImport = () => {
  const [activeTab, setActiveTab] = useState('export');
  const [selectedDataType, setSelectedDataType] = useState('customers');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  const dataTypes = [
    { key: 'customers', label: 'Customers', icon: UserIcon },
    { key: 'deals', label: 'Deals', icon: CurrencyDollarIcon },
    { key: 'tasks', label: 'Tasks', icon: CheckCircleIcon },
    { key: 'contacts', label: 'Contacts', icon: BuildingOfficeIcon },
    { key: 'reports', label: 'Reports', icon: ChartBarIcon }
  ];

  const handleExport = async (exportData) => {
    setLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'Export Successful',
        message: `${exportData.dataType} data exported successfully`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (importResult) => {
    setLoading(true);
    try {
      addNotification({
        type: 'success',
        title: 'Import Successful',
        message: `${importResult.totalRows} records imported successfully`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Export & Import</h1>
          <p className="text-gray-600">
            Export and import data in multiple formats with advanced configuration options
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export Data</TabsTrigger>
          <TabsTrigger value="import">Import Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Data Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Data Type</CardTitle>
                <CardDescription>
                  Choose what data to export
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {dataTypes.map((dataType) => (
                  <Button
                    key={dataType.key}
                    variant={selectedDataType === dataType.key ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => setSelectedDataType(dataType.key)}
                  >
                    <dataType.icon className="h-4 w-4 mr-2" />
                    {dataType.label}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Export Configuration */}
            <div className="lg:col-span-2">
              <ExportConfiguration
                dataType={selectedDataType}
                onExport={handleExport}
                loading={loading}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <ImportConfiguration
              onImport={handleImport}
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <ExportImportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataExportImport;
export { DataExportImportEngine };