'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { formatDate, formatTime } from '@/utils/date';
import { 
  FileSpreadsheet, 
  Download, 
  Calendar,
  Clock,
  Package,
  Store,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface ExportRecord {
  id: string;
  createdAt?: string;
  exportedAt?: string; // From database
  orderCount: number;
  storeId: string;
  storeName?: string;
  store?: { name: string }; // From database include
  filename?: string; // From database
  fileName?: string; // For UI
  status?: 'success' | 'failed' | 'processing';
  fileSize?: string;
  exportedBy?: string;
}

export default function ExportsPage() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStore, setFilterStore] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetchExports();
    fetchStores();
  }, []);

  const fetchExports = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/export-history');
      if (response.ok) {
        const data = await response.json();
        // Map database fields to UI fields
        const mappedData = data.map((item: any) => ({
          ...item,
          createdAt: item.exportedAt || item.createdAt,
          fileName: item.filename || item.fileName,
          storeName: item.store?.name || item.storeName || 'Unknown Store',
          status: item.status || 'success', // Default to success if not specified
        }));
        setExports(mappedData);
      }
    } catch (error) {
      console.error('Error fetching exports:', error);
      toast.error('Failed to load export history');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this export record?')) return;

    try {
      const response = await fetch(`/api/export-history?id=${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Export record deleted');
        fetchExports();
      } else {
        toast.error('Failed to delete export record');
      }
    } catch (error) {
      toast.error('Error deleting export record');
    }
  };

  // Filter exports
  const filteredExports = exports.filter(exp => {
    const matchesSearch = searchTerm === '' || 
      (exp.fileName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.storeName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === 'all' || exp.storeId === filterStore;
    const matchesStatus = filterStatus === 'all' || exp.status === filterStatus;
    
    return matchesSearch && matchesStore && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalExports: exports.length,
    successfulExports: exports.filter(e => !e.status || e.status === 'success').length,
    totalOrders: exports.reduce((sum, e) => sum + (e.orderCount || 0), 0),
    avgOrdersPerExport: exports.length > 0 
      ? Math.round(exports.reduce((sum, e) => sum + (e.orderCount || 0), 0) / exports.length)
      : 0
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Export History</h1>
            <p className="text-gray-600 mt-1">View and manage your order export history</p>
          </div>
          <button
            onClick={fetchExports}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exports</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalExports}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-[rgb(var(--color-primary))]" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.successfulExports}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-[rgb(var(--color-orange))]" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Orders/Export</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgOrdersPerExport}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exports..."
                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20 focus:border-[rgb(var(--color-primary))]"
              />
            </div>

            {/* Store Filter */}
            <select
              value={filterStore}
              onChange={(e) => setFilterStore(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
            >
              <option value="all">All Stores</option>
              {stores.map(store => (
                <option key={store.id} value={store.id}>{store.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="processing">Processing</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Export Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Loading export history...
                    </div>
                  </td>
                </tr>
              ) : filteredExports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>No export records found</p>
                  </td>
                </tr>
              ) : (
                filteredExports.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(exp.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(exp.createdAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exp.fileName || 'Unnamed Export'}</div>
                        {exp.fileSize && (
                          <div className="text-xs text-gray-500">{exp.fileSize}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{exp.storeName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{exp.orderCount || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {!exp.status || exp.status === 'success' ? (
                        <span className="badge badge-green">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </span>
                      ) : exp.status === 'failed' ? (
                        <span className="badge badge-red">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </span>
                      ) : (
                        <span className="badge badge-orange">
                          <Clock className="w-3 h-3 mr-1" />
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
