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
  Bell, 
  Search, 
  Filter, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  MoreHorizontal,
  TrendingUp,
  Activity,
  FileText,
  X,
  ImageIcon,
  Users,
  MapPin,
  Clock,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  startDate: string;
  endDate: string;
  targetAudience: 'all' | 'registered' | 'guests';
  displayLocation: 'top' | 'bottom' | 'sidebar' | 'modal';
  images?: Array<{
    url: string;
    alt: string;
    caption: string;
  }>;
  views: number;
  clicks: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface AnnouncementStats {
  totalAnnouncements: number;
  activeAnnouncements: number;
  inactiveAnnouncements: number;
  expiringAnnouncements: number;
  totalViews: number;
  totalClicks: number;
  averageViews: number;
  averageClicks: number;
}

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnnouncementStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [selectedAnnouncementForEdit, setSelectedAnnouncementForEdit] = useState<Announcement | null>(null);
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    content: '',
    type: 'info' as const,
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    targetAudience: 'all' as const,
    displayLocation: 'top' as const,
    images: [] as File[]
  });
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error' | 'promotion',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    startDate: '',
    endDate: '',
    targetAudience: 'all' as 'all' | 'registered' | 'guests',
    displayLocation: 'top' as 'top' | 'bottom' | 'sidebar' | 'modal',
    images: [] as File[],
    removeImages: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, searchTerm, typeFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    console.log('showCreateModal state changed to:', showCreateModal);
  }, [showCreateModal]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter && typeFilter !== 'all' && { type: typeFilter }),
        ...(priorityFilter && priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(statusFilter && statusFilter !== 'all' && { isActive: statusFilter })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      setAnnouncements(data.data.announcements);
      setTotalPages(data.data.pagination.pages);
      setTotalAnnouncements(data.data.pagination.total);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewAnnouncementDetails = async (announcementId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/${announcementId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch announcement details');
      }

      const data = await response.json();
      setSelectedAnnouncement(data.data.announcement);
      setShowAnnouncementModal(true);
    } catch (error) {
      console.error('Error fetching announcement details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch announcement details",
        variant: "destructive",
      });
    }
  };

  const handleToggleAnnouncementStatus = async (announcementId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/${announcementId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle announcement status');
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: data.message,
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      toast({
        title: "Error",
        description: "Failed to toggle announcement status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/${announcementId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcement');
      }

      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      setCreateLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const formData = new FormData();
      formData.append('title', createForm.title);
      formData.append('content', createForm.content);
      formData.append('type', createForm.type);
      formData.append('priority', createForm.priority);
      formData.append('startDate', createForm.startDate);
      formData.append('endDate', createForm.endDate);
      formData.append('targetAudience', createForm.targetAudience);
      formData.append('displayLocation', createForm.displayLocation);
      
      createForm.images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create announcement');
      }

      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setCreateForm({
        title: '',
        content: '',
        type: 'info',
        priority: 'medium',
        startDate: '',
        endDate: '',
        targetAudience: 'all',
        displayLocation: 'top',
        images: []
      });
      setShowCreateModal(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditAnnouncement = async () => {
    if (!selectedAnnouncementForEdit) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('content', editForm.content);
      formData.append('type', editForm.type);
      formData.append('priority', editForm.priority);
      formData.append('startDate', editForm.startDate);
      formData.append('endDate', editForm.endDate);
      formData.append('targetAudience', editForm.targetAudience);
      formData.append('displayLocation', editForm.displayLocation);
      
      // Add new image (replaces existing)
      if (editForm.images.length > 0) {
        formData.append('images', editForm.images[0]);
      }

      // If no new image is uploaded, preserve the existing one
      if (editForm.images.length === 0 && selectedAnnouncementForEdit.images && selectedAnnouncementForEdit.images.length > 0) {
        formData.append('existingImage', JSON.stringify(selectedAnnouncementForEdit.images[0]));
      }

      // Add images to remove
      editForm.removeImages.forEach((imageUrl) => {
        formData.append('removeImages', imageUrl);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/${selectedAnnouncementForEdit._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update announcement');
      }

      toast({
        title: "Success",
        description: "Announcement updated successfully",
      });

      setEditForm({
        title: '',
        content: '',
        type: 'info',
        priority: 'medium',
        startDate: '',
        endDate: '',
        targetAudience: 'all',
        displayLocation: 'top',
        images: [],
        removeImages: []
      });
      setSelectedAnnouncementForEdit(null);
      setShowEditModal(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update announcement",
        variant: "destructive",
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleBulkDeleteAnnouncements = async () => {
    if (selectedAnnouncements.length === 0) {
      toast({
        title: "Warning",
        description: "Please select announcements to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedAnnouncements.length} announcement(s)?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/announcements/bulk`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ announcementIds: selectedAnnouncements })
      });

      if (!response.ok) {
        throw new Error('Failed to delete announcements');
      }

      toast({
        title: "Success",
        description: `${selectedAnnouncements.length} announcement(s) deleted successfully`,
      });

      setSelectedAnnouncements([]);
      setShowBulkActions(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcements:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcements",
        variant: "destructive",
      });
    }
  };

  const handleSelectAnnouncement = (announcementId: string) => {
    setSelectedAnnouncements(prev => 
      prev.includes(announcementId) 
        ? prev.filter(id => id !== announcementId)
        : [...prev, announcementId]
    );
  };

  const handleSelectAllAnnouncements = () => {
    if (selectedAnnouncements.length === announcements.length) {
      setSelectedAnnouncements([]);
    } else {
      setSelectedAnnouncements(announcements.map(a => a._id));
    }
  };

  const openEditModal = (announcement: Announcement) => {
    setSelectedAnnouncementForEdit(announcement);
    setEditForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type as 'info' | 'success' | 'warning' | 'error' | 'promotion',
      priority: announcement.priority as 'low' | 'medium' | 'high' | 'urgent',
      startDate: announcement.startDate.split('T')[0] + 'T' + announcement.startDate.split('T')[1].substring(0, 5),
      endDate: announcement.endDate.split('T')[0] + 'T' + announcement.endDate.split('T')[1].substring(0, 5),
      targetAudience: announcement.targetAudience as 'all' | 'registered' | 'guests',
      displayLocation: announcement.displayLocation as 'top' | 'bottom' | 'sidebar' | 'modal',
      images: [],
      removeImages: []
    });
    setShowEditModal(true);
  };

  const handleViewAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const url = `${import.meta.env.VITE_API_URL}/api/admin/announcements/stats`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data.data);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics",
        variant: "destructive",
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setCreateForm(prev => ({
      ...prev,
      images: files.slice(0, 1) // Only take the first image
    }));
  };

  const handleRemoveImage = (index: number) => {
    setCreateForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      promotion: 'bg-purple-100 text-purple-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
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

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={`${colors[priority as keyof typeof colors]} text-xs font-medium`}>
        {priority}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      info: Bell,
      success: CheckCircle,
      warning: AlertCircle,
      error: XCircle,
      promotion: TrendingUp
    };
    const IconComponent = icons[type as keyof typeof icons] || Bell;
    return React.createElement(IconComponent, { className: "h-4 w-4" });
  };

  const getPriorityIcon = (priority: string) => {
    const icons = {
      low: AlertCircle,
      medium: Info,
      high: AlertTriangle,
      urgent: XCircle
    };
    const IconComponent = icons[priority as keyof typeof icons] || Info;
    return React.createElement(IconComponent, { className: "h-4 w-4" });
  };

  const getTargetAudienceIcon = (audience: string) => {
    const icons = {
      all: Users,
      registered: Info,
      guests: FileText
    };
    const IconComponent = icons[audience as keyof typeof icons] || Users;
    return React.createElement(IconComponent, { className: "h-4 w-4" });
  };

  const getTargetAudienceLabel = (audience: string) => {
    const labels = {
      all: 'All Users',
      registered: 'Registered Users',
      guests: 'Guest Users'
    };
    return labels[audience as keyof typeof labels];
  };

  const getDisplayLocationLabel = (location: string) => {
    const labels = {
      top: 'Top',
      bottom: 'Bottom',
      sidebar: 'Sidebar',
      modal: 'Modal'
    };
    return labels[location as keyof typeof labels];
  };

  const [showAll, setShowAll] = useState(false);
  const displayedAnnouncements = announcements.filter(a => a.priority !== 'urgent');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Announcement Management</h2>
          <p className="text-sm text-gray-600">Create and manage site announcements</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full sm:w-auto" onClick={handleViewAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto text-sm cursor-pointer font-medium shadow-lg" 
            onClick={() => {
              alert('Create button clicked!');
              console.log('Create button clicked');
              console.log('Current showCreateModal state:', showCreateModal);
              setShowCreateModal(true);
              console.log('Modal state set to true');
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Announcement</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              All time announcements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.filter(a => a.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.reduce((sum, a) => sum + a.views, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {announcements.reduce((sum, a) => sum + a.clicks, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined clicks
            </p>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="news">News</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setPriorityFilter('all');
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

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(announcement.type)}
                    <div>
                      <CardTitle className="text-base sm:text-lg">{announcement.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {new Date(announcement.createdAt).toLocaleDateString()} at {new Date(announcement.createdAt).toLocaleTimeString()}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {getPriorityIcon(announcement.priority)}
                    <span className="ml-1 capitalize text-xs">{announcement.priority}</span>
                  </Badge>
                  <Badge variant={announcement.isActive ? "default" : "secondary"} className="text-xs">
                    {announcement.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Announcement Image */}
              {announcement.images && announcement.images.length > 0 && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={announcement.images[0].url}
                    alt={announcement.images[0].alt}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}

              {/* Announcement Content */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-3">{announcement.content}</p>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Target:</span>
                  <Badge variant="outline" className="text-xs">
                    {getTargetAudienceIcon(announcement.targetAudience)}
                    <span className="ml-1">{announcement.targetAudience}</span>
                  </Badge>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{announcement.views || 0}</p>
                    <p className="text-xs text-gray-600">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{announcement.clicks || 0}</p>
                    <p className="text-xs text-gray-600">Clicks</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{announcement.views / (announcement.clicks || 1) * 100 || 0}%</p>
                    <p className="text-xs text-gray-600">Engagement</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{announcement.views + announcement.clicks || 0}</p>
                    <p className="text-xs text-gray-600">Reach</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t gap-4">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(announcement.type)}>
                    {getTypeIcon(announcement.type)}
                    <span className="ml-1 capitalize text-xs">{announcement.type}</span>
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(announcement)}
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-sm w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAnnouncementStatus(announcement._id)}
                    className={`text-sm w-full sm:w-auto ${
                      announcement.isActive 
                        ? 'text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white' 
                        : 'text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                    }`}
                  >
                    <span className="hidden sm:inline">{announcement.isActive ? 'Deactivate' : 'Activate'}</span>
                    <span className="sm:hidden">{announcement.isActive ? 'Deactivate' : 'Activate'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                    className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Delete</span>
                    <span className="sm:hidden">Delete</span>
                  </Button>
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
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalAnnouncements)} of {totalAnnouncements} announcements
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

      {announcements.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Announcements Found</h3>
          <p className="text-sm text-gray-600">
            {searchTerm || typeFilter !== 'all' || priorityFilter !== 'all'
              ? "Try adjusting your search or filter criteria"
              : "Create your first announcement to get started"
            }
          </p>
          <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Announcement</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </div>
      )}

      {/* Announcement Details Modal */}
      <Dialog open={showAnnouncementModal} onOpenChange={setShowAnnouncementModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>
              View detailed information about this announcement
            </DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Title</Label>
                <p className="text-gray-900">{selectedAnnouncement.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Content</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAnnouncement.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Badge className={getTypeColor(selectedAnnouncement.type)}>
                    {selectedAnnouncement.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge className={getPriorityColor(selectedAnnouncement.priority)}>
                    {selectedAnnouncement.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedAnnouncement.isActive)}>
                    {selectedAnnouncement.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Target Audience</Label>
                  <p className="text-gray-700">{selectedAnnouncement.targetAudience}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Display Location</Label>
                  <p className="text-gray-700">{selectedAnnouncement.displayLocation}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Views</Label>
                  <p className="text-gray-700">{selectedAnnouncement.views.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Clicks</Label>
                  <p className="text-gray-700">{selectedAnnouncement.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Start Date</Label>
                  <p className="text-gray-700">{formatDate(selectedAnnouncement.startDate)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">End Date</Label>
                  <p className="text-gray-700">{formatDate(selectedAnnouncement.endDate)}</p>
                </div>
              </div>
              {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Images</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {selectedAnnouncement.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image.url}
                          alt={image.alt}
                          className="w-full h-32 object-cover object-center rounded-lg"
                        />
                        {image.caption && (
                          <p className="text-xs text-gray-600 mt-1">{image.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Created By</Label>
                <p className="text-gray-700">{selectedAnnouncement.createdBy.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Created At</Label>
                <p className="text-gray-700">{formatDate(selectedAnnouncement.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Announcement Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Create a new announcement to display on your site
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={createForm.content}
                onChange={(e) => setCreateForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={createForm.priority} onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={createForm.startDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={createForm.endDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={createForm.targetAudience} onValueChange={(value) => setCreateForm(prev => ({ ...prev, targetAudience: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="registered">Registered Users</SelectItem>
                    <SelectItem value="guests">Guest Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="displayLocation">Display Location</Label>
                <Select value={createForm.displayLocation} onValueChange={(value) => setCreateForm(prev => ({ ...prev, displayLocation: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="modal">Modal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="images">Image (Optional)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Upload one image for the announcement (optional)</p>
              {createForm.images.length > 0 && (
                <div className="mt-2 space-y-2">
                  {createForm.images.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveImage(index)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              {createForm.images.length > 1 && (
                <p className="text-xs text-red-500 mt-1">Please upload only one image</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <div className="text-xs text-gray-500 mb-2 sm:mb-0">
                {!createForm.title && <div>Title is required</div>}
                {!createForm.content && <div>Content is required</div>}
                {!createForm.endDate && <div>End date is required</div>}
              </div>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  console.log('Create button clicked in modal');
                  console.log('Form state:', createForm);
                  console.log('createLoading:', createLoading);
                  console.log('title:', createForm.title);
                  console.log('content:', createForm.content);
                  console.log('endDate:', createForm.endDate);
                  handleCreateAnnouncement();
                }}
                disabled={createLoading}
                className="w-full sm:w-auto"
              >
                {createLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Announcement Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Edit the details of this announcement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="editContent">Content *</Label>
              <Textarea
                id="editContent"
                value={editForm.content}
                onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter announcement content"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editType">Type</Label>
                <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editPriority">Priority</Label>
                <Select value={editForm.priority} onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartDate">Start Date</Label>
                <Input
                  id="editStartDate"
                  type="datetime-local"
                  value={editForm.startDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="editEndDate">End Date *</Label>
                <Input
                  id="editEndDate"
                  type="datetime-local"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTargetAudience">Target Audience</Label>
                <Select value={editForm.targetAudience} onValueChange={(value) => setEditForm(prev => ({ ...prev, targetAudience: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="registered">Registered Users</SelectItem>
                    <SelectItem value="guests">Guest Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editDisplayLocation">Display Location</Label>
                <Select value={editForm.displayLocation} onValueChange={(value) => setEditForm(prev => ({ ...prev, displayLocation: value as any }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="modal">Modal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editImages">Image *</Label>
              <Input
                id="editImages"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setEditForm(prev => ({
                    ...prev,
                    images: files // Replace with new image
                  }));
                }}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Upload a new image to replace the existing one</p>
              
              {/* Show existing image */}
              {selectedAnnouncementForEdit?.images && selectedAnnouncementForEdit.images.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Current Image:</p>
                  <div className="border rounded p-2">
                    <img
                      src={selectedAnnouncementForEdit.images[0].url}
                      alt={selectedAnnouncementForEdit.images[0].alt}
                      className="w-full h-32 object-cover rounded"
                    />
                    <p className="text-xs text-gray-600 mt-1">{selectedAnnouncementForEdit.images[0].alt}</p>
                  </div>
                </div>
              )}
              
              {editForm.images.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-gray-700">New Image:</p>
                  {editForm.images.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded">
                      <ImageIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditForm(prev => ({
                          ...prev,
                          images: []
                        }))}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditAnnouncement}
                disabled={editLoading || !editForm.title || !editForm.content || !editForm.endDate}
                className="w-full sm:w-auto"
              >
                {editLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Announcement
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Actions */}
      {selectedAnnouncements.length > 0 && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleBulkDeleteAnnouncements}
            disabled={editLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected ({selectedAnnouncements.length})
          </Button>
        </div>
      )}

      {/* Analytics Modal */}
      <Dialog open={showAnalyticsModal} onOpenChange={setShowAnalyticsModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Announcement Analytics</DialogTitle>
            <DialogDescription>
              View detailed analytics for your announcements
            </DialogDescription>
          </DialogHeader>
          {analyticsData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Announcements</CardTitle>
                  <Bell className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalAnnouncements}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.activeAnnouncements}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Eye className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  <Activity className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.totalClicks.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementManagement; 