import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Eye,
  Ear,
  Hand,
  Type,
  Palette,
  Volume2,
  MousePointer,
  Keyboard,
  Monitor,
  RotateCcw,
  Check,
  Info,
  Zap,
  Moon,
  Sun,
  Contrast,
  Move,
  Focus
} from 'lucide-react';
import {
  useAccessibilityPreferences,
  useTextScaling,
  useHighContrast,
  useReducedMotion,
  useColorScheme
} from '@/hooks/useAccessibility.jsx';

export default function AccessibilityPanel() {
  const [activeTab, setActiveTab] = useState('vision');
  const { preferences, updatePreference, resetPreferences } = useAccessibilityPreferences();
  const { textScale, updateTextScale, resetTextScale } = useTextScaling();
  const isHighContrast = useHighContrast();
  const prefersReducedMotion = useReducedMotion();
  const colorScheme = useColorScheme();

  const [customSettings, setCustomSettings] = useState({
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    cursorSize: 1,
    focusIndicatorSize: 2,
    animationSpeed: 1
  });

  const handleCustomSettingChange = (setting, value) => {
    setCustomSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const applySettings = () => {
    // Apply custom CSS variables
    const root = document.documentElement;
    root.style.setProperty('--font-size-base', `${customSettings.fontSize}px`);
    root.style.setProperty('--line-height-base', customSettings.lineHeight);
    root.style.setProperty('--letter-spacing-base', `${customSettings.letterSpacing}px`);
    root.style.setProperty('--cursor-size', customSettings.cursorSize);
    root.style.setProperty('--focus-ring-width', `${customSettings.focusIndicatorSize}px`);
    root.style.setProperty('--animation-speed', customSettings.animationSpeed);
  };

  const resetAllSettings = () => {
    resetPreferences();
    resetTextScale();
    setCustomSettings({
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 0,
      cursorSize: 1,
      focusIndicatorSize: 2,
      animationSpeed: 1
    });
  };

  const VisionTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Visual Preferences
          </CardTitle>
          <CardDescription>
            Customize visual elements for better readability and comfort
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">High Contrast Mode</Label>
              <p className="text-xs text-muted-foreground">
                Increase contrast between text and background
              </p>
              {isHighContrast && (
                <Badge variant="secondary" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  System detected
                </Badge>
              )}
            </div>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={(checked) => updatePreference('highContrast', checked)}
            />
          </div>

          <Separator />

          {/* Text Scaling */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Text Size</Label>
              <Badge variant="outline">{Math.round(textScale * 100)}%</Badge>
            </div>
            <Slider
              value={[textScale]}
              onValueChange={([value]) => updateTextScale(value)}
              min={0.8}
              max={2}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>

          <Separator />

          {/* Font Settings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Font Customization</Label>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Font Size</Label>
                <span className="text-xs text-muted-foreground">{customSettings.fontSize}px</span>
              </div>
              <Slider
                value={[customSettings.fontSize]}
                onValueChange={([value]) => handleCustomSettingChange('fontSize', value)}
                min={12}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Line Height</Label>
                <span className="text-xs text-muted-foreground">{customSettings.lineHeight}</span>
              </div>
              <Slider
                value={[customSettings.lineHeight]}
                onValueChange={([value]) => handleCustomSettingChange('lineHeight', value)}
                min={1.2}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Letter Spacing</Label>
                <span className="text-xs text-muted-foreground">{customSettings.letterSpacing}px</span>
              </div>
              <Slider
                value={[customSettings.letterSpacing]}
                onValueChange={([value]) => handleCustomSettingChange('letterSpacing', value)}
                min={-1}
                max={3}
                step={0.1}
              />
            </div>
          </div>

          <Separator />

          {/* Color Scheme */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Color Scheme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={colorScheme === 'light' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </Button>
              <Button
                variant={colorScheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                className="flex items-center space-x-2"
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Monitor className="h-4 w-4" />
                <span>Auto</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Focus className="h-5 w-5 mr-2" />
            Focus & Navigation
          </CardTitle>
          <CardDescription>
            Enhance focus indicators and navigation visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Focus Indicator Size</Label>
              <span className="text-xs text-muted-foreground">{customSettings.focusIndicatorSize}px</span>
            </div>
            <Slider
              value={[customSettings.focusIndicatorSize]}
              onValueChange={([value]) => handleCustomSettingChange('focusIndicatorSize', value)}
              min={1}
              max={5}
              step={1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Enhanced Focus Indicators</Label>
              <p className="text-xs text-muted-foreground">
                Show larger, more visible focus outlines
              </p>
            </div>
            <Switch
              checked={preferences.keyboardNavigation}
              onCheckedChange={(checked) => updatePreference('keyboardNavigation', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const MotorTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Hand className="h-5 w-5 mr-2" />
            Motor & Interaction
          </CardTitle>
          <CardDescription>
            Customize interaction methods and reduce motion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reduced Motion */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">
                Minimize animations and transitions
              </p>
              {prefersReducedMotion && (
                <Badge variant="secondary" className="text-xs">
                  <Info className="h-3 w-3 mr-1" />
                  System detected
                </Badge>
              )}
            </div>
            <Switch
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => updatePreference('reducedMotion', checked)}
            />
          </div>

          <Separator />

          {/* Animation Speed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Animation Speed</Label>
              <Badge variant="outline">{customSettings.animationSpeed}x</Badge>
            </div>
            <Slider
              value={[customSettings.animationSpeed]}
              onValueChange={([value]) => handleCustomSettingChange('animationSpeed', value)}
              min={0.1}
              max={2}
              step={0.1}
              disabled={preferences.reducedMotion}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          <Separator />

          {/* Cursor Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Cursor Size</Label>
              <Badge variant="outline">{customSettings.cursorSize}x</Badge>
            </div>
            <Slider
              value={[customSettings.cursorSize]}
              onValueChange={([value]) => handleCustomSettingChange('cursorSize', value)}
              min={0.5}
              max={3}
              step={0.1}
            />
          </div>

          <Separator />

          {/* Keyboard Navigation */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Keyboard Navigation</Label>
              <p className="text-xs text-muted-foreground">
                Enable full keyboard navigation support
              </p>
            </div>
            <Switch
              checked={preferences.keyboardNavigation}
              onCheckedChange={(checked) => updatePreference('keyboardNavigation', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CognitiveTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Cognitive Support
          </CardTitle>
          <CardDescription>
            Features to support focus and comprehension
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Screen Reader Support</Label>
              <p className="text-xs text-muted-foreground">
                Enhanced announcements and descriptions
              </p>
            </div>
            <Switch
              checked={preferences.screenReader}
              onCheckedChange={(checked) => updatePreference('screenReader', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Large Text Mode</Label>
              <p className="text-xs text-muted-foreground">
                Increase text size across the application
              </p>
            </div>
            <Switch
              checked={preferences.largeText}
              onCheckedChange={(checked) => updatePreference('largeText', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">Reading Assistance</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Type className="h-4 w-4 mr-2" />
                Dyslexia-Friendly Font
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Reading Guide
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Color Coding
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SystemTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            System Integration
          </CardTitle>
          <CardDescription>
            Detected system accessibility preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <Contrast className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">High Contrast</p>
                  <p className="text-xs text-muted-foreground">System preference</p>
                </div>
              </div>
              <Badge variant={isHighContrast ? 'default' : 'secondary'}>
                {isHighContrast ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <Move className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Reduced Motion</p>
                  <p className="text-xs text-muted-foreground">System preference</p>
                </div>
              </div>
              <Badge variant={prefersReducedMotion ? 'default' : 'secondary'}>
                {prefersReducedMotion ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center space-x-3">
                <Monitor className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Color Scheme</p>
                  <p className="text-xs text-muted-foreground">System preference</p>
                </div>
              </div>
              <Badge variant="outline" className="capitalize">
                {colorScheme}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common accessibility tasks and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={applySettings} className="flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Apply Settings</span>
            </Button>
            <Button onClick={resetAllSettings} variant="outline" className="flex items-center space-x-2">
              <RotateCcw className="h-4 w-4" />
              <span>Reset All</span>
            </Button>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Accessibility Shortcuts</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span>Toggle High Contrast:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Alt + Shift + H</kbd>
              </div>
              <div className="flex justify-between">
                <span>Increase Text Size:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + Plus</kbd>
              </div>
              <div className="flex justify-between">
                <span>Decrease Text Size:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + Minus</kbd>
              </div>
              <div className="flex justify-between">
                <span>Focus Next Element:</span>
                <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Tab</kbd>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accessibility</h1>
          <p className="text-muted-foreground">
            Customize your experience for better accessibility and usability
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={applySettings}>
            <Check className="h-4 w-4 mr-2" />
            Apply Changes
          </Button>
          <Button onClick={resetAllSettings} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vision" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Vision</span>
          </TabsTrigger>
          <TabsTrigger value="motor" className="flex items-center space-x-2">
            <Hand className="h-4 w-4" />
            <span>Motor</span>
          </TabsTrigger>
          <TabsTrigger value="cognitive" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Cognitive</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vision" className="space-y-4">
          <VisionTab />
        </TabsContent>

        <TabsContent value="motor" className="space-y-4">
          <MotorTab />
        </TabsContent>

        <TabsContent value="cognitive" className="space-y-4">
          <CognitiveTab />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}