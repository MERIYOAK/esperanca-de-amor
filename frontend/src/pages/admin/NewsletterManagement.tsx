import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Mail,
  UserCheck,
  UserX,
  Activity,
  BarChart3,
  Send,
  FileText,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

interface NewsletterSubscriber {
  _id: string;
  email: string;
  name?: string;
  isActive: boolean;
  preferences?: {
    promotions: boolean;
    updates: boolean;
    news: boolean;
  };
  emailCount: number;
  lastEmailSent?: string;
  createdAt: string;
  updatedAt: string;
}

interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  inactiveSubscribers: number;
  totalEmailsSent: number;
}

interface NewsletterData {
  subject: string;
  content: string;
  targetAudience: 'all' | 'active' | 'inactive';
  includePromotions: boolean;
}

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [selectedSubscriber, setSelectedSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [showSubscriberModal, setShowSubscriberModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSendNewsletterModal, setShowSendNewsletterModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<NewsletterStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    preferences: {
      promotions: true,
      updates: true,
      news: true
    }
  });
  const [newsletterForm, setNewsletterForm] = useState<NewsletterData>({
    subject: '',
    content: '',
    targetAudience: 'all',
    includePromotions: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && statusFilter !== 'all' && { isActive: statusFilter })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }

      const data = await response.json();
      setSubscribers(data.data.subscribers);
      setTotalPages(data.data.pagination.pages);
      setTotalSubscribers(data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscribers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubscriberDetails = async (subscriberId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers/${subscriberId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscriber details');
      }

      const data = await response.json();
      setSelectedSubscriber(data.data.subscriber);
      setShowSubscriberModal(true);
    } catch (error) {
      console.error('Error fetching subscriber details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscriber details",
        variant: "destructive",
      });
    }
  };

  const handleToggleSubscriberStatus = async (subscriberId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Find the current subscriber to get their current status
      const currentSubscriber = subscribers.find(s => s._id === subscriberId);
      if (!currentSubscriber) {
        throw new Error('Subscriber not found');
      }
      
      // Toggle the status
      const newStatus = !currentSubscriber.isActive;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers/${subscriberId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to toggle subscriber status');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
      });

      fetchSubscribers();
    } catch (error) {
      console.error('Error toggling subscriber status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle subscriber status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubscriber = async (subscriberId: string) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers/${subscriberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscriber');
      }

      toast({
        title: "Success",
        description: "Subscriber deleted successfully",
      });

      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubscriber = async () => {
    try {
      setCreateLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create subscriber');
      }

      toast({
        title: "Success",
        description: "Subscriber created successfully",
      });

      setCreateForm({
        email: '',
        name: '',
        preferences: {
          promotions: true,
          updates: true,
          news: true
        }
      });
      setShowCreateModal(false);
      fetchSubscribers();
    } catch (error) {
      console.error('Error creating subscriber:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscriber",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendNewsletter = async () => {
    try {
      setSendLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newsletterForm)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send newsletter');
      }

      toast({
        title: "Success",
        description: "Newsletter sent successfully",
      });

      setNewsletterForm({
        subject: '',
        content: '',
        targetAudience: 'all',
        includePromotions: false
      });
      setShowSendNewsletterModal(false);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send newsletter",
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  };

  const handleBulkDeleteSubscribers = async () => {
    if (selectedSubscribers.length === 0) {
      toast({
        title: "Warning",
        description: "Please select subscribers to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscriber(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/subscribers/bulk`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscriberIds: selectedSubscribers })
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscribers');
      }

      toast({
        title: "Success",
        description: `${selectedSubscribers.length} subscriber(s) deleted successfully`,
      });

      setSelectedSubscribers([]);
      fetchSubscribers();
    } catch (error) {
      console.error('Error deleting subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to delete subscribers",
        variant: "destructive",
      });
    }
  };

  const handleSelectSubscriber = (subscriberId: string) => {
    setSelectedSubscribers(prev => 
      prev.includes(subscriberId) 
        ? prev.filter(id => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  const handleSelectAllSubscribers = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map(s => s._id));
    }
  };

  const handleViewAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data.data.stats);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleExportSubscribers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/newsletter/export`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to export subscribers');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'newsletter-subscribers.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Subscribers exported successfully",
      });
    } catch (error) {
      console.error('Error exporting subscribers:', error);
      toast({
        title: "Error",
        description: "Failed to export subscribers",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
          <p className="text-gray-600">Manage newsletter subscribers and send updates</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleViewAnalytics}
            disabled={analyticsLoading}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button
            variant="outline"
            onClick={handleExportSubscribers}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSendNewsletterModal(true)}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Newsletter
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subscriber
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
            <p className="text-xs text-muted-foreground">
              All time subscribers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Subscribers</CardTitle>
            <UserX className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.filter(s => !s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Unsubscribed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscribers.reduce((sum, s) => sum + s.emailCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined emails
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search subscribers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Subscribers</CardTitle>
          <CardDescription>
            Manage your newsletter subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions Header */}
          {subscribers.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.length === subscribers.length && subscribers.length > 0}
                    onChange={handleSelectAllSubscribers}
                    className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({subscribers.length})
                  </span>
                </div>
                {selectedSubscribers.length > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedSubscribers.length} selected
                  </span>
                )}
              </div>
              {selectedSubscribers.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDeleteSubscribers}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected ({selectedSubscribers.length})
                </Button>
              )}
            </div>
          )}

          {subscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
              <p className="text-gray-600">Add your first subscriber to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber._id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{subscriber.email}</h3>
                        <Badge className={getStatusColor(subscriber.isActive)}>
                          {subscriber.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {subscriber.name && (
                          <span className="text-sm text-gray-600">({subscriber.name})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(subscriber.createdAt)}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {subscriber.emailCount} emails sent
                        </span>
                        {subscriber.lastEmailSent && (
                          <span className="flex items-center">
                            <Activity className="h-3 w-3 mr-1" />
                            Last: {formatDate(subscriber.lastEmailSent)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber._id)}
                        onChange={() => handleSelectSubscriber(subscriber._id)}
                        className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewSubscriberDetails(subscriber._id)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSubscriberStatus(subscriber._id)}
                        className="flex items-center space-x-1"
                      >
                        {subscriber.isActive ? (
                          <>
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span className="text-xs text-red-600">Deactivate</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-xs text-green-600">Activate</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubscriber(subscriber._id)}
                        className="text-red-600 hover:text-red-700 flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Subscriber Details Modal */}
      <Dialog open={showSubscriberModal} onOpenChange={setShowSubscriberModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Subscriber Details</DialogTitle>
            <DialogDescription>
              View detailed information about this subscriber
            </DialogDescription>
          </DialogHeader>
          {selectedSubscriber && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-gray-900">{selectedSubscriber.email}</p>
              </div>
              {selectedSubscriber.name && (
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-gray-700">{selectedSubscriber.name}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Status</Label>
                <Badge className={getStatusColor(selectedSubscriber.isActive)}>
                  {selectedSubscriber.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium">Emails Sent</Label>
                <p className="text-gray-700">{selectedSubscriber.emailCount}</p>
              </div>
              {selectedSubscriber.lastEmailSent && (
                <div>
                  <Label className="text-sm font-medium">Last Email Sent</Label>
                  <p className="text-gray-700">{formatDate(selectedSubscriber.lastEmailSent)}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Subscribed On</Label>
                <p className="text-gray-700">{formatDate(selectedSubscriber.createdAt)}</p>
              </div>
              {selectedSubscriber.preferences && (
                <div>
                  <Label className="text-sm font-medium">Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${selectedSubscriber.preferences.promotions ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">Promotions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${selectedSubscriber.preferences.updates ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">Updates</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`h-4 w-4 ${selectedSubscriber.preferences.news ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="text-sm">News</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Subscriber Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Subscriber</DialogTitle>
            <DialogDescription>
              Add a new subscriber to your newsletter
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter subscriber name"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Preferences</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="promotions"
                    checked={createForm.preferences.promotions}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, promotions: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="promotions" className="text-sm">Promotions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="updates"
                    checked={createForm.preferences.updates}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, updates: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="updates" className="text-sm">Updates</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="news"
                    checked={createForm.preferences.news}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, news: e.target.checked }
                    }))}
                    className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="news" className="text-sm">News</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSubscriber}
                disabled={createLoading || !createForm.email}
              >
                {createLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Subscriber
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Send Newsletter Modal */}
      <Dialog open={showSendNewsletterModal} onOpenChange={setShowSendNewsletterModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Newsletter</DialogTitle>
            <DialogDescription>
              Send a newsletter to your subscribers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={newsletterForm.subject}
                onChange={(e) => setNewsletterForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter newsletter subject"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newsletterForm.content}
                onChange={(e) => setNewsletterForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter newsletter content"
                rows={8}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={newsletterForm.targetAudience} onValueChange={(value) => setNewsletterForm(prev => ({ ...prev, targetAudience: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includePromotions"
                  checked={newsletterForm.includePromotions}
                  onChange={(e) => setNewsletterForm(prev => ({ ...prev, includePromotions: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="includePromotions" className="text-sm">Include Promotions</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSendNewsletterModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendNewsletter}
                disabled={sendLoading || !newsletterForm.subject || !newsletterForm.content}
              >
                {sendLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Newsletter
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Newsletter Analytics</DialogTitle>
            <DialogDescription>
              View detailed analytics for your newsletter
            </DialogDescription>
          </DialogHeader>
          {analyticsData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalSubscribers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.activeSubscribers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inactive Subscribers</CardTitle>
                  <UserX className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.inactiveSubscribers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Emails Sent</CardTitle>
                  <Mail className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalEmailsSent.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsletterManagement; 