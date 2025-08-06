import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  Download,
  X,
  Printer,
  Share2,
  FileText,
  CreditCard,
  Truck as TruckIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle,
  Info
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  updatedAt: string;
  notes?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  paymentMethod?: string;
  whatsappSent?: boolean;
  whatsappSentAt?: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders);
        setTotalPages(data.data.pagination.pages);
        setTotalOrders(data.data.pagination.total);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to update order status",
          variant: "destructive",
        });
        return;
      }
      
      if (!orderId || !newStatus) {
        toast({
          title: "Validation Error",
          description: "Order ID and status are required",
          variant: "destructive",
        });
        return;
      }
      
      console.log('🔄 Sending status update:', {
        orderId,
        newStatus,
        adminToken: adminToken ? 'Present' : 'Missing'
      });
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `Order status updated to ${newStatus}`,
        });
        fetchOrders();
      } else {
        // Get the error message from the response
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to update order status';
        
        console.error('Status update error:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewOrderDetails = async (orderId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to view order details",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.data);
        setShowOrderModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch order details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order details",
        variant: "destructive",
      });
    }
  };

  const handleCloseOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const handlePrintOrder = () => {
    if (selectedOrder) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Order #${selectedOrder.orderNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #f9f9f9; }
                .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Order #${selectedOrder.orderNumber}</h1>
                <p>Date: ${new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                <p>Status: ${selectedOrder.status.toUpperCase()}</p>
              </div>
              
              <div class="section">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${selectedOrder.user.name}</p>
                <p><strong>Email:</strong> ${selectedOrder.user.email}</p>
                ${selectedOrder.user.phone ? `<p><strong>Phone:</strong> ${selectedOrder.user.phone}</p>` : ''}
              </div>
              
              <div class="section">
                <h3>Shipping Address</h3>
                <p>${selectedOrder.shippingAddress.street}</p>
                <p>${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} ${selectedOrder.shippingAddress.zipCode}</p>
                <p>${selectedOrder.shippingAddress.country}</p>
              </div>
              
              <div class="section">
                <h3>Order Items</h3>
                ${selectedOrder.items.map(item => `
                  <div class="item">
                    <div>
                      <strong>${item.product.name}</strong><br>
                      Quantity: ${item.quantity}
                    </div>
                    <div>
                      $${item.price.toFixed(2)} each<br>
                      $${(item.price * item.quantity).toFixed(2)} total
                    </div>
                  </div>
                `).join('')}
              </div>
              
              <div class="total">
                <strong>Total Amount: $${selectedOrder.totalAmount.toFixed(2)}</strong>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const handleExportOrders = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to export orders",
          variant: "destructive",
        });
        return;
      }

      // Test admin authentication first
      const authTest = await testAdminAuth();
      if (!authTest) {
        toast({
          title: "Authentication Error",
          description: "Admin authentication failed. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      // Show loading state
      toast({
        title: "Exporting Orders",
        description: "Preparing your export...",
      });

      // Build query parameters based on current filters
      const params = new URLSearchParams({
        format: 'excel'
      });

      // Add status filter if selected
      if (statusFilter && statusFilter !== '') {
        params.append('status', statusFilter);
      }

      // Add date range for last 30 days if no specific dates
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.append('startDate', thirtyDaysAgo.toISOString());
      params.append('endDate', new Date().toISOString());

      console.log('📡 Export request:', {
        url: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/export?${params}`,
        params: Object.fromEntries(params.entries()),
        hasToken: !!adminToken,
        tokenLength: adminToken?.length
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/export?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      console.log('📡 Export response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      if (response.ok) {
        // Get the blob from the response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: "Orders exported successfully as Excel file",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export orders');
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export orders. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to view analytics",
          variant: "destructive",
        });
        return;
      }

      setAnalyticsLoading(true);
      setShowAnalyticsModal(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/orders/stats`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data.data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to load analytics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleCloseAnalyticsModal = () => {
    setShowAnalyticsModal(false);
    setAnalyticsData(null);
  };

  const testAdminAuth = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        console.log('❌ No admin token found');
        return false;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/test-auth`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin auth test successful:', data);
        return true;
      } else {
        console.log('❌ Admin auth test failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ Admin auth test error:', error);
      return false;
    }
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

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-600">Track and manage customer orders</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full sm:w-auto" onClick={handleExportOrders}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Orders</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto" onClick={handleViewAnalytics}>
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-lg">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by number, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-red-600" />
                    <div>
                      <CardTitle className="text-base sm:text-lg">Order #{order.orderNumber}</CardTitle>
                      <CardDescription className="text-sm">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize text-xs">{order.status}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center text-sm">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{order.user.name}</span>
                    </p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {order.user.email}
                    </p>
                    {order.user.phone && (
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {order.user.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipping Address
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">${item.price.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                <div className="text-right sm:text-left">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOrderDetails(order._id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </Button>
                  <select
                    data-order-id={order._id}
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 w-full sm:w-auto"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalOrders)} of {totalOrders} orders
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-sm text-gray-600">
            {searchTerm || statusFilter 
              ? "Try adjusting your search or filter criteria"
              : "No orders have been placed yet"
            }
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseOrderModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center space-x-3">
                <ShoppingCart className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()} at {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <Button variant="outline" size="sm" onClick={handlePrintOrder} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto">
                  <Printer className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleCloseOrderModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close Order Details</span>
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Order Status */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 flex items-center text-sm">
                  <Info className="h-4 w-4 mr-2" />
                  Order Status
                </h3>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1 capitalize text-xs">{selectedOrder.status}</span>
                </Badge>
                {selectedOrder.estimatedDelivery && (
                  <p className="text-sm text-gray-600">
                    Estimated Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
                {selectedOrder.deliveredAt && (
                  <p className="text-sm text-gray-600">
                    Delivered: {new Date(selectedOrder.deliveredAt).toLocaleDateString()}
                  </p>
                )}
                {selectedOrder.cancelledAt && (
                  <p className="text-sm text-gray-600">
                    Cancelled: {new Date(selectedOrder.cancelledAt).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center text-sm">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {selectedOrder.user.name}
                    </p>
                    <p className="text-sm flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedOrder.user.email}
                    </p>
                    {selectedOrder.user.phone && (
                      <p className="text-sm flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedOrder.user.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      Shipping Address
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>{selectedOrder.shippingAddress.street}</p>
                      <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                      <p>{selectedOrder.shippingAddress.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center text-sm">
                  <Package className="h-4 w-4 mr-2" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-1">
                  <p className="text-base sm:text-lg font-bold text-gray-900">
                    Total Amount: ${selectedOrder.totalAmount.toFixed(2)}
                  </p>
                  {selectedOrder.notes && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {selectedOrder.notes}
                    </p>
                  )}
                  {selectedOrder.cancellationReason && (
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Cancellation Reason:</span> {selectedOrder.cancellationReason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseAnalyticsModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Eye className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Order Analytics Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">
                    Comprehensive order statistics and insights
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseAnalyticsModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm">
                <X className="h-4 w-4" />
                <span className="sr-only">Close Analytics</span>
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading analytics...</p>
                  </div>
                </div>
              ) : analyticsData ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Total Orders</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.totalOrders}</p>
                        </div>
                        <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Total Revenue</p>
                          <p className="text-xl sm:text-2xl font-bold">${(analyticsData.totalRevenue / 100).toFixed(2)}</p>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                          <span className="text-lg font-bold">$</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Delivered Orders</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.statusDistribution?.delivered || 0}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Pending Orders</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.statusDistribution?.pending || 0}</p>
                        </div>
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                  </div>

                  {/* Status Distribution */}
                  <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                      {Object.entries(analyticsData.statusDistribution || {}).map(([status, count]) => (
                        <div key={status} className="text-center">
                          <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm">
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">{count as number}</div>
                            <div className="text-xs sm:text-sm text-gray-600 capitalize">{status}</div>
                            <div className="mt-2">
                              <Badge className={getStatusColor(status)}>
                                {getStatusIcon(status)}
                                <span className="ml-1 capitalize text-xs">{status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Range Info */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-800">
                        Statistics based on the last {analyticsData.timeRange || '30'} days
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                    <div className="text-sm text-gray-600 text-center sm:text-left">
                      <p>Last updated: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportOrders}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Export Data</span>
                        <span className="sm:hidden">Export</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleCloseAnalyticsModal();
                          fetchOrders();
                        }}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden">Refresh</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                  <p className="text-sm text-gray-600">
                    Unable to load analytics data. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement; 