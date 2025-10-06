'use client';

import { useState, useEffect } from 'react';
import { Download, Clock, Package } from 'lucide-react';

interface ExportRecord {
  id: string;
  filename: string;
  orderCount: number;
  orderIds: string;
  exportedAt: string;
  store: {
    name: string;
  };
}

interface ExportHistoryProps {
  storeId: string | null;
}

export default function ExportHistory({ storeId }: ExportHistoryProps) {
  const [history, setHistory] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (storeId) {
      fetchHistory();
    }
  }, [storeId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = storeId ? `?storeId=${storeId}` : '';
      const response = await fetch(`/api/export-history${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching export history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Export History</h2>
        </div>
        <p className="text-sm text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Export History</h2>
        </div>
        <p className="text-sm text-gray-500">No exports yet for this store.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold text-gray-900">Export History</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Store
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Filename
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order IDs
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((record) => {
              const orderIds = JSON.parse(record.orderIds);
              return (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(record.exportedAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.store.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {record.filename}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {record.orderCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="max-w-xs truncate" title={orderIds.join(', ')}>
                      {orderIds.slice(0, 3).join(', ')}
                      {orderIds.length > 3 && ` +${orderIds.length - 3} more`}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
