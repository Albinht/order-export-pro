'use client';

import { useState } from 'react';
import { X, Package, Truck } from 'lucide-react';

interface FulfillmentModalProps {
  order: any;
  onClose: () => void;
  onFulfill: (orderId: string, tracking?: { number: string; company: string }) => Promise<void>;
}

export default function FulfillmentModal({ order, onClose, onFulfill }: FulfillmentModalProps) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCompany, setTrackingCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFulfill = async () => {
    setLoading(true);
    try {
      const tracking = trackingNumber ? {
        number: trackingNumber,
        company: trackingCompany || 'Other'
      } : undefined;
      
      await onFulfill(order.id, tracking);
      onClose();
    } catch (error) {
      console.error('Fulfillment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const carriers = [
    'DHL',
    'DPD', 
    'PostNL',
    'UPS',
    'FedEx',
    'TNT',
    'GLS',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Fulfill Order #{order.order_number}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Customer:</p>
            <p className="font-medium">
              {order.customer?.first_name} {order.customer?.last_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Items to fulfill:</p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {order.line_items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span className="text-gray-600">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Truck className="inline w-4 h-4 mr-1" />
              Tracking Information (Optional)
            </label>
            
            <input
              type="text"
              placeholder="Tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            />

            <select
              value={trackingCompany}
              onChange={(e) => setTrackingCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select carrier</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleFulfill}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Fulfill Order'}
          </button>
        </div>
      </div>
    </div>
  );
}
