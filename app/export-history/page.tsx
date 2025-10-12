'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Download, Calendar, Package, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ExportRecord {
  id: string;
  storeId: string;
  filename: string;
  orderCount: number;
  orderIds: string;
  metadata: string | null;
  exportedAt: string;
}

export default function ExportHistoryPage() {
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState<string>('');

  useEffect(() => {
    fetchHistory();
  }, [selectedStore]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = selectedStore 
        ? `/api/export-history?storeId=${selectedStore}`
        : '/api/export-history';
      
      const response = await fetch(url);
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch history:', error);
      toast.error('Failed to load export history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(record => {
    if (!searchTerm) return true;
    return record.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
           record.orderCount.toString().includes(searchTerm);
  });

  const downloadFile = (filename: string) => {
    // In a real app, this would download the actual file
    toast.success(`Download started: ${filename}`);
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    // In-memory storage doesn't support delete, just filter locally
    setHistory(prev => prev.filter(h => h.id !== id));
    toast.success('Record deleted');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Export History</h1>
          <p className="mt-2 text-gray-600">
            View and manage your past order exports
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by filename or order count..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input-field w-full"
              />
            </div>
            <button
              onClick={fetchHistory}
              className="btn-secondary"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* History Table */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <FileText className="w-6 h-6 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-500">Loading export history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Export History</h3>
            <p className="text-gray-500">
              Your export history will appear here after you export orders.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Export Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filename
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Store
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHistory.map((record) => {
                    const orderIds = JSON.parse(record.orderIds || '[]');
                    return (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {format(new Date(record.exportedAt), 'dd MMM yyyy HH:mm')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              {record.filename}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">
                              {record.orderCount || orderIds.length} orders
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {record.storeId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => downloadFile(record.filename)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteRecord(record.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        {filteredHistory.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Exports</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredHistory.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders Exported</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredHistory.reduce((sum, r) => {
                      const ids = JSON.parse(r.orderIds || '[]');
                      return sum + (r.orderCount || ids.length);
                    }, 0)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last Export</p>
                  <p className="text-sm font-medium text-gray-900">
                    {filteredHistory[0] && 
                      format(new Date(filteredHistory[0].exportedAt), 'dd MMM yyyy')}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
