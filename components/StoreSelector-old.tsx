'use client';

import { useState, useEffect } from 'react';
import { Store } from '@prisma/client';
import { Plus, X, Check, Trash2 } from 'lucide-react';

interface StoreSelectorProps {
  selectedStoreId: string | null;
  onStoreSelect: (storeId: string | null) => void;
}

export default function StoreSelector({ selectedStoreId, onStoreSelect }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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
    initAndFetchStores();
  }, []);

  const initAndFetchStores = async () => {
    // Initialize default store if needed
    await fetch('/api/init');
    // Then fetch all stores
    await fetchStores();
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      if (response.ok) {
        const data = await response.json();
        setStores(data);
        
        // Auto-select first store if none selected
        if (!selectedStoreId && data.length > 0) {
          onStoreSelect(data[0].id);
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
        const store = await response.json();
        setStores([...stores, store]);
        setNewStore({ 
          name: '', 
          domain: '', 
          platform: 'shopify',
          accessToken: '',
          consumerKey: '',
          consumerSecret: ''
        });
        setShowAddForm(false);
        onStoreSelect(store.id);
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
    
    // Don't allow deleting the last store
    if (stores.length === 1) {
      alert('Je kunt de laatste store niet verwijderen. Er moet minimaal één store zijn.');
      return;
    }
    
    if (!confirm(`Weet je zeker dat je "${storeToDelete?.name}" wilt verwijderen?\n\nAlle export geschiedenis en order statussen voor deze store worden ook verwijderd.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/stores?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStores(stores.filter(s => s.id !== id));
        if (selectedStoreId === id) {
          onStoreSelect(stores.find(s => s.id !== id)?.id || null);
        }
      } else {
        const error = await response.json();
        alert(error.error || 'Kon store niet verwijderen');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Er ging iets mis bij het verwijderen van de store');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Active Store</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Store
        </button>
      </div>

      {/* Store Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {stores.map(store => (
          <div
            key={store.id}
            className={`relative group flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
              selectedStoreId === store.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
            onClick={() => onStoreSelect(store.id)}
          >
            {selectedStoreId === store.id && <Check className="w-3 h-3" />}
            <span className="text-sm font-medium">{store.name}</span>
            {store.platform === 'woocommerce' && (
              <span className="text-xs bg-purple-500 text-white px-1.5 py-0.5 rounded">WC</span>
            )}
            {store.platform === 'shopify' && (
              <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded">SH</span>
            )}
            {stores.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteStore(store.id);
                }}
                className={`ml-1 p-0.5 rounded-full transition-all ${
                  selectedStoreId === store.id 
                    ? 'hover:bg-blue-700' 
                    : 'hover:bg-gray-300'
                } opacity-0 group-hover:opacity-100`}
                title={`Verwijder ${store.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {stores.length === 0 && !showAddForm && (
          <p className="text-sm text-gray-500">No stores configured yet.</p>
        )}
      </div>

      {/* Add Store Form */}
      {showAddForm && (
        <form onSubmit={handleAddStore} className="border-t pt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Platform
            </label>
            <select
              value={newStore.platform}
              onChange={(e) => setNewStore({ ...newStore, platform: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cs_..."
                />
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
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
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
