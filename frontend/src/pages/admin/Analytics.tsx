import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Download,
  RefreshCw,
  Calendar,
  Activity,
  Eye,
  BarChart,
  PieChart,
  LineChart,
  X,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  charts: {
    revenue: Array<{ date: string; revenue: number; orders: number }>;
    orders: Array<{ date: string; orders: number }>;
    customers: Array<{ date: string; customers: number }>;
  };
  topProducts: Array<{
    name: string;
    totalSold: number;
    totalRevenue: number;
    image?: string;
  }>;
  orderStatusDistribution: { [key: string]: number };
  timeRange: string;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedChart, setSelectedChart] = useState<'revenue' | 'orders' | 'customers'>('revenue');
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Analytics data received:', data);
        console.log('Charts data:', data.data?.charts);
        setAnalyticsData(data.data);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnalytics = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to export analytics",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Exporting Analytics",
        description: "Preparing your export...",
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/analytics/export?timeRange=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-export-${timeRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: "Analytics data exported successfully as Excel file",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export analytics');
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export analytics. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 30 Days';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderChart = () => {
    if (!analyticsData) return null;

    // Ensure charts object exists
    const charts = analyticsData.charts || {};
    const chartData = charts[selectedChart];
    
    console.log('Selected chart:', selectedChart);
    console.log('Chart data:', chartData);
    
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No data available for the selected time range</p>
          </div>
        </div>
      );
    }

    // Simple bar chart implementation
    const maxValue = Math.max(...chartData.map(item => {
      if (!item) return 0;
      return selectedChart === 'revenue' ? (item.revenue || 0) : 
             selectedChart === 'orders' ? (item.orders || 0) : 
             (item.customers || 0);
    }));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold capitalize">
            {selectedChart === 'revenue' ? 'Revenue' : 
             selectedChart === 'orders' ? 'Orders' : 'Customers'} Over Time
          </h3>
          <div className="flex space-x-2">
            {(['revenue', 'orders', 'customers'] as const).map((chart) => (
              <Button
                key={chart}
                variant={selectedChart === chart ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedChart(chart)}
                className={selectedChart === chart ? "bg-red-600 hover:bg-red-700" : ""}
              >
                {chart === 'revenue' && <DollarSign className="h-4 w-4 mr-1" />}
                {chart === 'orders' && <ShoppingCart className="h-4 w-4 mr-1" />}
                {chart === 'customers' && <Users className="h-4 w-4 mr-1" />}
                {chart.charAt(0).toUpperCase() + chart.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-end space-x-2 h-48">
            {chartData.map((item, index) => {
              if (!item) return null;
              
              const value = selectedChart === 'revenue' ? (item.revenue || 0) : 
                          selectedChart === 'orders' ? (item.orders || 0) : 
                          (item.customers || 0);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div 
                    className="w-full bg-red-500 rounded-t transition-all duration-300 hover:bg-red-600 min-h-[4px] relative"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {selectedChart === 'revenue' ? `$${value.toFixed(2)}` : 
                       selectedChart === 'orders' ? `${value} orders` : 
                       `${value} customers`}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">
          Unable to load analytics data. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white" onClick={handleExportAnalytics}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimeRangeLabel(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimeRangeLabel(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analyticsData.overview.totalCustomers)}</div>
            <p className="text-xs text-muted-foreground">
              {getTimeRangeLabel(timeRange)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.overview.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Performance Charts
          </CardTitle>
          <CardDescription>
            Visual representation of your business metrics over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Top Products and Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Top Selling Products
            </CardTitle>
            <CardDescription>
              Best performing products by sales volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topProducts.length > 0 ? (
                analyticsData.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        {product.totalSold} units sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(product.totalRevenue / 100)}
                      </p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No product data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Order Status Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of orders by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analyticsData.orderStatusDistribution).length > 0 ? (
                Object.entries(analyticsData.orderStatusDistribution).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {count} orders
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {((count / analyticsData.overview.totalOrders) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No order data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Additional Metrics
          </CardTitle>
          <CardDescription>
            Key performance indicators and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.overview.conversionRate.toFixed(2)}
              </div>
              <p className="text-sm text-blue-600">Orders per Customer</p>
              <p className="text-xs text-gray-600">Conversion Rate</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.overview.totalProducts}
              </div>
              <p className="text-sm text-green-600">Active Products</p>
              <p className="text-xs text-gray-600">In Catalog</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.overview.totalRevenue > 0 && analyticsData.overview.totalOrders > 0 
                  ? formatCurrency(analyticsData.overview.totalRevenue / analyticsData.overview.totalOrders)
                  : '$0.00'
                }
              </div>
              <p className="text-sm text-purple-600">Average Revenue</p>
              <p className="text-xs text-gray-600">Per Order</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics; 