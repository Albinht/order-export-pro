'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Settings,
  User,
  Bell,
  Shield,
  Globe,
  Database,
  Mail,
  Key,
  Save,
  Info,
  AlertCircle,
  CheckCircle,
  Moon,
  Sun,
  Monitor,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [theme, setTheme] = useState('light');
  
  // Form states
  const [profileData, setProfileData] = useState({
    username: 'admin',
    email: 'admin@orderexport.com',
    company: 'My Company',
    timezone: 'Europe/Amsterdam'
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailOnExport: true,
    emailOnError: true,
    emailWeeklyReport: false,
    browserNotifications: true
  });

  const [exportSettings, setExportSettings] = useState({
    autoFulfillment: true,
    includeNotes: false,
    dateFormat: 'DD/MM/YYYY',
    fileNamePattern: 'orders_{{date}}_{{store}}',
    defaultColumns: 'all'
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Settings saved successfully');
    setSaving(false);
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'export', name: 'Export Settings', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Sun },
  ];

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-[rgb(var(--color-primary))]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        className="input-field"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        className="input-field"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                        className="input-field"
                      >
                        <option value="Europe/Amsterdam">Europe/Amsterdam</option>
                        <option value="Europe/London">Europe/London</option>
                        <option value="America/New_York">America/New York</option>
                        <option value="America/Los_Angeles">America/Los Angeles</option>
                        <option value="Asia/Tokyo">Asia/Tokyo</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Email on Export</p>
                          <p className="text-sm text-gray-500">Receive email when orders are exported</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailOnExport}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailOnExport: e.target.checked
                        })}
                        className="w-5 h-5 text-[rgb(var(--color-primary))]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Error Notifications</p>
                          <p className="text-sm text-gray-500">Alert when errors occur</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailOnError}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailOnError: e.target.checked
                        })}
                        className="w-5 h-5 text-[rgb(var(--color-primary))]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Weekly Reports</p>
                          <p className="text-sm text-gray-500">Receive weekly performance summary</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailWeeklyReport}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailWeeklyReport: e.target.checked
                        })}
                        className="w-5 h-5 text-[rgb(var(--color-primary))]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Browser Notifications</p>
                          <p className="text-sm text-gray-500">Show desktop notifications</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.browserNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          browserNotifications: e.target.checked
                        })}
                        className="w-5 h-5 text-[rgb(var(--color-primary))]"
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Export Settings Tab */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Configuration</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Auto-Fulfillment</p>
                          <p className="text-sm text-gray-500">Automatically mark orders as fulfilled after export</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportSettings.autoFulfillment}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          autoFulfillment: e.target.checked
                        })}
                        className="w-5 h-5 text-[rgb(var(--color-primary))]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">Include Order Notes</p>
                          <p className="text-sm text-gray-500">Export customer notes with orders</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={exportSettings.includeNotes}
                        onChange={(e) => setExportSettings({
                          ...exportSettings,
                          includeNotes: e.target.checked
                        })}
                        className="w-5 h-5 text-[rgb(var(--color-primary))]"
                      />
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date Format
                      </label>
                      <select
                        value={exportSettings.dateFormat}
                        onChange={(e) => setExportSettings({ ...exportSettings, dateFormat: e.target.value })}
                        className="input-field"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Name Pattern
                      </label>
                      <input
                        type="text"
                        value={exportSettings.fileNamePattern}
                        onChange={(e) => setExportSettings({ ...exportSettings, fileNamePattern: e.target.value })}
                        className="input-field"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Variables: {`{{date}}, {{store}}, {{count}}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-800">Change Password</p>
                          <p className="text-sm text-yellow-700 mt-1">
                            To change your password, please contact your administrator.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                        <span className="badge badge-orange">Coming Soon</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security to your account with 2FA.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">Active Sessions</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <Monitor className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Current Session</p>
                              <p className="text-xs text-gray-500">Active now • Netherlands</p>
                            </div>
                          </div>
                          <span className="badge badge-green">Active</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium text-gray-900 mb-3">API Keys</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Manage API keys for external integrations
                      </p>
                      <button className="btn-secondary">
                        <Key className="w-4 h-4 mr-2" />
                        Manage API Keys
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTheme('light')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === 'light'
                              ? 'border-[rgb(var(--color-primary))] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Sun className="w-5 h-5 mx-auto mb-2 text-yellow-500" />
                          <p className="text-sm font-medium">Light</p>
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === 'dark'
                              ? 'border-[rgb(var(--color-primary))] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Moon className="w-5 h-5 mx-auto mb-2 text-gray-700" />
                          <p className="text-sm font-medium">Dark</p>
                        </button>
                        <button
                          onClick={() => setTheme('system')}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            theme === 'system'
                              ? 'border-[rgb(var(--color-primary))] bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Monitor className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                          <p className="text-sm font-medium">System</p>
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800">Ahrefs-Inspired Design</p>
                          <p className="text-sm text-blue-700 mt-1">
                            This application uses a clean, professional design inspired by Ahrefs.
                            The color scheme features the signature blue (#1e5fff) and orange (#ff6b00) accents.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
