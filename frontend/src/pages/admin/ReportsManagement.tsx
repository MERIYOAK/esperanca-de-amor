import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Tag, 
  Bell, 
  TrendingUp,
  Calendar,
  RefreshCw,
  Eye,
  Filter,
  Settings,
  Database,
  Activity,
  DollarSign,
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: any;
  endpoint: string;
  format: 'excel' | 'csv' | 'pdf';
  category: 'sales' | 'inventory' | 'customers' | 'marketing' | 'analytics';
  color: string;
  available: boolean;
}

interface ReportFilter {
  dateRange: string;
  status: string;
  category: string;
}

const ReportsManagement = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: 'all',
    status: 'all',
    category: 'all'
  });
  
  // Individual report filter states
  const [salesDateRange, setSalesDateRange] = useState('30');
  const [salesStatus, setSalesStatus] = useState('all');
  const [salesExporting, setSalesExporting] = useState(false);
  
  const [ordersDateRange, setOrdersDateRange] = useState('30');
  const [ordersStatus, setOrdersStatus] = useState('all');
  const [ordersExporting, setOrdersExporting] = useState(false);
  
  const [customersDateRange, setCustomersDateRange] = useState('30');
  const [customersStatus, setCustomersStatus] = useState('all');
  const [customersExporting, setCustomersExporting] = useState(false);
  
  const [offersDateRange, setOffersDateRange] = useState('30');
  const [offersStatus, setOffersStatus] = useState('all');
  const [offersExporting, setOffersExporting] = useState(false);
  
  const [newsletterDateRange, setNewsletterDateRange] = useState('30');
  const [newsletterStatus, setNewsletterStatus] = useState('all');
  const [newsletterExporting, setNewsletterExporting] = useState(false);
  
  const [analyticsDateRange, setAnalyticsDateRange] = useState('30');
  const [analyticsStatus, setAnalyticsStatus] = useState('all');
  const [analyticsExporting, setAnalyticsExporting] = useState(false);
  
  const [announcementsDateRange, setAnnouncementsDateRange] = useState('30');
  const [announcementsStatus, setAnnouncementsStatus] = useState('all');
  const [announcementsExporting, setAnnouncementsExporting] = useState(false);
  
  const [salesTrendDateRange, setSalesTrendDateRange] = useState('30');
  const [salesTrendStatus, setSalesTrendStatus] = useState('all');
  const [salesTrendExporting, setSalesTrendExporting] = useState(false);
  
  // Products report state variables
  const [productsCategory, setProductsCategory] = useState('all');
  const [productsStatus, setProductsStatus] = useState('all');
  const [productsExporting, setProductsExporting] = useState(false);
  
  const { toast } = useToast();

  const reportTypes: ReportType[] = [
    {
      id: 'products',
      name: 'Products Report',
      description: 'Complete inventory report with stock levels, categories, and pricing',
      icon: Package,
      endpoint: '/api/admin/products/export',
      format: 'excel',
      category: 'inventory',
      color: 'bg-blue-500',
      available: true
    },
    {
      id: 'orders',
      name: 'Orders Report',
      description: 'Sales orders with customer details, payment status, and delivery tracking',
      icon: ShoppingCart,
      endpoint: '/api/admin/orders/export',
      format: 'excel',
      category: 'sales',
      color: 'bg-green-500',
      available: true
    },
    {
      id: 'customers',
      name: 'Customers Report',
      description: 'Customer database with registration dates, order history, and preferences',
      icon: Users,
      endpoint: '/api/admin/customers/export',
      format: 'excel',
      category: 'customers',
      color: 'bg-purple-500',
      available: true
    },
    {
      id: 'offers',
      name: 'Offers Report',
      description: 'Promotional offers, discounts, and campaign performance metrics',
      icon: Tag,
      endpoint: '/api/admin/offers/export',
      format: 'excel',
      category: 'marketing',
      color: 'bg-orange-500',
      available: true
    },
    {
      id: 'newsletter',
      name: 'Newsletter Subscribers',
      description: 'Email subscribers list with subscription dates and preferences',
      icon: Mail,
      endpoint: '/api/admin/newsletter/export',
      format: 'csv',
      category: 'marketing',
      color: 'bg-pink-500',
      available: true
    },
    {
      id: 'analytics',
      name: 'Analytics Report',
      description: 'Comprehensive analytics with sales trends, user behavior, and performance metrics',
      icon: BarChart3,
      endpoint: '/api/admin/analytics/export',
      format: 'excel',
      category: 'analytics',
      color: 'bg-red-500',
      available: true
    },
    {
      id: 'announcements',
      name: 'Announcements Report',
      description: 'System announcements with engagement metrics and audience reach',
      icon: Bell,
      endpoint: '/api/admin/announcements/export',
      format: 'excel',
      category: 'marketing',
      color: 'bg-yellow-500',
      available: true
    },
    {
      id: 'sales-trend',
      name: 'Sales Trend Analysis',
      description: 'Detailed sales trend analysis with forecasting and seasonal patterns',
      icon: TrendingUp,
      endpoint: '/api/admin/analytics/sales-trend/export',
      format: 'excel',
      category: 'analytics',
      color: 'bg-indigo-500',
      available: true
    }
  ];

  const handleExportReport = async (report: ReportType) => {
    try {
      setLoading(report.id);
      const token = localStorage.getItem('adminToken');
      
      // Build query parameters based on filters
      const params = new URLSearchParams();
      if (filters.dateRange !== 'all') params.append('dateRange', filters.dateRange);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.category !== 'all') params.append('category', filters.category);

      const url = `${import.meta.env.VITE_API_URL}${report.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const blob = await response.blob();
      const url2 = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = `${report.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.${report.format === 'excel' ? 'xlsx' : report.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url2);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${report.name} exported successfully`,
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast({
        title: "Error",
        description: `Failed to export ${report.name}`,
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleQuickExport = (report: ReportType) => {
    setSelectedReport(report);
    setShowFilterModal(true);
  };

  const handleFilteredExport = () => {
    if (selectedReport) {
      handleExportReport(selectedReport);
    }
  };

  // Individual report export handlers
  const handleExportSales = async () => {
    try {
      setSalesExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/sales/export?dateRange=${salesDateRange}&status=${salesStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export sales report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Sales report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting sales report:', error);
      toast({
        title: "Error",
        description: "Failed to export sales report",
        variant: "destructive",
      });
    } finally {
      setSalesExporting(false);
    }
  };

  const handleExportOrders = async () => {
    try {
      setOrdersExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/orders/export?dateRange=${ordersDateRange}&status=${ordersStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export orders report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Orders report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting orders report:', error);
      toast({
        title: "Error",
        description: "Failed to export orders report",
        variant: "destructive",
      });
    } finally {
      setOrdersExporting(false);
    }
  };

  const handleExportCustomers = async () => {
    try {
      setCustomersExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/customers/export?dateRange=${customersDateRange}&status=${customersStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export customers report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customers-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Customers report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting customers report:', error);
      toast({
        title: "Error",
        description: "Failed to export customers report",
        variant: "destructive",
      });
    } finally {
      setCustomersExporting(false);
    }
  };

  const handleExportOffers = async () => {
    try {
      setOffersExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/offers/export?dateRange=${offersDateRange}&status=${offersStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export offers report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offers-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Offers report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting offers report:', error);
      toast({
        title: "Error",
        description: "Failed to export offers report",
        variant: "destructive",
      });
    } finally {
      setOffersExporting(false);
    }
  };

  const handleExportNewsletter = async () => {
    try {
      setNewsletterExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/newsletter/export?dateRange=${newsletterDateRange}&status=${newsletterStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export newsletter report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-report-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Newsletter report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting newsletter report:', error);
      toast({
        title: "Error",
        description: "Failed to export newsletter report",
        variant: "destructive",
      });
    } finally {
      setNewsletterExporting(false);
    }
  };

  const handleExportAnalytics = async () => {
    try {
      setAnalyticsExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/analytics/export?dateRange=${analyticsDateRange}&status=${analyticsStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export analytics report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Analytics report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      toast({
        title: "Error",
        description: "Failed to export analytics report",
        variant: "destructive",
      });
    } finally {
      setAnalyticsExporting(false);
    }
  };

  const handleExportAnnouncements = async () => {
    try {
      setAnnouncementsExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/announcements/export?dateRange=${announcementsDateRange}&status=${announcementsStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export announcements report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `announcements-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Announcements report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting announcements report:', error);
      toast({
        title: "Error",
        description: "Failed to export announcements report",
        variant: "destructive",
      });
    } finally {
      setAnnouncementsExporting(false);
    }
  };

  const handleExportSalesTrend = async () => {
    try {
      setSalesTrendExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/sales-trend/export?dateRange=${salesTrendDateRange}&status=${salesTrendStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export sales trend report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales-trend-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Sales trend report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting sales trend report:', error);
      toast({
        title: "Error",
        description: "Failed to export sales trend report",
        variant: "destructive",
      });
    } finally {
      setSalesTrendExporting(false);
    }
  };

  const handleExportProducts = async () => {
    try {
      setProductsExporting(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports/products/export?category=${productsCategory}&status=${productsStatus}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export products report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Products report exported successfully",
      });
    } catch (error) {
      console.error('Error exporting products report:', error);
      toast({
        title: "Error",
        description: "Failed to export products report",
        variant: "destructive",
      });
    } finally {
      setProductsExporting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      sales: 'bg-green-100 text-green-800',
      inventory: 'bg-blue-100 text-blue-800',
      customers: 'bg-purple-100 text-purple-800',
      marketing: 'bg-pink-100 text-pink-800',
      analytics: 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getFormatBadge = (format: string) => {
    const colors = {
      excel: 'bg-green-100 text-green-800',
      csv: 'bg-blue-100 text-blue-800',
      pdf: 'bg-red-100 text-red-800'
    };
    return colors[format as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredReports = reportTypes.filter(report => {
    if (filters.category !== 'all' && report.category !== filters.category) return false;
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Reports Management</h2>
          <p className="text-sm text-gray-600">Generate and export business reports</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sales Report */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Sales Report</CardTitle>
                <CardDescription className="text-sm">Revenue and sales analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date Range:</span>
                <select
                  value={salesDateRange}
                  onChange={(e) => setSalesDateRange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={salesStatus}
                  onChange={(e) => setSalesStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Orders</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleExportSales}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-sm"
              disabled={salesExporting}
            >
              {salesExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Sales Report</span>
                  <span className="sm:hidden">Export Sales</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Orders Report */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Orders Report</CardTitle>
                <CardDescription className="text-sm">Order processing and fulfillment</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date Range:</span>
                <select
                  value={ordersDateRange}
                  onChange={(e) => setOrdersDateRange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={ordersStatus}
                  onChange={(e) => setOrdersStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleExportOrders}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
              disabled={ordersExporting}
            >
              {ordersExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Orders Report</span>
                  <span className="sm:hidden">Export Orders</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Customers Report */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Customers Report</CardTitle>
                <CardDescription className="text-sm">Customer demographics and behavior</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date Range:</span>
                <select
                  value={customersDateRange}
                  onChange={(e) => setCustomersDateRange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={customersStatus}
                  onChange={(e) => setCustomersStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Customers</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="new">New</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleExportCustomers}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
              disabled={customersExporting}
            >
              {customersExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Customers Report</span>
                  <span className="sm:hidden">Export Customers</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Products Report */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Products Report</CardTitle>
                <CardDescription className="text-sm">Inventory and product performance</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Category:</span>
                <select
                  value={productsCategory}
                  onChange={(e) => setProductsCategory(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Categories</option>
                  <option value="foodstuffs">Foodstuffs</option>
                  <option value="household-items">Household Items</option>
                  <option value="beverages">Beverages</option>
                  <option value="electronics">Electronics</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={productsStatus}
                  onChange={(e) => setProductsStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Products</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleExportProducts}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white text-sm"
              disabled={productsExporting}
            >
              {productsExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Products Report</span>
                  <span className="sm:hidden">Export Products</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Offers Report */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 rounded-lg">
                <Tag className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Offers Report</CardTitle>
                <CardDescription className="text-sm">Promotional offers and discounts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date Range:</span>
                <select
                  value={offersDateRange}
                  onChange={(e) => setOffersDateRange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={offersStatus}
                  onChange={(e) => setOffersStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Offers</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleExportOffers}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
              disabled={offersExporting}
            >
              {offersExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Offers Report</span>
                  <span className="sm:hidden">Export Offers</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Newsletter Report */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Mail className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg">Newsletter Report</CardTitle>
                <CardDescription className="text-sm">Email campaigns and subscribers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Date Range:</span>
                <select
                  value={newsletterDateRange}
                  onChange={(e) => setNewsletterDateRange(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <select
                  value={newsletterStatus}
                  onChange={(e) => setNewsletterStatus(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Subscribers</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <Button 
              onClick={handleExportNewsletter}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              disabled={newsletterExporting}
            >
              {newsletterExporting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Exporting...</span>
                  <span className="sm:hidden">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Export Newsletter Report</span>
                  <span className="sm:hidden">Export Newsletter</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Report Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sales Reports */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                Sales Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track revenue, orders, and customer purchasing patterns
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Orders Report
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Sales Trend Analysis
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Reports */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Inventory Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Monitor stock levels, product performance, and category analysis
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Products Report
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  Stock Alerts
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Reports */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Customer Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Analyze customer behavior, demographics, and loyalty patterns
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Customers Report
                </div>
                <div className="flex items-center text-sm">
                  <Star className="h-4 w-4 text-gray-400 mr-2" />
                  Customer Segmentation
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marketing Reports */}
          <Card className="border-l-4 border-l-pink-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Tag className="h-5 w-5 mr-2 text-pink-600" />
                Marketing Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Track promotional campaigns, offers, and newsletter performance
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Offers Report
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Newsletter Subscribers
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analytics Reports */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-red-600" />
                Analytics Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive business intelligence and performance metrics
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Analytics Report
                </div>
                <div className="flex items-center text-sm">
                  <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                  Performance Dashboard
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Reports */}
          <Card className="border-l-4 border-l-gray-500">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-gray-600" />
                System Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                System health, user activity, and administrative insights
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Activity className="h-4 w-4 text-gray-400 mr-2" />
                  System Health
                </div>
                <div className="flex items-center text-sm">
                  <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                  Error Logs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filter Modal */}
      <Dialog open={showFilterModal} onOpenChange={setShowFilterModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Filters</DialogTitle>
            <DialogDescription>
              Configure filters for your report export
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="customers">Customers</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFilteredExport}
                disabled={!selectedReport}
              >
                Export Report
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement; 