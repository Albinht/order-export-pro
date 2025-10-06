'use client';

import { useState, useEffect } from 'react';
import { ShopifyOrder } from '@/types/shopify';
import { exportToExcel, prepareExportData, generateFilename } from '@/utils/excel-export';
import { exportToExcelWithStyling } from '@/utils/excel-export-styled';
import { getTodayDate, formatDisplayDate } from '@/utils/export-helpers';
import { hasCustomUpload } from '@/utils/upload-helpers';
import { updateFaviconBadge, animateFaviconForUploads, stopFaviconAnimation } from '@/utils/favicon-badge';
import StoreSelector from '@/components/StoreSelector';
import ExportHistory from '@/components/ExportHistory';
import OrderTable from '@/components/OrderTable';
import DashboardLayout from '@/components/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  Filter,
  Search,
  Calendar,
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Camera,
  Eye
} from 'lucide-react';

export default function Home() {
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [orders, setOrders] = useState<ShopifyOrder[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showHistory, setShowHistory] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [stores, setStores] = useState<any[]>([]);

  // Get current store
  const currentStore = stores.find(s => s.id === selectedStoreId);

  // Calculate upload statistics
  const uploadsCount = orders.reduce((sum, order) => 
    sum + order.line_items.filter(item => hasCustomUpload(item.properties)).length, 0
  );
  
  const ordersWithUploadsCount = orders.filter(order => 
    order.line_items.some(item => hasCustomUpload(item.properties))
  ).length;

  // Update tab title with upload count
  useEffect(() => {
    const baseTitle = 'Order Export Pro';
    if (uploadsCount > 0) {
      document.title = `📸 (${uploadsCount}) ${baseTitle} - ${ordersWithUploadsCount} orders with uploads`;
    } else if (orders.length > 0) {
      document.title = `(${orders.length}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [orders, uploadsCount, ordersWithUploadsCount]);

  // Update favicon with upload badge
  useEffect(() => {
    if (uploadsCount > 0) {
      // Show badge with count
      updateFaviconBadge(uploadsCount);
      // Also animate if there are new uploads
      if (uploadsCount > 0) {
        animateFaviconForUploads(true);
      }
    } else {
      // Remove badge and stop animation
      stopFaviconAnimation();
      updateFaviconBadge(0);
    }
    
    // Cleanup on unmount
    return () => {
      stopFaviconAnimation();
    };
  }, [uploadsCount]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && selectedStoreId) {
      const interval = setInterval(() => {
        fetchOrders(false);
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedStoreId]);

  const fetchOrders = async (showLoading = true) => {
    if (!selectedStoreId) {
      toast.error('Please select or add a store first');
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      let url = `/api/orders?storeId=${selectedStoreId}`;
      if (startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setProductImages(data.productImages || {});
      setSelectedOrders(new Set());

      if (showLoading) {
        toast.success(`Loaded ${data.orders?.length || 0} orders`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const ordersToExport = orders.filter(order => selectedOrders.has(order.id));
    if (ordersToExport.length === 0) {
      toast.error('Please select at least one order to export');
      return;
    }

    const toastId = toast.loading(`Preparing export for ${ordersToExport.length} orders (Date: ${getTodayDate()})...`);
    
    try {
      const exportData = prepareExportData(ordersToExport, productImages);
      // Always use today's date in the filename
      const filename = generateFilename(currentStore?.name);
      // Use styled export with red rows for missing addresses
      await exportToExcelWithStyling(exportData, filename);
      
      toast.dismiss(toastId);
      const today = new Date().toISOString().split('T')[0];
      toast.success(`Export completed! File: ${filename}`, {
        duration: 5000,
        icon: '📁'
      });

      if (selectedStoreId) {
        try {
          await fetch('/api/export-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              storeId: selectedStoreId,
              filename,
              orderCount: ordersToExport.length,
              orderIds: ordersToExport.map(o => o.id),
              exportedBy: 'user'
            })
          });
        } catch (error) {
          console.error('Failed to save export history:', error);
        }
      }

      // Mark orders as fulfilled
      if (selectedStoreId) {
        const toastId = toast.loading('Marking orders as fulfilled in store...');
        try {
          await handleBulkStatusUpdate(ordersToExport, 'fulfilled');
          toast.dismiss(toastId);
          await fetchOrders(false);
        } catch (error) {
          toast.dismiss(toastId);
          console.error('Error marking orders as fulfilled:', error);
          toast.error('Some orders could not be fulfilled - check console');
        }
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };

  const handleBulkStatusUpdate = async (ordersToUpdate: ShopifyOrder[], status: string) => {
    if (!selectedStoreId) return;

    try {
      const response = await fetch('/api/order-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStoreId,
          orderIds: ordersToUpdate.map(o => ({ orderId: o.id, orderNumber: o.name })),
          status,
        }),
      });
      
      const result = await response.json();
      console.log('Bulk update result:', result);
      
      const localOnlyCount = result.results?.filter((r: any) => r.localOnly).length || 0;
      const actuallyFulfilledCount = result.updated - localOnlyCount;
      
      if (localOnlyCount > 0 && actuallyFulfilledCount === 0) {
        toast(`⚠️ ${localOnlyCount} orders alleen lokaal gemarkeerd (API permissies ontbreken)`, {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (localOnlyCount > 0 && actuallyFulfilledCount > 0) {
        toast(`${actuallyFulfilledCount} orders fulfilled in store, ${localOnlyCount} alleen lokaal (permissies ontbreken)`, {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (result.updated > 0) {
        toast.success(`✅ ${result.updated} orders succesvol als fulfilled gemarkeerd`);
      }
      
      if (result.failed > 0) {
        toast.error(`❌ ${result.failed} orders konden niet worden fulfilled`, {
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status - check console for details');
    }
  };

  const handleSelectOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
    }
  };

  const handleUpdateStatus = async (orderId: string, orderNumber: string, status: string) => {
    if (!selectedStoreId) return;

    try {
      await fetch('/api/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: selectedStoreId,
          orderId,
          orderNumber,
          status,
        }),
      });
      
      toast.success(`Order ${orderNumber} marked as ${status}`);
      setOrders(orders.map(o => 
        o.id === orderId 
          ? { ...o, fulfillment_status: status === 'fulfilled' ? 'fulfilled' : o.fulfillment_status }
          : o
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Statistics
  const stats = {
    total: orders.length,
    selected: selectedOrders.size,
    totalValue: orders.reduce((sum, order) => sum + parseFloat(order.total_price || '0'), 0),
    selectedValue: orders
      .filter(o => selectedOrders.has(o.id))
      .reduce((sum, order) => sum + parseFloat(order.total_price || '0'), 0),
    totalItems: orders.reduce((sum, order) => 
      sum + order.line_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    ),
    selectedItems: orders
      .filter(o => selectedOrders.has(o.id))
      .reduce((sum, order) => 
        sum + order.line_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      ),
    ordersWithUploads: orders.filter(order => 
      order.line_items.some(item => hasCustomUpload(item.properties))
    ).length,
    totalUploads: orders.reduce((sum, order) => 
      sum + order.line_items.filter(item => hasCustomUpload(item.properties)).length, 0
    )
  };

  return (
    <DashboardLayout 
      storeName={currentStore?.name} 
      storeType={currentStore?.platform}
    >
      <Toaster position="top-right" />
      
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Orders Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and export your e-commerce orders</p>
          </div>
          
          {/* Store Selector */}
          <StoreSelector
            selectedStoreId={selectedStoreId}
            onStoreSelect={setSelectedStoreId}
          />
        </div>

        {/* Upload Notification Banner */}
        {uploadsCount > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 flex items-center justify-between animate-pulse-soft">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 text-white p-2 rounded-lg">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-green-800">
                  📸 {uploadsCount} Custom Upload{uploadsCount !== 1 ? 's' : ''} Detected!
                </p>
                <p className="text-sm text-green-700">
                  Found in {ordersWithUploadsCount} order{ordersWithUploadsCount !== 1 ? 's' : ''} - These items have customer-uploaded images
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Scroll to first order with upload
                const firstUploadOrder = document.querySelector('[data-has-upload="true"]');
                if (firstUploadOrder) {
                  firstUploadOrder.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Uploads
            </button>
          </div>
        )}

        {/* Statistics Cards - Ahrefs Style */}
        {selectedStoreId && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">
                    {stats.total}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    €{stats.totalValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-[rgb(var(--color-primary))]" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Selected Orders</p>
                  <p className="text-2xl font-bold text-[rgb(var(--color-orange))] mt-1">
                    {stats.selected}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    €{stats.selectedValue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-[rgb(var(--color-orange))]" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">
                    {stats.totalItems}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.selectedItems} selected
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Custom Uploads</p>
                  <p className="text-2xl font-bold text-[rgb(var(--foreground))] mt-1">
                    {stats.totalUploads}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.ordersWithUploads} orders
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Auto Refresh</p>
                  <div className="flex items-center gap-2 mt-1">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
                    </label>
                    {autoRefresh && (
                      <select
                        value={refreshInterval}
                        onChange={(e) => setRefreshInterval(Number(e.target.value))}
                        className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                      >
                        <option value={10}>10s</option>
                        <option value={30}>30s</option>
                        <option value={60}>1m</option>
                        <option value={120}>2m</option>
                        <option value={300}>5m</option>
                      </select>
                    )}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <RefreshCw className={`w-6 h-6 text-purple-600 ${autoRefresh ? 'animate-spin' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        {selectedStoreId && (
          <div className="card p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Left side - Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-field text-sm"
                    placeholder="Start date"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input-field text-sm"
                    placeholder="End date"
                  />
                </div>
                
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="btn-secondary text-sm"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  History
                </button>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-3">
                {/* Today's Date Indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg relative group">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Export Date: {getTodayDate()}</span>
                  <Info className="w-3 h-3 text-blue-500" />
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    All exports automatically use today's date in the filename
                  </div>
                </div>

                <button
                  onClick={() => fetchOrders()}
                  disabled={loading}
                  className="btn-secondary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {loading ? 'Importing...' : 'Import Orders'}
                </button>

                <button
                  onClick={handleExport}
                  disabled={selectedOrders.size === 0}
                  className={`${selectedOrders.size > 0 ? 'btn-orange' : 'btn-secondary opacity-50 cursor-not-allowed'} relative group`}
                  title={`Export selected orders with today's date (${getTodayDate()})`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export {selectedOrders.size > 0 && `(${selectedOrders.size})`}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Date: {getTodayDate()}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export History */}
        {showHistory && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">Export History</h2>
            <ExportHistory storeId={selectedStoreId} />
          </div>
        )}

        {/* Orders Table */}
        {orders.length > 0 && (
          <div className="card">
            <OrderTable
              orders={orders}
              selectedOrders={selectedOrders}
              productImages={productImages}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onUpdateStatus={handleUpdateStatus}
            />
          </div>
        )}

        {/* Empty States */}
        {!loading && orders.length === 0 && selectedStoreId && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders imported</h3>
            <p className="text-gray-500 mb-4">
              Click "Import Orders" to fetch orders from your selected store.
            </p>
            <button onClick={() => fetchOrders()} className="btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Import Orders Now
            </button>
          </div>
        )}

        {!selectedStoreId && (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <ShoppingBag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to OrderExport</h3>
            <p className="text-gray-500 mb-4">
              Please add and select a store to start managing your orders.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
