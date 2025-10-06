'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/utils/date';
import { Shield, Search, Filter, Download, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  userId?: string;
  user?: { username: string };
  action: string;
  resource?: string;
  resourceId?: string;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    resource: '',
    success: '',
    search: ''
  });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (page * pageSize).toString(),
        ...filter
      });
      
      const response = await fetch(`/api/audit-logs?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes('FAILED') || action.includes('LOCKED')) return 'text-red-600 bg-red-50';
    if (action.includes('UPDATE') || action.includes('CHANGE')) return 'text-yellow-600 bg-yellow-50';
    if (action.includes('CREATE') || action.includes('ENABLED')) return 'text-green-600 bg-green-50';
    if (action.includes('DELETE') || action.includes('DISABLED')) return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getActionIcon = (success: boolean) => {
    if (success) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const exportLogs = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Resource', 'IP Address', 'Success', 'Details'].join(','),
      ...logs.map(log => [
        formatDate(log.createdAt),
        log.user?.username || 'System',
        log.action,
        log.resource || '',
        log.ipAddress || '',
        log.success ? 'Yes' : 'No',
        JSON.stringify(log.details || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-[rgb(var(--color-primary))]" />
          <h2 className="text-xl font-semibold">Security Audit Log</h2>
        </div>
        <button
          onClick={exportLogs}
          className="btn-secondary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
            />
          </div>

          <select
            value={filter.action}
            onChange={(e) => setFilter({ ...filter, action: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="EXPORT_ORDERS">Export</option>
            <option value="2FA_ENABLED">2FA Enabled</option>
            <option value="2FA_FAILED">2FA Failed</option>
          </select>

          <select
            value={filter.resource}
            onChange={(e) => setFilter({ ...filter, resource: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
          >
            <option value="">All Resources</option>
            <option value="orders">Orders</option>
            <option value="stores">Stores</option>
            <option value="security">Security</option>
            <option value="settings">Settings</option>
          </select>

          <select
            value={filter.success}
            onChange={(e) => setFilter({ ...filter, success: e.target.value })}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
          >
            <option value="">All Results</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user?.username || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.resource || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionIcon(log.success)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.errorMessage ? (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="w-3 h-3" />
                          {log.errorMessage}
                        </div>
                      ) : log.details ? (
                        <details className="cursor-pointer">
                          <summary className="text-[rgb(var(--color-primary))] hover:underline">
                            View details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > pageSize && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, total)} of {total} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={(page + 1) * pageSize >= total}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
