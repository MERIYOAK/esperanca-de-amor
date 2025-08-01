import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  User,
  MapPin,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Gift,
  Info
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  startDate: string;
  endDate: string;
  images: Array<{
    url: string;
    alt: string;
    caption: string;
  }>;
  targetAudience: 'all' | 'registered' | 'guests';
  displayLocation: 'top' | 'bottom' | 'sidebar' | 'modal';
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  views: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

const AnnouncementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!id) {
        setError('Announcement ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/announcements/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          setAnnouncement(data.data?.announcement || null);
        } else if (response.status === 404) {
          setError('Announcement not found');
        } else {
          setError('Failed to fetch announcement');
        }
      } catch (error) {
        console.error('Error fetching announcement:', error);
        setError('Failed to load announcement');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, [id]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'promotion':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-600 text-white';
      case 'medium':
        return 'bg-yellow-600 text-white';
      case 'low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isExpiringSoon = (endDate: string) => {
    const now = new Date();
    const expiry = new Date(endDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Announcement Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The announcement you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              {getTypeIcon(announcement.type)}
              <Badge className={getTypeColor(announcement.type)}>
                {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
              </Badge>
              <Badge className={getPriorityColor(announcement.priority)}>
                {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
              </Badge>
              {isExpired(announcement.endDate) && (
                <Badge variant="destructive">Expired</Badge>
              )}
              {isExpiringSoon(announcement.endDate) && !isExpired(announcement.endDate) && (
                <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
              {announcement.title}
            </h1>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Content Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Images */}
              {announcement.images && announcement.images.length > 0 && (
                <div className="space-y-4">
                  {announcement.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image.url}
                        alt={image.alt || announcement.title}
                        className="w-full h-64 object-cover rounded-lg shadow-lg"
                      />
                      {image.caption && (
                        <div className="mt-2 text-sm text-gray-600 text-center italic">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Content */}
              <Card className="p-6">
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcement Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">Start Date</div>
                      <div className="font-medium">{formatDate(announcement.startDate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="text-sm text-gray-500">End Date</div>
                      <div className={`font-medium ${
                        isExpired(announcement.endDate) 
                          ? 'text-red-600' 
                          : isExpiringSoon(announcement.endDate)
                          ? 'text-orange-600'
                          : 'text-gray-900'
                      }`}>
                        {formatDate(announcement.endDate)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Author Card */}
              {announcement.createdBy && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Published By</h3>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {announcement.createdBy.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{announcement.createdBy.name}</div>
                      <div className="text-sm text-gray-500">{announcement.createdBy.email}</div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AnnouncementDetail; 