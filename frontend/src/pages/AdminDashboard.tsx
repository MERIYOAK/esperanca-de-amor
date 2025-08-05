import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  LogOut, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Settings,
  Shield,
  Home,
  BarChart3,
  FileText,
  Bell,
  ChevronRight,
  Calendar,
  Activity,
  CreditCard,
  Tag,
  MessageSquare,
  Database,
  UserCheck
} from 'lucide-react';
import ProductManagement from './admin/ProductManagement';
import OrderManagement from './admin/OrderManagement';
import CustomerManagement from './admin/CustomerManagement';
import Analytics from './admin/Analytics';
import OfferManagement from './admin/OfferManagement';
import AnnouncementManagement from './admin/AnnouncementManagement';
import NewsletterManagement from './admin/NewsletterManagement';
import ReportsManagement from './admin/ReportsManagement';
import SettingsManagement from './admin/SettingsManagement';

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
}

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: number;
  pendingOrders: number;
}

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock dashboard stats - replace with real API calls
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1247,
    totalProducts: 89,
    totalOrders: 156,
    totalRevenue: 15420,
    recentOrders: 12,
    pendingOrders: 8
  });

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken');
    const adminDataStr = localStorage.getItem('adminData');

    if (!adminToken || !adminDataStr) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the admin dashboard",
        variant: "destructive",
      });
      navigate('/admin-login');
      return;
    }

    try {
      const admin = JSON.parse(adminDataStr);
      setAdminData(admin);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      navigate('/admin-login');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate('/admin-login');
  };

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: Home, color: 'text-blue-600' },
    { id: 'products', label: 'Products', icon: Package, color: 'text-green-600' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, color: 'text-orange-600' },
    { id: 'customers', label: 'Customers', icon: Users, color: 'text-purple-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-red-600' },
    { id: 'offers', label: 'Offers', icon: Tag, color: 'text-indigo-600' },
    { id: 'announcements', label: 'Announcements', icon: Bell, color: 'text-yellow-600' },
    { id: 'newsletter', label: 'Newsletter', icon: MessageSquare, color: 'text-pink-600' },
    { id: 'reports', label: 'Reports', icon: FileText, color: 'text-gray-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'text-gray-600' },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +3 new this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +8.1% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Manage Products
            </CardTitle>
            <CardDescription>
              Add, edit, or remove products from your store
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setActiveSection('products')}
            >
              View Products
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
              Process Orders
            </CardTitle>
            <CardDescription>
              View and process customer orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setActiveSection('orders')}
            >
              View Orders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Customer Management
            </CardTitle>
            <CardDescription>
              View and manage customer accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setActiveSection('customers')}
            >
              View Customers
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2 text-gray-600" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest actions and updates in your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New order received</p>
                <p className="text-xs text-gray-500">Order #1234 from John Doe - $89.99</p>
              </div>
              <span className="text-xs text-gray-500">2 minutes ago</span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registered</p>
                <p className="text-xs text-gray-500">jane.smith@example.com</p>
              </div>
              <span className="text-xs text-gray-500">15 minutes ago</span>
            </div>
            <div className="flex items-center space-x-4 p-3 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Product updated</p>
                <p className="text-xs text-gray-500">Fresh Avocados price updated to $2.99</p>
              </div>
              <span className="text-xs text-gray-500">1 hour ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSidebar = () => (
    <div className={`bg-white border-r border-gray-200 h-screen ${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <div className={`flex items-center ${sidebarOpen ? 'w-full' : 'justify-center'}`}>
            <Shield className="h-8 w-8 text-red-600" />
            {sidebarOpen && (
              <span className="ml-2 text-lg font-semibold text-gray-900">Admin</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:block"
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${sidebarOpen ? 'px-4' : 'px-2'} ${activeSection === item.id ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}
                onClick={() => setActiveSection(item.id)}
              >
                <Icon className={`h-4 w-4 ${sidebarOpen ? 'mr-3' : 'mx-auto'} ${activeSection === item.id ? 'text-white' : item.color}`} />
                {sidebarOpen && <span>{item.label}</span>}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      {renderSidebar()}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                  {activeSection}
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {adminData.name}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'products' && <ProductManagement />}
          {activeSection === 'orders' && <OrderManagement />}
          {activeSection === 'customers' && <CustomerManagement />}
          {activeSection === 'analytics' && <Analytics />}
          {activeSection === 'offers' && <OfferManagement />}
          {activeSection === 'announcements' && <AnnouncementManagement />}
          {activeSection === 'newsletter' && <NewsletterManagement />}
          {activeSection === 'reports' && <ReportsManagement />}
          {activeSection === 'settings' && <SettingsManagement />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard; 