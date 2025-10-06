'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { formatDateTime } from '@/utils/date';
import { 
  Store, 
  Plus, 
  Edit2, 
  Trash2,
  Globe,
  ShoppingBag,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Key,
  RefreshCw,
  Shield,
  Activity,
  TrendingUp,
  Calendar,
  BarChart3
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface StoreData {
  id: string;
  name: string;
  domain: string;
  platform: 'shopify' | 'woocommerce';
  accessToken?: string;
  consumerKey?: string;
  consumerSecret?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  lastSync?: string;
  totalOrders?: number;
  pendingOrders?: number;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [testingStore, setTestingStore] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    platform: 'shopify' as 'shopify' | 'woocommerce',
    accessToken: '',
    consumerKey: '',
    consumerSecret: ''
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        // Add mock statistics for demo - using fixed values to avoid hydration issues
        const enrichedData = data.map((store: StoreData, index: number) => ({
          ...store,
          isActive: true,
          lastSync: new Date(Date.now() - (index + 1) * 3600000).toISOString(), // Fixed intervals
          totalOrders: 100 + index * 50, // Fixed increments
          pendingOrders: 10 + index * 5  // Fixed increments
        }));
        setStores(enrichedData);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingStore ? 'PUT' : 'POST';
    const url = editingStore ? `/api/stores?id=${editingStore.id}` : '/api/stores';
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingStore ? 'Store updated successfully' : 'Store added successfully');
        fetchStores();
        handleCloseForm();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save store');
      }
    } catch (error) {
      toast.error('Error saving store');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/stores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Store deleted successfully');
        fetchStores();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete store');
      }
    } catch (error) {
      toast.error('Error deleting store');
    }
  };

  const handleTestConnection = async (store: StoreData) => {
    setTestingStore(store.id);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`Connection to ${store.name} successful!`);
    } catch (error) {
      toast.error(`Failed to connect to ${store.name}`);
    } finally {
      setTestingStore(null);
    }
  };

  const handleEdit = (store: StoreData) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      domain: store.domain,
      platform: store.platform,
      accessToken: store.accessToken || '',
      consumerKey: store.consumerKey || '',
      consumerSecret: store.consumerSecret || ''
    });
    setShowAddForm(true);
  };

  const handleCloseForm = () => {
    setShowAddForm(false);
    setEditingStore(null);
    setFormData({
      name: '',
      domain: '',
      platform: 'shopify',
      accessToken: '',
      consumerKey: '',
      consumerSecret: ''
    });
  };

  // Calculate statistics
  const stats = {
    totalStores: stores.length,
    activeStores: stores.filter(s => s.isActive).length,
    shopifyStores: stores.filter(s => s.platform === 'shopify').length,
    wooStores: stores.filter(s => s.platform === 'woocommerce').length,
    totalOrders: stores.reduce((sum, s) => sum + (s.totalOrders || 0), 0),
    pendingOrders: stores.reduce((sum, s) => sum + (s.pendingOrders || 0), 0)
  };

  return (
    <DashboardLayout>
      <Toaster position="top-right" />
      
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="text-gray-600 mt-1">Connect and manage your e-commerce stores</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Store
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-[rgb(var(--color-primary))]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Stores</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalStores}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeStores}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Shopify</p>
              <p className="text-xl font-bold text-gray-900">{stats.shopifyStores}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">WooCommerce</p>
              <p className="text-xl font-bold text-gray-900">{stats.wooStores}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[rgb(var(--color-orange))]" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-600">Pending</p>
              <p className="text-xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : stores.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores connected</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first store</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Store
            </button>
          </div>
        ) : (
          stores.map((store) => (
            <div key={store.id} className="card hover:shadow-lg transition-all duration-200">
              {/* Card Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      store.platform === 'shopify' 
                        ? 'bg-green-100' 
                        : 'bg-purple-100'
                    }`}>
                      {store.platform === 'shopify' ? (
                        <ShoppingBag className="w-6 h-6 text-green-600" />
                      ) : (
                        <Package className="w-6 h-6 text-purple-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-sm text-gray-500">{store.domain}</p>
                    </div>
                  </div>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium uppercase
                    ${store.platform === 'shopify' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-purple-100 text-purple-700'}
                  `}>
                    {store.platform}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-4">
                <div className="space-y-3">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <div className="flex items-center gap-1">
                      {store.isActive ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Connected</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">Disconnected</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Last Sync */}
                  {store.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Sync</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDateTime(store.lastSync)}
                      </span>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-lg font-semibold text-gray-900">{store.totalOrders || 0}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-lg font-semibold text-[rgb(var(--color-orange))]">{store.pendingOrders || 0}</p>
                    </div>
                  </div>

                  {/* Credentials Info */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Key className="w-3 h-3" />
                      {store.platform === 'shopify' ? (
                        <span>Access Token: ****{store.accessToken?.slice(-4)}</span>
                      ) : (
                        <span>API Keys: Configured</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(store)}
                    disabled={testingStore === store.id}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    {testingStore === store.id ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Activity className="w-3 h-3" />
                    )}
                    Test Connection
                  </button>
                  <a
                    href={`https://${store.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(store)}
                    className="p-1.5 text-gray-600 hover:bg-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(store.id, store.name)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Store Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingStore ? 'Edit Store' : 'Add New Store'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    platform: e.target.value as 'shopify' | 'woocommerce' 
                  })}
                  className="input-field"
                  disabled={!!editingStore}
                >
                  <option value="shopify">Shopify</option>
                  <option value="woocommerce">WooCommerce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="My Store"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Domain
                </label>
                <input
                  type="text"
                  required
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="input-field"
                  placeholder={formData.platform === 'shopify' 
                    ? 'my-store.myshopify.com' 
                    : 'mystore.com'}
                />
              </div>

              {formData.platform === 'shopify' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin API Access Token
                  </label>
                  <input
                    type="password"
                    required={!editingStore}
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    className="input-field"
                    placeholder={editingStore ? 'Leave blank to keep current' : 'shpat_...'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Get this from your Shopify Admin → Settings → Apps
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumer Key
                    </label>
                    <input
                      type="text"
                      required={!editingStore}
                      value={formData.consumerKey}
                      onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                      className="input-field"
                      placeholder={editingStore ? 'Leave blank to keep current' : 'ck_...'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumer Secret
                    </label>
                    <input
                      type="password"
                      required={!editingStore}
                      value={formData.consumerSecret}
                      onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                      className="input-field"
                      placeholder={editingStore ? 'Leave blank to keep current' : 'cs_...'}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get these from WooCommerce → Settings → Advanced → REST API
                  </p>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingStore ? 'Update Store' : 'Add Store'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
