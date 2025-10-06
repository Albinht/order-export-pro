'use client';

import { useState, useEffect } from 'react';
import { ShopifyOrder } from '@/types/shopify';
import { exportToExcel, prepareExportData, generateFilename } from '@/utils/excel-export';
import StoreSelector from '@/components/StoreSelector';
import ExportHistory from '@/components/ExportHistory';
import OrderTable from '@/components/OrderTable';
import { Store as StoreIcon, RefreshCw, Download, CheckCircle, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

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
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && selectedStoreId) {
      const interval = setInterval(() => {
        fetchOrders(false); // fetch without showing loading state
      }, refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, selectedStoreId]);

  // Make test function available globally
  useEffect(() => {
    (window as any).testFulfillOrder = testFulfillment;
    return () => {
      delete (window as any).testFulfillOrder;
    };
  }, []);

  const fetchOrders = async (showLoading = true) => {
    if (!selectedStoreId) {
      toast.error('Please select or add a store first');
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);
    if (showLoading) setSelectedOrders(new Set());

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('storeId', selectedStoreId);
      
      const response = await fetch(`/api/orders?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setProductImages(data.productImages);
      toast.success(`Imported ${data.orders.length} orders`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleExport = async () => {
    const ordersToExport = selectedOrders.size > 0 
      ? orders.filter(order => selectedOrders.has(order.id))
      : orders;

    if (ordersToExport.length === 0) {
      toast.error('Please select orders to export or import orders first.');
      return;
    }

    const imageMap = new Map(Object.entries(productImages));
    const exportData = prepareExportData(ordersToExport, imageMap);
    const filename = generateFilename();
    exportToExcel(exportData, filename);
    
    // Save export history
    if (selectedStoreId) {
      try {
        await fetch('/api/export-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: selectedStoreId,
            filename,
            orderCount: ordersToExport.length,
            orderIds: ordersToExport.map(o => o.name),
          }),
        });
        toast.success(`Exported ${ordersToExport.length} orders`);
      } catch (error) {
        console.error('Failed to save export history:', error);
      }
    }

    // Always mark exported orders as fulfilled in Shopify
    if (selectedStoreId) {
      const toastId = toast.loading('Marking orders as fulfilled in Shopify...');
      try {
        await handleBulkStatusUpdate(ordersToExport, 'fulfilled');
        toast.dismiss(toastId);
        // Refresh orders to show updated status
        await fetchOrders(false);
      } catch (error) {
        toast.dismiss(toastId);
        console.error('Error marking orders as fulfilled:', error);
        toast.error('Some orders could not be fulfilled - check console');
      }
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
      
      // Count local-only fulfillments
      const localOnlyCount = result.results?.filter((r: any) => r.localOnly).length || 0;
      const actuallyFulfilledCount = result.updated - localOnlyCount;
      
      if (localOnlyCount > 0 && actuallyFulfilledCount === 0) {
        toast(`⚠️ ${localOnlyCount} orders alleen lokaal gemarkeerd (API permissies ontbreken)`, {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (localOnlyCount > 0 && actuallyFulfilledCount > 0) {
        toast(`${actuallyFulfilledCount} orders fulfilled in Shopify, ${localOnlyCount} alleen lokaal (permissies ontbreken)`, {
          duration: 6000,
          icon: '⚠️',
        });
      } else if (result.updated > 0) {
        toast.success(`✅ ${result.updated} orders succesvol als fulfilled gemarkeerd in Shopify`);
      }
      
      if (result.failed > 0) {
        toast.error(`❌ ${result.failed} orders konden niet worden fulfilled`, {
          duration: 6000
        });
        const failedOrders = result.results?.filter((r: any) => !r.success);
        console.error('Failed orders:', failedOrders);
        failedOrders?.forEach((failed: any) => {
          console.error(`Order ${failed.orderId} failed:`, failed.error);
        });
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status - check console for details');
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
      
      // Update local state
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

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(orders.map(order => order.id)));
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

  const getTotalItems = () => {
    return orders.reduce((sum, order) => 
      sum + order.line_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
  };

  const getSelectedTotalItems = () => {
    const selectedOrdersList = orders.filter(order => selectedOrders.has(order.id));
    return selectedOrdersList.reduce((sum, order) => 
      sum + order.line_items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
  };

  const testFulfillment = async (orderId: string) => {
    const toastId = toast.loading('Testing fulfillment...');
    try {
      const response = await fetch('/api/test-fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();
      
      console.log('=== Fulfillment Test Result ===');
      console.log('Response:', data);
      console.log('================================');
      
      toast.dismiss(toastId);
      
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.error || data.message || 'Fulfillment test failed');
        console.error('Fulfillment error details:', data.details);
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to test fulfillment');
      console.error(error);
    }
  };

  const testPermissions = async () => {
    const toastId = toast.loading('Testing API permissions...');
    try {
      const response = await fetch('/api/test-permissions');
      const data = await response.json();
      
      console.log('=== API Permissions Test ===');
      console.log('Token Type:', data.tokenType);
      console.log('API Scopes:', data.apiScopes);
      console.log('Locations:', data.locations);
      console.log('Can Fulfill Orders:', data.canFulfill);
      console.log('Fulfillment Test:', data.fulfillmentTest);
      console.log('Test Order:', data.testOrder);
      console.log('===========================');
      
      toast.dismiss(toastId);
      
      if (data.missingScopes?.length > 0) {
        toast.error(`Missing API scopes: ${data.missingScopes.join(', ')}`);
      } else if (data.locations?.length === 0) {
        toast.error('No locations found in your Shopify store');
      } else if (!data.testOrder?.fulfillable) {
        toast('Test order is not fulfillable (may already be fulfilled)', {
          icon: '⚠️',
          duration: 4000,
        });
      } else {
        toast.success('API permissions look good!');
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error('Failed to test permissions');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <StoreIcon className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Shopify Order Export Pro
            </h1>
          </div>
          <p className="text-gray-600">
            Multi-store order management with visual preview and export history
          </p>
        </div>

        {/* Store Selector */}
        <StoreSelector
          selectedStoreId={selectedStoreId}
          onStoreSelect={setSelectedStoreId}
        />

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <button
                  onClick={() => fetchOrders()}
                  disabled={loading || !selectedStoreId}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Importing...' : 'Import Orders'}
                </button>
                <button
                  onClick={handleExport}
                  disabled={orders.length === 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export {selectedOrders.size > 0 ? `${selectedOrders.size} Selected` : 'All'}
                </button>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  {showHistory ? 'Hide' : 'Show'} History
                </button>
                <button
                  onClick={testPermissions}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                  title="Test API Permissions"
                >
                  <Shield className="w-4 h-4" />
                  Test API
                </button>
              </div>
              
              {/* Auto-refresh controls */}
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span>Auto-refresh</span>
                </label>
                {autoRefresh && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">every</span>
                    <select
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value={10}>10 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={120}>2 minutes</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>
                )}
                {autoRefresh && (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Export History */}
        {showHistory && (
          <div className="mb-6">
            <ExportHistory storeId={selectedStoreId} />
          </div>
        )}

        {/* Statistics */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Selected Orders</h3>
              <p className="text-2xl font-bold text-blue-600">{selectedOrders.size}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Selected Items</h3>
              <p className="text-2xl font-bold text-gray-900">{getSelectedTotalItems()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Ready to Export</h3>
              <p className="text-2xl font-bold text-green-600">Yes</p>
            </div>
          </div>
        )}

        {/* Orders Table with Visual Preview */}
        <OrderTable
          orders={orders}
          selectedOrders={selectedOrders}
          productImages={productImages}
          onSelectOrder={handleSelectOrder}
          onSelectAll={handleSelectAll}
          onUpdateStatus={handleUpdateStatus}
        />

        {/* Empty State */}
        {!loading && orders.length === 0 && selectedStoreId && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders imported</h3>
            <p className="mt-1 text-sm text-gray-500">
              Click "Import Orders" to fetch orders from your selected store.
            </p>
          </div>
        )}

        {/* No Store Selected State */}
        {!selectedStoreId && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <StoreIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No store selected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please add and select a Shopify store to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
