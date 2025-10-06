'use client';

import { useState, useMemo } from 'react';
import { ShopifyOrder } from '@/types/shopify';
import { Search, Filter, Eye, CheckCircle, Package, Truck, Image as ImageIcon } from 'lucide-react';

interface OrderTableProps {
  orders: ShopifyOrder[];
  selectedOrders: Set<string>;
  productImages: Record<string, string>;
  onSelectOrder: (orderId: string) => void;
  onSelectAll: () => void;
  onUpdateStatus: (orderId: string, orderNumber: string, status: string) => void;
}

export default function OrderTable({
  orders,
  selectedOrders,
  productImages,
  onSelectOrder,
  onSelectAll,
  onUpdateStatus,
}: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Get uploaded images from order properties
  const getOrderImages = (order: ShopifyOrder): string[] => {
    const images: string[] = [];
    
    order.line_items.forEach(item => {
      // Check for uploadkit or image URLs in properties
      if (item.properties) {
        item.properties.forEach(prop => {
          if (prop.value && (
            prop.value.includes('uploadkit.app') ||
            prop.value.includes('cdn.shopify.com') ||
            prop.value.includes('.jpg') ||
            prop.value.includes('.jpeg') ||
            prop.value.includes('.png') ||
            prop.value.startsWith('http')
          )) {
            images.push(prop.value);
          }
        });
      }
      
      // Add product image as fallback
      if (productImages[item.product_id]) {
        images.push(productImages[item.product_id]);
      }
    });

    return images;
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        order.name.toLowerCase().includes(searchLower) ||
        (order.customer?.first_name?.toLowerCase() || '').includes(searchLower) ||
        (order.customer?.last_name?.toLowerCase() || '').includes(searchLower) ||
        (order.customer?.email?.toLowerCase() || '').includes(searchLower);

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'unfulfilled' && !order.fulfillment_status) ||
        (statusFilter === 'fulfilled' && order.fulfillment_status === 'fulfilled') ||
        (statusFilter === 'partial' && order.fulfillment_status === 'partial');

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const getStatusBadge = (order: ShopifyOrder) => {
    if (!order.fulfillment_status) {
      return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Unfulfilled</span>;
    }
    if (order.fulfillment_status === 'fulfilled') {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Fulfilled</span>;
    }
    if (order.fulfillment_status === 'partial') {
      return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Partial</span>;
    }
    return null;
  };

  return (
    <>
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders, customers, emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="partial">Partially Fulfilled</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
          </div>
        </div>
      </div>

      {/* Orders Table with Images */}
      {filteredOrders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
            <button
              onClick={onSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedOrders.size === orders.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === orders.length && orders.length > 0}
                      onChange={onSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const images = getOrderImages(order);
                  const hasUploads = images.some(img => img.includes('uploadkit.app'));
                  
                  return (
                    <tr key={order.id} className={`hover:bg-gray-50 ${selectedOrders.has(order.id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedOrders.has(order.id)}
                          onChange={() => onSelectOrder(order.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {images.length > 0 ? (
                            <>
                              <div className="flex -space-x-2">
                                {images.slice(0, 3).map((img, idx) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt=""
                                    className="w-10 h-10 rounded-lg border-2 border-white object-cover cursor-pointer hover:z-10 hover:scale-110 transition-transform"
                                    onClick={() => setImagePreview(img)}
                                  />
                                ))}
                              </div>
                              {images.length > 3 && (
                                <span className="text-xs text-gray-500">+{images.length - 3}</span>
                              )}
                              {hasUploads && (
                                <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">
                                  Upload
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.name}</div>
                        <div className="text-xs text-gray-500">ID: {order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.customer ? `${order.customer.first_name} ${order.customer.last_name}` : 'Guest'}
                        </div>
                        <div className="text-xs text-gray-500">{order.customer?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          {order.line_items.map((item, idx) => (
                            <div key={idx} className="text-xs mb-1">
                              <span className="font-medium">{item.quantity}x</span> {item.title}
                              {item.variant_title && item.variant_title !== 'Default Title' && (
                                <span className="text-gray-500"> - {item.variant_title}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.currency} {order.total_price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onUpdateStatus(order.id, order.name, 'fulfilled')}
                            className="text-green-600 hover:text-green-800"
                            title="Mark as Fulfilled"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              console.log(`Testing fulfillment for order ${order.id}`);
                              (window as any).testFulfillOrder?.(order.id);
                            }}
                            className="text-orange-600 hover:text-orange-800"
                            title="Test Fulfillment"
                          >
                            🧪
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
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">No orders match your filters.</p>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setImagePreview(null)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
