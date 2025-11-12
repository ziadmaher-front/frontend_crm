import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb, 
  Search, 
  Building, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Tag, 
  FileText, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  Clock, 
  Shield, 
  Eye, 
  Edit, 
  Save, 
  RefreshCw, 
  Plus, 
  Minus, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Star, 
  Wand2, 
  Database, 
  Link, 
  Copy, 
  Check, 
  X, 
  ArrowRight, 
  Filter, 
  SortAsc, 
  MoreHorizontal 
} from 'lucide-react';

export default function SmartDataEntry({ entityType = 'lead', onSave, onCancel }) {
  const [formData, setFormData] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [enrichmentData, setEnrichmentData] = useState({});
  const [isEnriching, setIsEnriching] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [duplicateCheck, setDuplicateCheck] = useState({});
  const [confidence, setConfidence] = useState({});
  const [fieldHistory, setFieldHistory] = useState({});

  const inputRefs = useRef({});

  useEffect(() => {
    initializeForm();
    loadFieldHistory();
  }, [entityType]);

  useEffect(() => {
    if (formData.email || formData.company || formData.domain) {
      performDataEnrichment();
    }
  }, [formData.email, formData.company, formData.domain]);

  useEffect(() => {
    if (activeField) {
      generateFieldSuggestions(activeField);
    }
  }, [activeField, formData]);

  const initializeForm = () => {
    const initialData = {
      // Lead/Contact fields
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      company: '',
      industry: '',
      department: '',
      
      // Company fields
      website: '',
      domain: '',
      employees: '',
      revenue: '',
      location: '',
      country: '',
      
      // Deal fields
      dealValue: '',
      probability: '',
      stage: '',
      source: '',
      
      // Additional fields
      notes: '',
      tags: [],
      priority: 'medium'
    };

    setFormData(initialData);
  };

  const loadFieldHistory = () => {
    // Simulate loading historical data patterns
    const history = {
      jobTitle: [
        'Chief Technology Officer',
        'VP of Sales',
        'Marketing Director',
        'Software Engineer',
        'Product Manager',
        'Sales Manager',
        'Business Development Manager'
      ],
      industry: [
        'Technology',
        'Healthcare',
        'Finance',
        'Manufacturing',
        'Retail',
        'Education',
        'Real Estate'
      ],
      company: [
        'TechCorp Solutions',
        'InnovateTech Inc',
        'Digital Dynamics',
        'CloudFirst Systems',
        'DataDriven Analytics'
      ],
      source: [
        'Website',
        'LinkedIn',
        'Referral',
        'Cold Email',
        'Trade Show',
        'Webinar',
        'Social Media'
      ]
    };

    setFieldHistory(history);
  };

  const performDataEnrichment = async () => {
    setIsEnriching(true);
    
    // Simulate API call for data enrichment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const enrichment = {
      company: {
        name: formData.company || 'TechCorp Solutions',
        domain: 'techcorp.com',
        industry: 'Technology',
        employees: '500-1000',
        revenue: '$50M-$100M',
        location: 'San Francisco, CA',
        description: 'Leading provider of enterprise software solutions',
        technologies: ['React', 'Node.js', 'AWS', 'MongoDB'],
        socialProfiles: {
          linkedin: 'https://linkedin.com/company/techcorp',
          twitter: 'https://twitter.com/techcorp'
        },
        confidence: 92
      },
      contact: {
        fullName: `${formData.firstName} ${formData.lastName}`,
        jobTitle: 'Chief Technology Officer',
        department: 'Technology',
        seniority: 'Executive',
        experience: '10+ years',
        education: 'Stanford University - Computer Science',
        skills: ['Leadership', 'Software Architecture', 'Team Management'],
        socialProfiles: {
          linkedin: `https://linkedin.com/in/${formData.firstName?.toLowerCase()}-${formData.lastName?.toLowerCase()}`,
          twitter: `https://twitter.com/${formData.firstName?.toLowerCase()}`
        },
        confidence: 87
      },
      insights: {
        buyingSignals: [
          'Recently posted about scaling challenges',
          'Company is hiring rapidly',
          'Mentioned budget allocation for new tools'
        ],
        painPoints: [
          'Manual processes',
          'Data silos',
          'Reporting inefficiencies'
        ],
        interests: [
          'Digital transformation',
          'Process automation',
          'Data analytics'
        ],
        recentActivity: [
          'Attended SaaS conference last month',
          'Published article on tech leadership',
          'Company announced Series B funding'
        ]
      }
    };

    setEnrichmentData(enrichment);
    
    // Auto-fill suggested data
    const autoFillData = {
      industry: enrichment.company.industry,
      employees: enrichment.company.employees,
      location: enrichment.company.location,
      jobTitle: enrichment.contact.jobTitle,
      department: enrichment.contact.department
    };

    setFormData(prev => ({ ...prev, ...autoFillData }));
    setIsEnriching(false);
  };

  const generateFieldSuggestions = (fieldName) => {
    let fieldSuggestions = [];
    
    switch (fieldName) {
      case 'jobTitle':
        fieldSuggestions = fieldHistory.jobTitle?.filter(title => 
          title.toLowerCase().includes(formData.jobTitle?.toLowerCase() || '')
        ) || [];
        break;
      case 'industry':
        fieldSuggestions = fieldHistory.industry?.filter(ind => 
          ind.toLowerCase().includes(formData.industry?.toLowerCase() || '')
        ) || [];
        break;
      case 'company':
        fieldSuggestions = fieldHistory.company?.filter(comp => 
          comp.toLowerCase().includes(formData.company?.toLowerCase() || '')
        ) || [];
        break;
      case 'source':
        fieldSuggestions = fieldHistory.source || [];
        break;
      default:
        fieldSuggestions = [];
    }

    setSuggestions(prev => ({ ...prev, [fieldName]: fieldSuggestions }));
  };

  const validateField = (fieldName, value) => {
    const validations = {
      email: {
        isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: !value ? 'Email is required' : 
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : '',
        confidence: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 95 : 0
      },
      phone: {
        isValid: /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')),
        message: !value ? 'Phone number is recommended' : 
                !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')) ? 'Invalid phone format' : '',
        confidence: /^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, '')) ? 90 : 0
      },
      firstName: {
        isValid: value && value.length >= 2,
        message: !value ? 'First name is required' : 
                value.length < 2 ? 'First name too short' : '',
        confidence: value && value.length >= 2 ? 100 : 0
      },
      lastName: {
        isValid: value && value.length >= 2,
        message: !value ? 'Last name is required' : 
                value.length < 2 ? 'Last name too short' : '',
        confidence: value && value.length >= 2 ? 100 : 0
      },
      company: {
        isValid: value && value.length >= 2,
        message: !value ? 'Company name is required' : '',
        confidence: value && value.length >= 2 ? 85 : 0
      }
    };

    const validation = validations[fieldName] || { isValid: true, message: '', confidence: 100 };
    
    setValidationResults(prev => ({ ...prev, [fieldName]: validation }));
    setConfidence(prev => ({ ...prev, [fieldName]: validation.confidence }));
    
    return validation;
  };

  const checkForDuplicates = async (fieldName, value) => {
    if (!value) return;
    
    // Simulate duplicate check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const duplicates = {
      email: value === 'john@techcorp.com' ? [
        { id: 1, name: 'John Smith', company: 'TechCorp', created: '2024-01-10' }
      ] : [],
      company: value.toLowerCase().includes('techcorp') ? [
        { id: 2, name: 'TechCorp Solutions', contacts: 3, created: '2024-01-05' }
      ] : []
    };

    setDuplicateCheck(prev => ({ 
      ...prev, 
      [fieldName]: duplicates[fieldName] || [] 
    }));
  };

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    validateField(fieldName, value);
    
    if (['email', 'company'].includes(fieldName)) {
      checkForDuplicates(fieldName, value);
    }
  };

  const handleFieldFocus = (fieldName) => {
    setActiveField(fieldName);
  };

  const handleFieldBlur = () => {
    setTimeout(() => setActiveField(null), 200);
  };

  const applySuggestion = (fieldName, suggestion) => {
    handleFieldChange(fieldName, suggestion);
    setSuggestions(prev => ({ ...prev, [fieldName]: [] }));
  };

  const applyEnrichmentData = (field, value) => {
    handleFieldChange(field, value);
  };

  const generateSmartSuggestions = () => {
    const suggestions = [
      {
        type: 'completion',
        field: 'jobTitle',
        suggestion: 'Chief Technology Officer',
        reason: 'Common title for this industry',
        confidence: 85
      },
      {
        type: 'enrichment',
        field: 'phone',
        suggestion: '+1 (555) 123-4567',
        reason: 'Found in company directory',
        confidence: 92
      },
      {
        type: 'validation',
        field: 'email',
        suggestion: 'Verify email deliverability',
        reason: 'Domain has delivery issues',
        confidence: 78
      }
    ];

    setSmartSuggestions(suggestions);
  };

  const getFieldIcon = (fieldName) => {
    const icons = {
      firstName: User,
      lastName: User,
      email: Mail,
      phone: Phone,
      company: Building,
      website: Globe,
      jobTitle: Briefcase,
      industry: Tag,
      location: MapPin,
      dealValue: DollarSign,
      notes: FileText
    };
    return icons[fieldName] || FileText;
  };

  const getValidationColor = (fieldName) => {
    const validation = validationResults[fieldName];
    if (!validation) return 'border-gray-300';
    return validation.isValid ? 'border-green-500' : 'border-red-500';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderField = (fieldName, label, type = 'text', options = null) => {
    const FieldIcon = getFieldIcon(fieldName);
    const validation = validationResults[fieldName];
    const fieldSuggestions = suggestions[fieldName] || [];
    const duplicates = duplicateCheck[fieldName] || [];
    const fieldConfidence = confidence[fieldName] || 0;

    return (
      <div key={fieldName} className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <FieldIcon className="h-4 w-4" />
          {label}
          {fieldConfidence > 0 && (
            <Badge variant="outline" className={`text-xs ${getConfidenceColor(fieldConfidence)}`}>
              {fieldConfidence}% confident
            </Badge>
          )}
        </label>
        
        <div className="relative">
          {type === 'select' ? (
            <Select 
              value={formData[fieldName]} 
              onValueChange={(value) => handleFieldChange(fieldName, value)}
            >
              <SelectTrigger className={getValidationColor(fieldName)}>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {options?.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : type === 'textarea' ? (
            <Textarea
              ref={el => inputRefs.current[fieldName] = el}
              value={formData[fieldName]}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              onFocus={() => handleFieldFocus(fieldName)}
              onBlur={handleFieldBlur}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={getValidationColor(fieldName)}
              rows={3}
            />
          ) : (
            <Input
              ref={el => inputRefs.current[fieldName] = el}
              type={type}
              value={formData[fieldName]}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              onFocus={() => handleFieldFocus(fieldName)}
              onBlur={handleFieldBlur}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={getValidationColor(fieldName)}
            />
          )}

          {/* Field Suggestions Dropdown */}
          {activeField === fieldName && fieldSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {fieldSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => applySuggestion(fieldName, suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Validation Message */}
        {validation && validation.message && (
          <div className={`flex items-center gap-2 text-xs ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
            {validation.isValid ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {validation.message}
          </div>
        )}

        {/* Duplicate Warning */}
        {duplicates.length > 0 && (
          <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="flex items-center gap-2 text-yellow-800 mb-1">
              <AlertCircle className="h-3 w-3" />
              Potential duplicates found
            </div>
            {duplicates.map((duplicate, index) => (
              <div key={index} className="text-yellow-700">
                {duplicate.name} {duplicate.company && `at ${duplicate.company}`}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Smart Data Entry
          </h2>
          <p className="text-gray-600">AI-powered form with auto-completion and validation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateSmartSuggestions}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Get Suggestions
          </Button>
          <Button onClick={() => performDataEnrichment()} disabled={isEnriching}>
            <Wand2 className={`h-4 w-4 mr-2 ${isEnriching ? 'animate-spin' : ''}`} />
            {isEnriching ? 'Enriching...' : 'Enrich Data'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                {entityType === 'lead' ? 'Lead Information' : 
                 entityType === 'contact' ? 'Contact Information' : 
                 'Deal Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderField('firstName', 'First Name')}
                {renderField('lastName', 'Last Name')}
                {renderField('email', 'Email', 'email')}
                {renderField('phone', 'Phone', 'tel')}
                {renderField('jobTitle', 'Job Title')}
                {renderField('company', 'Company')}
                {renderField('industry', 'Industry', 'select', [
                  'Technology', 'Healthcare', 'Finance', 'Manufacturing', 
                  'Retail', 'Education', 'Real Estate', 'Other'
                ])}
                {renderField('location', 'Location')}
              </div>

              {entityType === 'deal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {renderField('dealValue', 'Deal Value', 'number')}
                  {renderField('probability', 'Probability (%)', 'number')}
                  {renderField('stage', 'Stage', 'select', [
                    'Discovery', 'Proposal', 'Negotiation', 'Closing'
                  ])}
                  {renderField('source', 'Source', 'select', [
                    'Website', 'LinkedIn', 'Referral', 'Cold Email', 'Trade Show'
                  ])}
                </div>
              )}

              <div className="pt-4 border-t">
                {renderField('notes', 'Notes', 'textarea')}
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <Button onClick={() => onSave?.(formData)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save {entityType}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Data Enrichment */}
          {Object.keys(enrichmentData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Enrichment
                </CardTitle>
                <CardDescription>
                  AI-powered data suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrichmentData.company && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">Company Info</span>
                      <Badge variant="outline" className="text-xs">
                        {enrichmentData.company.confidence}% match
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Industry:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-blue-600"
                          onClick={() => applyEnrichmentData('industry', enrichmentData.company.industry)}
                        >
                          {enrichmentData.company.industry}
                        </Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Employees:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-blue-600"
                          onClick={() => applyEnrichmentData('employees', enrichmentData.company.employees)}
                        >
                          {enrichmentData.company.employees}
                        </Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-blue-600"
                          onClick={() => applyEnrichmentData('location', enrichmentData.company.location)}
                        >
                          {enrichmentData.company.location}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {enrichmentData.contact && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">Contact Info</span>
                      <Badge variant="outline" className="text-xs">
                        {enrichmentData.contact.confidence}% match
                      </Badge>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span>Job Title:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-green-600"
                          onClick={() => applyEnrichmentData('jobTitle', enrichmentData.contact.jobTitle)}
                        >
                          {enrichmentData.contact.jobTitle}
                        </Button>
                      </div>
                      <div className="flex justify-between">
                        <span>Department:</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-auto p-0 text-green-600"
                          onClick={() => applyEnrichmentData('department', enrichmentData.contact.department)}
                        >
                          {enrichmentData.contact.department}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {enrichmentData.insights && (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-sm">AI Insights</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium text-purple-700 mb-1">Buying Signals:</div>
                        {enrichmentData.insights.buyingSignals.slice(0, 2).map((signal, index) => (
                          <div key={index} className="text-xs text-purple-600">• {signal}</div>
                        ))}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-purple-700 mb-1">Pain Points:</div>
                        {enrichmentData.insights.painPoints.slice(0, 2).map((pain, index) => (
                          <div key={index} className="text-xs text-purple-600">• {pain}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Smart Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {smartSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {suggestion.type}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {suggestion.confidence}% confident
                      </span>
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {suggestion.field}: {suggestion.suggestion}
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      {suggestion.reason}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyEnrichmentData(suggestion.field, suggestion.suggestion)}
                    >
                      Apply
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Form Validation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Validation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(validationResults).map(([field, validation]) => (
                  <div key={field} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                    <div className="flex items-center gap-2">
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {validation.isValid ? 'Valid' : 'Invalid'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Quality Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Data Quality Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(Object.values(confidence).reduce((a, b) => a + b, 0) / Object.values(confidence).length) || 0}%
                </div>
                <p className="text-sm text-gray-600 mb-4">Overall data quality</p>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Completeness:</span>
                    <span className="font-medium">
                      {Object.values(formData).filter(v => v && v.length > 0).length} / {Object.keys(formData).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Accuracy:</span>
                    <span className="font-medium">
                      {Object.values(validationResults).filter(v => v.isValid).length} / {Object.keys(validationResults).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Enrichment:</span>
                    <span className="font-medium">
                      {Object.keys(enrichmentData).length > 0 ? 'Available' : 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}