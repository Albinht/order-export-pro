'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const stats = {
    totalRevenue: 45678.90,
    revenueChange: 12.5,
    totalOrders: 342,
    ordersChange: 8.3,
    avgOrderValue: 133.56,
    avgChange: 3.2,
    totalCustomers: 287,
    customersChange: -2.1,
  };

  const chartData = [
    { date: 'Mon', orders: 45, revenue: 5670 },
    { date: 'Tue', orders: 52, revenue: 6540 },
    { date: 'Wed', orders: 38, revenue: 4780 },
    { date: 'Thu', orders: 65, revenue: 8170 },
    { date: 'Fri', orders: 59, revenue: 7420 },
    { date: 'Sat', orders: 43, revenue: 5410 },
    { date: 'Sun', orders: 40, revenue: 5030 },
  ];

  const topProducts = [
    { name: 'Product A - 20x30cm Canvas', orders: 45, revenue: 5670 },
    { name: 'Product B - 30x40cm Frame', orders: 38, revenue: 4560 },
    { name: 'Product C - 40x50cm Premium', orders: 32, revenue: 6400 },
    { name: 'Product D - Custom Size', orders: 28, revenue: 4200 },
    { name: 'Product E - Bundle Pack', orders: 25, revenue: 3750 },
  ];

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Track your store performance and metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]/20"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <button className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => setLoading(true)}
              className="btn-primary flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                €{stats.totalRevenue.toFixed(2)}
              </p>
              <div className={`flex items-center gap-1 mt-2 ${
                stats.revenueChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.revenueChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(stats.revenueChange)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
              <div className={`flex items-center gap-1 mt-2 ${
                stats.ordersChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.ordersChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(stats.ordersChange)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-[rgb(var(--color-primary))]" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                €{stats.avgOrderValue}
              </p>
              <div className={`flex items-center gap-1 mt-2 ${
                stats.avgChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.avgChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(stats.avgChange)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-[rgb(var(--color-orange))]" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalCustomers}</p>
              <div className={`flex items-center gap-1 mt-2 ${
                stats.customersChange > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.customersChange > 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(stats.customersChange)}%
                </span>
                <span className="text-sm text-gray-500">vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {chartData.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-12">{day.date}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-[rgb(var(--color-primary))] to-blue-400 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">€{day.revenue}</span>
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900 w-16 text-right">
                  {day.orders}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Top Products</h2>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-medium text-gray-600">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">€{product.revenue}</p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
