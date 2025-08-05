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
      setShowFilterModal(false);
      setSelectedReport(null);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and export comprehensive business reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilterModal(true)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter Reports
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportTypes.filter(r => r.available).length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to export
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Database className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Report types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Export Formats</CardTitle>
            <Download className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Excel, CSV, PDF
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Export</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              No recent exports
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} className="hover:shadow-lg transition-shadow flex flex-col min-h-[200px]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${report.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <Badge className={getCategoryColor(report.category)}>
                        {report.category}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getFormatBadge(report.format)}>
                    {report.format.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="mt-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-end">
                <div className="flex gap-2 mt-auto">
                  <Button
                    onClick={() => handleQuickExport(report)}
                    disabled={!report.available || loading === report.id}
                    className="flex-1"
                  >
                    {loading === report.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </>
                    )}
                  </Button>
                  {!report.available && (
                    <Badge variant="secondary" className="ml-2">
                      Coming Soon
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
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