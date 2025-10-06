'use client';

import { useState } from 'react';
import { Shield, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TwoFactorSetup() {
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationToken, setVerificationToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const initiate2FASetup = async () => {
    setIsSettingUp(true);
    try {
      const response = await fetch('/api/auth/2fa-setup');
      const data = await response.json();
      
      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
      } else {
        toast.error(data.error || 'Failed to setup 2FA');
      }
    } catch (error) {
      toast.error('Failed to initialize 2FA setup');
    }
  };

  const verify2FASetup = async () => {
    if (!verificationToken) {
      toast.error('Please enter the verification code');
      return;
    }
    
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/2fa-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('2FA has been enabled successfully!');
        setIs2FAEnabled(true);
        setIsSettingUp(false);
        setQrCode(null);
        setSecret(null);
        setBackupCodes([]);
      } else {
        toast.error(data.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('Failed to verify 2FA setup');
    } finally {
      setIsVerifying(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    toast.success('Backup codes copied to clipboard');
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  const disable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/auth/2fa-verify', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('2FA has been disabled');
        setIs2FAEnabled(false);
      } else {
        toast.error('Failed to disable 2FA');
      }
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
        </div>

        {!isSettingUp && !is2FAEnabled && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Add an extra layer of security to your account by enabling two-factor authentication.
            </p>
            <button
              onClick={initiate2FASetup}
              className="btn-primary"
            >
              Enable 2FA
            </button>
          </div>
        )}

        {!isSettingUp && is2FAEnabled && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              <span className="font-medium">2FA is enabled</span>
            </div>
            <p className="text-gray-600">
              Your account is protected with two-factor authentication.
            </p>
            <button
              onClick={disable2FA}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
            >
              Disable 2FA
            </button>
          </div>
        )}

        {isSettingUp && qrCode && (
          <div className="space-y-6">
            {/* Step 1: Scan QR Code */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Step 1: Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center mb-4">
                <img src={qrCode} alt="2FA QR Code" className="border rounded-lg" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Manual entry code:</p>
                <code className="text-sm font-mono break-all">{secret}</code>
              </div>
            </div>

            {/* Step 2: Save Backup Codes */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Step 2: Save Backup Codes</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important!</p>
                    <p>Save these backup codes in a safe place. You can use them to access your account if you lose your phone.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="py-1">{idx + 1}. {code}</div>
                  ))}
                </div>
              </div>
              <button
                onClick={copyBackupCodes}
                className="btn-secondary flex items-center gap-2"
              >
                {copiedCodes ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedCodes ? 'Copied!' : 'Copy Backup Codes'}
              </button>
            </div>

            {/* Step 3: Verify */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-3">Step 3: Verify Setup</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter a 6-digit code from your authenticator app to complete setup.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={verificationToken}
                  onChange={(e) => setVerificationToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20 font-mono text-center text-lg"
                />
                <button
                  onClick={verify2FASetup}
                  disabled={isVerifying || verificationToken.length !== 6}
                  className="btn-primary flex items-center gap-2"
                >
                  {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Enable
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setIsSettingUp(false);
                setQrCode(null);
                setSecret(null);
                setBackupCodes([]);
              }}
              className="btn-secondary w-full"
            >
              Cancel Setup
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
