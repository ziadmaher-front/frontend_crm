import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  Smartphone, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  RefreshCw,
  Download
} from 'lucide-react';

const TwoFactorAuth = ({ userId, onSetupComplete }) => {
  const [step, setStep] = useState('setup'); // setup, verify, complete
  const [qrCode, setQrCode] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Check if 2FA is already enabled
    checkTwoFactorStatus();
  }, [userId]);

  const checkTwoFactorStatus = async () => {
    try {
      // Mock API call - replace with actual implementation
      const response = await fetch(`/api/users/${userId}/2fa/status`);
      
      // Check if response is ok and content type is JSON
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // For development, use mock data instead of trying to parse HTML
        setIsEnabled(false);
        return;
      }
      
      const data = await response.json();
      setIsEnabled(data.enabled);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      // Set default state for development
      setIsEnabled(false);
    }
  };

  const generateQRCode = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock API call - replace with actual implementation
      const response = await fetch(`/api/users/${userId}/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        setQrCode(data.qrCode);
        setSecretKey(data.secret);
        setStep('verify');
      } else {
        setError(data.message || 'Failed to generate QR code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Mock API call - replace with actual implementation
      const response = await fetch(`/api/users/${userId}/2fa/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          secret: secretKey
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setIsEnabled(true);
        setStep('complete');
        if (onSetupComplete) onSetupComplete();
      } else {
        setError(data.message || 'Invalid verification code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disable2FA = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Mock API call - replace with actual implementation
      const response = await fetch(`/api/users/${userId}/2fa/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsEnabled(false);
        setStep('setup');
        setQrCode('');
        setSecretKey('');
        setBackupCodes([]);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const content = `Sales Pro CRM - Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\nUser ID: ${userId}\n\nBackup Codes (use each code only once):\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place. You can use them to access your account if you lose your authenticator device.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'salesproCRM-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isEnabled && step !== 'complete') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-500" />
            <span>Two-Factor Authentication</span>
            <Badge variant="default" className="bg-green-500">Enabled</Badge>
          </CardTitle>
          <CardDescription>
            Your account is protected with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Two-factor authentication is active on your account. You'll need your authenticator app to sign in.
            </AlertDescription>
          </Alert>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setStep('complete')}>
              View Backup Codes
            </Button>
            <Button variant="destructive" onClick={disable2FA} disabled={isLoading}>
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Disable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Two-Factor Authentication</span>
          {isEnabled && <Badge variant="default" className="bg-green-500">Enabled</Badge>}
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={step} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="verify" disabled={!qrCode}>Verify</TabsTrigger>
            <TabsTrigger value="complete" disabled={!isEnabled}>Complete</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold">Secure Your Account</h3>
                <p className="text-gray-600">
                  Two-factor authentication adds an extra layer of security to your account
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <h4 className="font-medium mb-2">You'll need:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• An authenticator app (Google Authenticator, Authy, etc.)</li>
                  <li>• Your smartphone or tablet</li>
                  <li>• A few minutes to complete setup</li>
                </ul>
              </div>

              <Button onClick={generateQRCode} disabled={isLoading} className="w-full">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Get Started
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="verify" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
                <p className="text-gray-600 mb-4">
                  Use your authenticator app to scan this QR code
                </p>
                
                {qrCode && (
                  <div className="bg-white p-4 rounded-lg border inline-block">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <Label className="text-sm font-medium">Manual Entry Key</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input value={secretKey} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Use this key if you can't scan the QR code
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-gray-500">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Button onClick={verifyCode} disabled={isLoading || verificationCode.length !== 6} className="w-full">
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                Verify & Enable
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="complete" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-green-600">2FA Enabled Successfully!</h3>
                <p className="text-gray-600">
                  Your account is now protected with two-factor authentication
                </p>
              </div>
            </div>

            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> Save your backup codes in a secure location. 
                You can use these codes to access your account if you lose your authenticator device.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Backup Codes</h4>
                <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border font-mono text-sm text-center">
                    {code}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Each backup code can only be used once. Generate new codes if you run out.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorAuth;