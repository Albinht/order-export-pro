'use client';

import React, { useState } from 'react';
import { ShopifyOrder } from '@/types/shopify';
import { formatDate } from '@/utils/date';
import { extractUploadedImages, hasCustomUpload } from '@/utils/upload-helpers';
import { 
  Check, 
  Square, 
  CheckSquare, 
  ExternalLink, 
  Package, 
  Truck, 
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Eye,
  Image as ImageIcon,
  X,
  Clock,
  Upload,
  Camera
} from 'lucide-react';

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
  onUpdateStatus
}: OrderTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'unfulfilled' && !order.fulfillment_status) ||
      (statusFilter === 'fulfilled' && order.fulfillment_status === 'fulfilled') ||
      (statusFilter === 'partial' && order.fulfillment_status === 'partial');
    
    return matchesSearch && matchesStatus;
  });

  const toggleRowExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedRows(newExpanded);
  };

  const getProductImage = (item: any): string | null => {
    // Check for customer uploaded images using helper function
    const uploadedImages = extractUploadedImages(item.properties);
    
    if (uploadedImages.length > 0) {
      return uploadedImages[0];
    }
    
    return productImages[item.product_id] || null;
  };
  
  const getItemImages = (item: any): { product: string | null; uploads: string[] } => {
    const uploads = extractUploadedImages(item.properties);
    const product = productImages[item.product_id] || null;
    
    return { product, uploads };
  };

  return (
    <div>
      {/* Filters Bar */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders, customers..."
                className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20 focus:border-[rgb(var(--color-primary))]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
            >
              <option value="all">All Status</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="partial">Partial</option>
              <option value="fulfilled">Fulfilled</option>
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {filteredOrders.length} orders • {selectedOrders.size} selected
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={onSelectAll}
                  className="flex items-center gap-2 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  {selectedOrders.size === orders.length ? (
                    <CheckSquare className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                  ) : selectedOrders.size > 0 ? (
                    <div className="relative">
                      <Square className="w-4 h-4" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-sm"></div>
                      </div>
                    </div>
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
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
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <tr
                  data-has-upload={order.line_items.some(item => hasCustomUpload(item.properties)) ? 'true' : 'false'}
                  className={`hover:bg-gray-50 transition-colors ${
                    selectedOrders.has(order.id) ? 'bg-blue-50/50' : ''
                  } ${order.line_items.some(item => hasCustomUpload(item.properties)) ? 'ring-2 ring-green-200 ring-offset-1' : ''}`}
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onSelectOrder(order.id)}
                      className="flex items-center"
                    >
                      {selectedOrders.has(order.id) ? (
                        <CheckSquare className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.name}</div>
                      <div className="text-xs text-gray-500">
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        {order.customer?.first_name} {order.customer?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">{order.customer?.email}</div>
                      {order.shipping_address?.country && (
                        <div className="text-xs text-gray-400 mt-1">
                          {order.shipping_address.city}, {order.shipping_address.country}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Custom Uploads First */}
                      <div className="flex -space-x-2">
                        {(() => {
                          // Collect all uploads and product images
                          const allUploads: { src: string; title: string; itemId: string }[] = [];
                          const allProducts: { src: string; title: string; itemId: string }[] = [];
                          
                          order.line_items.forEach(item => {
                            const images = getItemImages(item);
                            
                            // Add all uploads
                            images.uploads.forEach((upload, idx) => {
                              // Ensure URL is valid
                              if (upload && upload.startsWith('http')) {
                                allUploads.push({ 
                                  src: upload, 
                                  title: item.title, 
                                  itemId: `${item.id}-upload-${idx}` 
                                });
                              }
                            });
                            
                            // Add product image if exists
                            if (images.product) {
                              allProducts.push({ 
                                src: images.product, 
                                title: item.title, 
                                itemId: `${item.id}-product` 
                              });
                            }
                          });
                          
                          // Show uploads first, then products (max 5 total)
                          const displayImages = [...allUploads, ...allProducts].slice(0, 5);
                          const remainingCount = allUploads.length + allProducts.length - 5;
                          
                          if (displayImages.length === 0) {
                            return (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-gray-400" />
                              </div>
                            );
                          }
                          
                          return (
                            <>
                              {displayImages.map((img, idx) => {
                                const isUpload = allUploads.some(u => u.itemId === img.itemId);
                                
                                return (
                                  <div key={img.itemId} className="relative group">
                                    <img
                                      src={img.src}
                                      alt={img.title}
                                      onClick={() => setPreviewImage(img.src)}
                                      onError={(e) => {
                                        // Fallback if image fails to load
                                        const imgElement = e.target as HTMLImageElement;
                                        // Try once with a proxy if it's a cross-origin issue
                                        if (!imgElement.dataset.retried) {
                                          imgElement.dataset.retried = 'true';
                                          // You could add a proxy URL here if needed
                                          // imgElement.src = `/api/proxy-image?url=${encodeURIComponent(img.src)}`;
                                        } else {
                                          imgElement.style.display = 'none';
                                        }
                                      }}
                                      className={`w-12 h-12 rounded-lg object-cover cursor-pointer hover:z-10 hover:scale-125 transition-all duration-200 ${
                                        isUpload 
                                          ? 'border-2 border-green-500 shadow-lg shadow-green-200 ring-2 ring-green-200 ring-opacity-50' 
                                          : 'border-2 border-gray-300'
                                      }`}
                                      crossOrigin="anonymous"
                                    />
                                    {isUpload && (
                                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5" title="Customer Upload">
                                        <Camera className="w-3 h-3 text-white" />
                                      </div>
                                    )}
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                                      {isUpload ? '📸 Customer Upload' : '📦 Product Image'}
                                    </div>
                                  </div>
                                );
                              })}
                              {remainingCount > 0 && (
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-700 hover:from-gray-200 hover:to-gray-300 transition-all cursor-pointer shadow-sm" 
                                     onClick={() => toggleRowExpansion(order.id)}
                                     title={`View ${remainingCount} more image${remainingCount !== 1 ? 's' : ''}`}>
                                  +{remainingCount}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.line_items.length} item{order.line_items.length !== 1 ? 's' : ''}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.line_items.reduce((sum, item) => sum + item.quantity, 0)} qty
                            </div>
                          </div>
                          {(() => {
                            const uploadCount = order.line_items.reduce((sum, item) => 
                              sum + extractUploadedImages(item.properties).length, 0
                            );
                            if (uploadCount > 0) {
                              return (
                                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  <Camera className="w-3 h-3" />
                                  <span className="text-xs font-semibold">{uploadCount}</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleRowExpansion(order.id)}
                        className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {expandedRows.has(order.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {order.currency} {parseFloat(order.total_price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.fulfillment_status === 'fulfilled' ? (
                      <span className="badge badge-green">
                        <Check className="w-3 h-3 mr-1" />
                        Fulfilled
                      </span>
                    ) : order.fulfillment_status === 'partial' ? (
                      <span className="badge badge-orange">
                        <Package className="w-3 h-3 mr-1" />
                        Partial
                      </span>
                    ) : (
                      <span className="badge badge-blue">
                        <Clock className="w-3 h-3 mr-1" />
                        Unfulfilled
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.fulfillment_status !== 'fulfilled' && (
                        <button
                          onClick={() => onUpdateStatus(order.id, order.name, 'fulfilled')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as Fulfilled"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => onUpdateStatus(order.id, order.name, 'shipped')}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Mark as Shipped"
                      >
                        <Truck className="w-4 h-4" />
                      </button>
                      <a
                        href={`#`}
                        className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>

                {/* Expanded Product Details */}
                {expandedRows.has(order.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Product Details</h4>
                        {order.line_items.map((item) => {
                          const images = getItemImages(item);
                          const hasUpload = images.uploads.length > 0;
                          
                          return (
                            <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-100">
                              <div className="flex items-start gap-4">
                                {/* Product & Upload Images */}
                                <div className="flex gap-2">
                                  {/* Product Image */}
                                  {images.product && (
                                    <div className="relative">
                                      <img
                                        src={images.product}
                                        alt={item.title}
                                        onClick={() => setPreviewImage(images.product!)}
                                        className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform"
                                      />
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gray-700 text-white text-xs px-1 rounded">
                                        Product
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Customer Upload Images */}
                                  {images.uploads.map((upload, idx) => (
                                    <div key={idx} className="relative">
                                      <img
                                        src={upload}
                                        alt={`Upload ${idx + 1}`}
                                        onClick={() => setPreviewImage(upload)}
                                        className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:scale-110 transition-transform border-2 border-green-500"
                                      />
                                      <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                                        <Camera className="w-3 h-3" />
                                      </div>
                                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs px-1 rounded">
                                        Upload {idx + 1}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {!images.product && images.uploads.length === 0 && (
                                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                                      <ImageIcon className="w-8 h-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Product Details */}
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                      {item.variant_title && (
                                        <div className="text-xs text-gray-500">{item.variant_title}</div>
                                      )}
                                      {item.sku && (
                                        <div className="text-xs text-gray-400">SKU: {item.sku}</div>
                                      )}
                                    </div>
                                    {hasUpload && (
                                      <span className="badge badge-green">
                                        <Upload className="w-3 h-3 mr-1" />
                                        Custom Upload
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Custom Properties */}
                                  {item.properties && item.properties.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100">
                                      <div className="text-xs font-medium text-gray-600 mb-1">Custom Properties:</div>
                                      <div className="space-y-1">
                                        {item.properties.map((prop, propIdx) => (
                                          <div key={propIdx} className="flex items-start gap-2 text-xs">
                                            <span className="font-medium text-gray-500">{prop.name}:</span>
                                            {prop.value.includes('http') ? (
                                              <a 
                                                href={prop.value} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline truncate max-w-xs"
                                              >
                                                {prop.value.includes('uploadkit') ? 'View Upload' : 'View Link'}
                                              </a>
                                            ) : (
                                              <span className="text-gray-700">{prop.value}</span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Price Info */}
                                <div className="text-right">
                                  <div className="text-sm text-gray-600">
                                    {item.quantity} × {order.currency} {parseFloat(item.price).toFixed(2)}
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {order.currency} {(item.quantity * parseFloat(item.price)).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage}
              alt="Product preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
            <Package className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No orders found</p>
          {searchTerm && (
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          )}
        </div>
      )}
    </div>
  );
}
