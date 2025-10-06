'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TwoFactorSetup from '@/components/TwoFactorSetup';
import AuditLog from '@/components/AuditLog';
import { Shield, Key, Globe, Clock, Users, Activity, Lock } from 'lucide-react';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState('2fa');

  const tabs = [
    { id: '2fa', label: 'Two-Factor Auth', icon: Key },
    { id: 'audit', label: 'Audit Log', icon: Activity },
    { id: 'sessions', label: 'Sessions', icon: Users },
    { id: 'ip', label: 'IP Security', icon: Globe },
    { id: 'password', label: 'Password Policy', icon: Lock },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-[rgb(var(--color-primary))]" />
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Security Settings</h1>
            <p className="text-gray-500 mt-1">Manage security settings and monitor activity</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[rgb(var(--color-primary))] text-[rgb(var(--color-primary))]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === '2fa' && <TwoFactorSetup />}
          
          {activeTab === 'audit' && <AuditLog />}
          
          {activeTab === 'sessions' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on macOS • 127.0.0.1</p>
                      <p className="text-xs text-gray-400">Last active: Just now</p>
                    </div>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'ip' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">IP Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IP Whitelist
                  </label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
                    rows={4}
                    placeholder="Enter IP addresses (one per line)&#10;Example:&#10;192.168.1.1&#10;10.0.0.0/24"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to allow all IPs. Supports CIDR notation.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rate Limiting
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      className="w-24 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
                      defaultValue={100}
                    />
                    <span className="text-gray-600">requests per minute</span>
                  </div>
                </div>

                <button className="btn-primary">Save IP Settings</button>
              </div>
            </div>
          )}
          
          {activeTab === 'password' && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Password Policy</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  <span>Require minimum 8 characters</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  <span>Require uppercase letter</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  <span>Require lowercase letter</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  <span>Require number</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  <span>Require special character</span>
                </label>

                <div className="pt-4">
                  <button className="btn-primary">Update Password Policy</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
