import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Download, 
  Upload, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Copy,
  Check,
  Plus,
  Minus
} from 'lucide-react';
import { useTheme, validateTheme, defaultThemes } from '../hooks/useTheme.jsx';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';

const ThemeCustomizer = ({ isOpen, onClose }) => {
  const { 
    theme, 
    themes, 
    setTheme, 
    addCustomTheme, 
    removeCustomTheme, 
    followSystem, 
    setFollowSystem,
    currentThemeConfig 
  } = useTheme();

  const [customTheme, setCustomTheme] = useState({
    name: '',
    colors: { ...currentThemeConfig.colors },
    shadows: { ...currentThemeConfig.shadows }
  });
  
  const [previewMode, setPreviewMode] = useState(false);
  const [activeColorGroup, setActiveColorGroup] = useState('primary');
  const [copiedColor, setCopiedColor] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Color groups for better organization
  const colorGroups = {
    primary: {
      name: 'Primary Colors',
      colors: ['primary', 'primary-foreground']
    },
    secondary: {
      name: 'Secondary Colors', 
      colors: ['secondary', 'secondary-foreground']
    },
    background: {
      name: 'Background Colors',
      colors: ['background', 'foreground', 'card', 'card-foreground']
    },
    interactive: {
      name: 'Interactive Elements',
      colors: ['accent', 'accent-foreground', 'muted', 'muted-foreground']
    },
    system: {
      name: 'System Colors',
      colors: ['destructive', 'destructive-foreground', 'border', 'input', 'ring']
    },
    popover: {
      name: 'Popover Colors',
      colors: ['popover', 'popover-foreground']
    }
  };

  // Reset custom theme when theme changes
  useEffect(() => {
    setCustomTheme({
      name: '',
      colors: { ...currentThemeConfig.colors },
      shadows: { ...currentThemeConfig.shadows }
    });
  }, [currentThemeConfig]);

  const handleColorChange = (colorName, value) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorName]: value
      }
    }));
  };

  const handleShadowChange = (shadowName, value) => {
    setCustomTheme(prev => ({
      ...prev,
      shadows: {
        ...prev.shadows,
        [shadowName]: value
      }
    }));
  };

  const saveCustomTheme = () => {
    if (!customTheme.name.trim()) {
      alert('Please enter a theme name');
      return;
    }

    try {
      validateTheme(customTheme);
      addCustomTheme(customTheme.name, {
        name: customTheme.name,
        colors: customTheme.colors,
        shadows: customTheme.shadows
      });
      alert('Theme saved successfully!');
    } catch (error) {
      alert(`Error saving theme: ${error.message}`);
    }
  };

  const exportTheme = () => {
    const themeData = {
      name: customTheme.name,
      colors: customTheme.colors,
      shadows: customTheme.shadows,
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(themeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${customTheme.name || 'custom-theme'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importTheme = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target.result);
        validateTheme(themeData);
        setCustomTheme(themeData);
      } catch (error) {
        alert(`Error importing theme: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };

  const copyColorValue = (colorName, value) => {
    navigator.clipboard.writeText(value);
    setCopiedColor(colorName);
    setTimeout(() => setCopiedColor(''), 2000);
  };

  const resetToDefault = () => {
    const defaultTheme = defaultThemes[theme] || defaultThemes.light;
    setCustomTheme({
      name: '',
      colors: { ...defaultTheme.colors },
      shadows: { ...defaultTheme.shadows }
    });
  };

  const generateRandomTheme = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 40) + 60; // 60-100%
    const lightness = Math.floor(Math.random() * 20) + 40; // 40-60%

    const primary = `hsl(${hue} ${saturation}% ${lightness}%)`;
    const primaryForeground = lightness > 50 ? 'hsl(0 0% 0%)' : 'hsl(0 0% 100%)';
    
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        primary,
        'primary-foreground': primaryForeground,
        ring: primary,
        accent: `hsl(${hue} ${saturation * 0.3}% ${lightness + 40}%)`,
      }
    }));
  };

  const ColorPicker = ({ colorName, value, onChange }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleInputChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      onChange(colorName, newValue);
    };

    return (
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border-2 border-border cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => copyColorValue(colorName, value)}
        />
        <div className="flex-1">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            className="text-xs font-mono"
            placeholder="hsl(0 0% 0%)"
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => copyColorValue(colorName, value)}
          className="p-1 h-6 w-6"
        >
          {copiedColor === colorName ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customizer
          </DialogTitle>
          <DialogDescription>
            Customize your application theme or create new themes
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="themes" className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="themes">Themes</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="shadows">Shadows</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            <TabsContent value="themes" className="space-y-4">
              {/* Theme Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Selection</CardTitle>
                  <CardDescription>
                    Choose from built-in themes or your custom themes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={followSystem}
                      onCheckedChange={setFollowSystem}
                    />
                    <Label>Follow system theme</Label>
                    <Monitor className="h-4 w-4" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(themes).map(([themeName, themeConfig]) => (
                      <motion.div
                        key={themeName}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          className={`cursor-pointer transition-all ${
                            theme === themeName ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setTheme(themeName)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">
                                {themeConfig.name}
                              </span>
                              {!defaultThemes[themeName] && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeCustomTheme(themeName);
                                  }}
                                  className="p-1 h-6 w-6"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {['primary', 'secondary', 'accent', 'destructive'].map(color => (
                                <div
                                  key={color}
                                  className="w-4 h-4 rounded-sm border"
                                  style={{ backgroundColor: themeConfig.colors[color] }}
                                />
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Theme Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={generateRandomTheme} variant="outline">
                      <Palette className="h-4 w-4 mr-2" />
                      Generate Random
                    </Button>
                    <Button onClick={resetToDefault} variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset to Default
                    </Button>
                    <Button onClick={exportTheme} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Theme
                    </Button>
                    <label className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <Upload className="h-4 w-4 mr-2" />
                          Import Theme
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importTheme}
                        className="hidden"
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Customization</CardTitle>
                  <CardDescription>
                    Modify colors to create your perfect theme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Input
                      placeholder="Theme name"
                      value={customTheme.name}
                      onChange={(e) => setCustomTheme(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1"
                    />
                    <Button onClick={saveCustomTheme}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Theme
                    </Button>
                  </div>

                  <Tabs value={activeColorGroup} onValueChange={setActiveColorGroup}>
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                      {Object.entries(colorGroups).map(([groupKey, group]) => (
                        <TabsTrigger key={groupKey} value={groupKey} className="text-xs">
                          {group.name.split(' ')[0]}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {Object.entries(colorGroups).map(([groupKey, group]) => (
                      <TabsContent key={groupKey} value={groupKey} className="space-y-3">
                        <h4 className="font-medium">{group.name}</h4>
                        {group.colors.map(colorName => (
                          <div key={colorName} className="space-y-2">
                            <Label className="text-sm font-mono">{colorName}</Label>
                            <ColorPicker
                              colorName={colorName}
                              value={customTheme.colors[colorName]}
                              onChange={handleColorChange}
                            />
                          </div>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shadows" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Shadow Customization</CardTitle>
                  <CardDescription>
                    Adjust shadow effects for depth and elevation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(customTheme.shadows || {}).map(([shadowName, shadowValue]) => (
                    <div key={shadowName} className="space-y-2">
                      <Label className="text-sm font-mono">{shadowName}</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          value={shadowValue}
                          onChange={(e) => handleShadowChange(shadowName, e.target.value)}
                          className="flex-1 font-mono text-xs"
                          placeholder="0 1px 3px 0 rgb(0 0 0 / 0.1)"
                        />
                        <div 
                          className="w-12 h-12 bg-background border rounded"
                          style={{ boxShadow: shadowValue }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Settings</CardTitle>
                  <CardDescription>
                    Advanced theme configuration and preview options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Preview Mode</Label>
                    <Switch
                      checked={previewMode}
                      onCheckedChange={setPreviewMode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Show Advanced Options</Label>
                    <Switch
                      checked={showAdvanced}
                      onCheckedChange={setShowAdvanced}
                    />
                  </div>

                  {showAdvanced && (
                    <div className="space-y-4 pt-4 border-t">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Advanced options allow fine-tuning of theme properties. 
                          Changes here may affect theme compatibility.
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-2">
                        <Label>Theme Metadata</Label>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>Colors: {Object.keys(customTheme.colors).length}</div>
                          <div>Shadows: {Object.keys(customTheme.shadows || {}).length}</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Export Options</Label>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={exportTheme}>
                            Export as JSON
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => {
                            const css = Object.entries(customTheme.colors)
                              .map(([key, value]) => `  --${key}: ${value};`)
                              .join('\n');
                            navigator.clipboard.writeText(`:root {\n${css}\n}`);
                          }}>
                            Copy as CSS
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeCustomizer;