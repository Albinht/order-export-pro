'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Check, Trash2, ChevronDown, Globe, ShoppingBag } from 'lucide-react';

interface Store {
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

interface StoreSelectorProps {
  selectedStoreId: string | null;
  onStoreSelect: (storeId: string | null) => void;
}

export default function StoreSelector({ selectedStoreId, onStoreSelect }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newStore, setNewStore] = useState({ 
    name: '', 
    domain: '', 
    platform: 'shopify',
    accessToken: '',
    consumerKey: '',
    consumerSecret: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      const fetchedStores: Store[] = data.stores || [];
      setStores(fetchedStores);

      if (!selectedStoreId && fetchedStores.length > 0) {
        onStoreSelect(fetchedStores[0].id);
      } else if (selectedStoreId) {
        const exists = fetchedStores.some(store => store.id === selectedStoreId);
        if (!exists) {
          onStoreSelect(fetchedStores.length > 0 ? fetchedStores[0].id : null);
        }
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStore),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.store) {
          await fetchStores();
          setNewStore({ 
            name: '', 
            domain: '', 
            platform: 'shopify',
            accessToken: '',
            consumerKey: '',
            consumerSecret: ''
          });
          setShowAddForm(false);
          onStoreSelect(data.store.id);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add store');
      }
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Failed to add store');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    const storeToDelete = stores.find(s => s.id === id);
    
    if (stores.length === 1) {
      alert('Je kunt de laatste store niet verwijderen. Er moet minimaal één store zijn.');
      return;
    }
    
    if (!confirm(`Weet je zeker dat je "${storeToDelete?.name}" wilt verwijderen?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/stores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStores();
      } else {
        const error = await response.json();
        alert(error.error || 'Kon store niet verwijderen');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Er ging iets mis bij het verwijderen van de store');
    }
  };

  const selectedStore = stores.find(s => s.id === selectedStoreId);

  return (
    <div className="relative">
      {/* Main Dropdown Button - Ahrefs Style */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-all group"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        {selectedStore ? (
          <>
            <span className="font-medium text-gray-900">{selectedStore.name}</span>
            {selectedStore.platform && (
              <span className={`
                px-2 py-0.5 rounded text-xs font-bold uppercase
                ${selectedStore.platform === 'shopify' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-purple-100 text-purple-700'}
              `}>
                {selectedStore.platform === 'shopify' ? 'SH' : 'WC'}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-500">Select Store</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Store List */}
          <div className="max-h-64 overflow-y-auto">
            {stores.map(store => (
              <div
                key={store.id}
                className={`
                  flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors
                  ${selectedStoreId === store.id ? 'bg-blue-50' : ''}
                `}
                onClick={() => {
                  onStoreSelect(store.id);
                  setShowDropdown(false);
                }}
              >
                <div className="flex items-center gap-3">
                  {selectedStoreId === store.id && (
                    <Check className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{store.name}</span>
                      {store.platform && (
                        <span className={`
                          px-1.5 py-0.5 rounded text-xs font-bold uppercase
                          ${store.platform === 'shopify' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-purple-100 text-purple-700'}
                        `}>
                          {store.platform === 'shopify' ? 'SH' : 'WC'}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{store.domain}</span>
                  </div>
                </div>
                {stores.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteStore(store.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors group"
                    title={`Delete ${store.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Store Button */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 text-[rgb(var(--color-primary))] hover:bg-blue-50 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add New Store
            </button>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Store</h3>
            
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Platform
                </label>
                <select
                  value={newStore.platform}
                  onChange={(e) => setNewStore({ ...newStore, platform: e.target.value })}
                  className="input-field"
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
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
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
                  value={newStore.domain}
                  onChange={(e) => setNewStore({ ...newStore, domain: e.target.value })}
                  className="input-field"
                  placeholder={newStore.platform === 'shopify' ? 'my-store.myshopify.com' : 'mystore.com'}
                />
              </div>

              {newStore.platform === 'shopify' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Token
                  </label>
                  <input
                    type="password"
                    required
                    value={newStore.accessToken}
                    onChange={(e) => setNewStore({ ...newStore, accessToken: e.target.value })}
                    className="input-field"
                    placeholder="shpat_..."
                  />
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumer Key
                    </label>
                    <input
                      type="text"
                      required
                      value={newStore.consumerKey}
                      onChange={(e) => setNewStore({ ...newStore, consumerKey: e.target.value })}
                      className="input-field"
                      placeholder="ck_..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Consumer Secret
                    </label>
                    <input
                      type="password"
                      required
                      value={newStore.consumerSecret}
                      onChange={(e) => setNewStore({ ...newStore, consumerSecret: e.target.value })}
                      className="input-field"
                      placeholder="cs_..."
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Adding...' : 'Add Store'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStore({ 
                      name: '', 
                      domain: '', 
                      platform: 'shopify',
                      accessToken: '',
                      consumerKey: '',
                      consumerSecret: ''
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
