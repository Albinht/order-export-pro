'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, Edit2, Trash2, Check, X, Store, Globe, Key, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreData {
  id: string;
  name: string;
  domain: string;
  platform: 'shopify' | 'woocommerce';
  accessToken?: string;
  consumerKey?: string;
  consumerSecret?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStore, setEditingStore] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    platform: 'shopify' as 'shopify' | 'woocommerce',
    accessToken: '',
    consumerKey: '',
    consumerSecret: '',
    isActive: true,
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/stores');
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.stores || []);
    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingStore ? '/api/stores' : '/api/stores';
      const method = editingStore ? 'PUT' : 'POST';
      const body = editingStore 
        ? { ...formData, id: editingStore }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(editingStore ? 'Store updated!' : 'Store added!');
        await fetchStores();
        resetForm();
      } else {
        toast.error(result.error || 'Failed to save store');
      }
    } catch (error) {
      toast.error('Failed to save store');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this store?')) return;

    try {
      const response = await fetch(`/api/stores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Store deleted');
        await fetchStores();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete store');
      }
    } catch (error) {
      toast.error('Failed to delete store');
    }
  };

  const handleEdit = (store: StoreData) => {
    setFormData({
      name: store.name,
      domain: store.domain,
      platform: store.platform,
      accessToken: store.accessToken || '',
      consumerKey: store.consumerKey || '',
      consumerSecret: store.consumerSecret || '',
      isActive: store.isActive,
    });
    setEditingStore(store.id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      domain: '',
      platform: 'shopify',
      accessToken: '',
      consumerKey: '',
      consumerSecret: '',
      isActive: true,
    });
    setEditingStore(null);
    setShowAddForm(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
            <p className="mt-2 text-gray-600">
              Manage your connected e-commerce stores
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Store
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingStore ? 'Edit Store' : 'Add New Store'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field w-full"
                    placeholder="My Shopify Store"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform *
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value as 'shopify' | 'woocommerce' })}
                    className="input-field w-full"
                  >
                    <option value="shopify">Shopify</option>
                    <option value="woocommerce">WooCommerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Domain *
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="input-field w-full"
                    placeholder="mystore.myshopify.com"
                    required
                  />
                </div>

                {formData.platform === 'shopify' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Access Token *
                    </label>
                    <input
                      type="password"
                      value={formData.accessToken}
                      onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                      className="input-field w-full"
                      placeholder="shpat_xxxxx"
                      required
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consumer Key *
                      </label>
                      <input
                        type="text"
                        value={formData.consumerKey}
                        onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                        className="input-field w-full"
                        placeholder="ck_xxxxx"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Consumer Secret *
                      </label>
                      <input
                        type="password"
                        value={formData.consumerSecret}
                        onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                        className="input-field w-full"
                        placeholder="cs_xxxxx"
                        required
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Store is active
                </label>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  {editingStore ? 'Update Store' : 'Add Store'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stores List */}
        {loading ? (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
              <Store className="w-6 h-6 text-gray-400 animate-pulse" />
            </div>
            <p className="text-gray-500">Loading stores...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Stores Connected</h3>
            <p className="text-gray-500 mb-4">
              Add your first store to start managing orders.
            </p>
            {!showAddForm && (
              <button onClick={() => setShowAddForm(true)} className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Store
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div key={store.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      store.platform === 'shopify' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Store className={`w-5 h-5 ${
                        store.platform === 'shopify' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      <p className="text-xs text-gray-500 capitalize">{store.platform}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    store.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="w-4 h-4 mr-2" />
                    <span className="truncate">{store.domain}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Key className="w-4 h-4 mr-2" />
                    <span className="text-xs">
                      {store.platform === 'shopify' 
                        ? `Token: ${store.accessToken?.substring(0, 10)}...`
                        : `Key: ${store.consumerKey?.substring(0, 10)}...`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(store)}
                    className="flex-1 btn-secondary text-sm"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(store.id)}
                    className="flex-1 btn-secondary text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
