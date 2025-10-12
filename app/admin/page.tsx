'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { User, Lock, Save, Eye, EyeOff, Shield, Key, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [currentUsername, setCurrentUsername] = useState('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch current username
    fetch('/api/admin/update-credentials')
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setCurrentUsername(data.username);
        }
      })
      .catch(err => console.error('Failed to fetch username:', err));
  }, []);

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    if (!newUsername && !newPassword) {
      toast.error('Please enter a new username or password');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Credentials updated successfully! Please login again.');
        // Clear form
        setCurrentPassword('');
        setNewUsername('');
        setNewPassword('');
        setConfirmPassword('');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to update credentials');
      }
    } catch (error) {
      toast.error('Failed to update credentials');
    } finally {
      setLoading(false);
    }
  };

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
    toast.success('Strong password generated!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account security and login credentials
          </p>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium">Important Security Notice</p>
              <p className="mt-1">
                After changing your credentials, you will be automatically logged out and need to login with your new username/password.
                Make sure to save your new credentials in a secure location.
              </p>
            </div>
          </div>
        </div>

        {/* Current Account Info */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold">Current Account</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <User className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">Username:</span>
              <span className="ml-2 font-medium text-gray-900">{currentUsername}</span>
            </div>
            <div className="flex items-center text-sm">
              <Key className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">Password:</span>
              <span className="ml-2 text-gray-500">••••••••</span>
            </div>
          </div>
        </div>

        {/* Update Credentials Form */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <Lock className="w-5 h-5 text-gray-600 mr-2" />
            <h2 className="text-lg font-semibold">Update Credentials</h2>
          </div>

          <form onSubmit={handleUpdateCredentials} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password *
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field w-full pr-10"
                  placeholder="Enter your current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <hr className="my-4" />

            {/* New Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Username (optional)
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="input-field w-full"
                placeholder="Leave empty to keep current username"
              />
              <p className="mt-1 text-xs text-gray-500">
                Only letters, numbers, and underscores allowed
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field w-full pr-10"
                  placeholder="Leave empty to keep current password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Generate strong password
              </button>
            </div>

            {/* Confirm New Password */}
            {newPassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field w-full pr-10"
                    placeholder="Re-enter new password"
                    required={!!newPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Credentials'}
              </button>
            </div>
          </form>
        </div>

        {/* Security Tips */}
        <div className="card p-6 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Security Tips</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Use a strong password with at least 8 characters
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Include uppercase, lowercase, numbers, and symbols
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Never share your login credentials with anyone
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">•</span>
              Change your password regularly for better security
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
