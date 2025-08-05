import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  User,
  Mail,
  Phone,
  Calendar,
  RefreshCw,
  Download,
  X,
  Printer,
  Share2,
  FileText,
  CreditCard,
  UserCheck,
  UserX,
  AlertCircle,
  Info,
  Trash2,
  Edit,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatar?: string;
}

interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomers: number;
  timeRange: string;
  averageOrdersPerCustomer: number;
  averageSpentPerCustomer: number;
}

const CustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<CustomerStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchCustomers = async () => {
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/customers?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data.customers);
        setTotalPages(data.data.pagination.pages);
        setTotalCustomers(data.data.pagination.total);
      } else {
        throw new Error('Failed to fetch customers');
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomerDetails = async (customerId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to view customer details",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/customers/${customerId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedCustomer(data.data.customer);
        setShowCustomerModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch customer details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching customer details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customer details",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCustomerStatus = async (customerId: string, isActive: boolean) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to update customer status",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/customers/${customerId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ isActive })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
        });
        fetchCustomers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to update customer status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      toast({
        title: "Error",
        description: "Failed to update customer status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to delete customer",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/customers/${customerId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
        fetchCustomers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete customer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleExportCustomers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      if (!adminToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in as admin to export customers",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Exporting Customers",
        description: "Preparing your export...",
      });

      const params = new URLSearchParams({
        format: 'excel'
      });

      if (statusFilter && statusFilter !== '') {
        params.append('status', statusFilter);
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.append('startDate', thirtyDaysAgo.toISOString());
      params.append('endDate', new Date().toISOString());

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/customers/export?${params}`,
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
        a.download = `customers-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: "Customers exported successfully as Excel file",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export customers');
      }
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export customers. Please try again.",
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
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/customers/stats`,
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

  const handleCloseCustomerModal = () => {
    setShowCustomerModal(false);
    setSelectedCustomer(null);
  };

  const handleCloseAnalyticsModal = () => {
    setShowAnalyticsModal(false);
    setAnalyticsData(null);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600">View and manage customer accounts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white" onClick={handleExportCustomers}>
            <Download className="h-4 w-4 mr-2" />
            Export Customers
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleViewAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <div className="space-y-4">
        {customers.map((customer) => (
          <Card key={customer._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-red-600" />
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription>
                        {new Date(customer.createdAt).toLocaleDateString()} at {new Date(customer.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(customer.isActive)}>
                    {getStatusIcon(customer.isActive)}
                    <span className="ml-1">{customer.isActive ? 'Active' : 'Inactive'}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Customer Information
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <span className="font-medium">Name:</span>
                      <span className="ml-2">{customer.name}</span>
                    </p>
                    <p className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {customer.email}
                    </p>
                    {customer.phone && (
                      <p className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {customer.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Account Details
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>Member since: {new Date(customer.createdAt).toLocaleDateString()}</p>
                    {customer.lastLogin && (
                      <p>Last login: {new Date(customer.lastLogin).toLocaleDateString()}</p>
                    )}
                    <p>Status: {customer.isActive ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-gray-600">
                  <p>Customer ID: {customer._id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewCustomerDetails(customer._id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateCustomerStatus(customer._id, !customer.isActive)}
                    className={customer.isActive 
                      ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white" 
                      : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                    }
                  >
                    {customer.isActive ? <UserX className="h-4 w-4 mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                    {customer.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer._id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCustomers)} of {totalCustomers} customers
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {customers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Customers Found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter 
              ? "Try adjusting your search or filter criteria"
              : "No customers have registered yet"
            }
          </p>
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseCustomerModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <User className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedCustomer.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Customer since {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleCloseCustomerModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Customer Status */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  Account Status
                </h3>
                <Badge className={getStatusColor(selectedCustomer.isActive)}>
                  {getStatusIcon(selectedCustomer.isActive)}
                  <span className="ml-1">{selectedCustomer.isActive ? 'Active' : 'Inactive'}</span>
                </Badge>
                {selectedCustomer.lastLogin && (
                  <p className="text-sm text-gray-600">
                    Last login: {new Date(selectedCustomer.lastLogin).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Customer Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Name:</span> {selectedCustomer.name}
                    </p>
                    <p className="text-sm flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedCustomer.email}
                    </p>
                    {selectedCustomer.phone && (
                      <p className="text-sm flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedCustomer.phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Account Details
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>Created: {new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                      <p>Updated: {new Date(selectedCustomer.updatedAt).toLocaleDateString()}</p>
                      <p>Customer ID: {selectedCustomer._id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Customer ID: {selectedCustomer._id}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleUpdateCustomerStatus(selectedCustomer._id, !selectedCustomer.isActive)}
                      className={selectedCustomer.isActive 
                        ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white" 
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                      }
                    >
                      {selectedCustomer.isActive ? <UserX className="h-4 w-4 mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                      {selectedCustomer.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteCustomer(selectedCustomer._id)}
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Customer
                    </Button>
                  </div>
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
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Customer Analytics Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">
                    Comprehensive customer statistics and insights
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseAnalyticsModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {analyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading analytics...</p>
                  </div>
                </div>
              ) : analyticsData ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Total Customers</p>
                          <p className="text-2xl font-bold">{analyticsData.totalCustomers}</p>
                        </div>
                        <Users className="h-8 w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Active Customers</p>
                          <p className="text-2xl font-bold">{analyticsData.activeCustomers}</p>
                        </div>
                        <UserCheck className="h-8 w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">Inactive Customers</p>
                          <p className="text-2xl font-bold">{analyticsData.inactiveCustomers}</p>
                        </div>
                        <UserX className="h-8 w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">New Customers</p>
                          <p className="text-2xl font-bold">{analyticsData.newCustomers}</p>
                        </div>
                        <Plus className="h-8 w-8 opacity-80" />
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Engagement</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Orders per Customer:</span>
                          <span className="font-semibold">{analyticsData.averageOrdersPerCustomer.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Avg Spent per Customer:</span>
                          <span className="font-semibold">${(analyticsData.averageSpentPerCustomer / 100).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Range</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Period:</span>
                          <span className="font-semibold">Last {analyticsData.timeRange}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-semibold">{new Date().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <p>Last updated: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportCustomers}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleCloseAnalyticsModal();
                          fetchCustomers();
                        }}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
                  <p className="text-gray-600">
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

export default CustomerManagement; 