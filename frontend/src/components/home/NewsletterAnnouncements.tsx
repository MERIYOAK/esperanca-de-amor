import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Megaphone, Calendar, ExternalLink, Users, MapPin } from 'lucide-react';

interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  startDate: string;
  endDate: string;
  displayLocation: string;
  targetAudience: string;
  views: number;
  clicks: number;
  images?: Array<{
    url: string;
    alt: string;
    caption: string;
  }>;
}

const NewsletterAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/announcements/active`);
        
        if (response.ok) {
          const data = await response.json();
          const activeAnnouncements = data.data?.announcements || data.announcements || [];
          
          // Filter announcements that are active and within date range
          const now = new Date();
          const filteredAnnouncements = activeAnnouncements.filter((announcement: Announcement) => {
            const startDate = new Date(announcement.startDate);
            const endDate = new Date(announcement.endDate);
            return announcement.isActive && now >= startDate && now <= endDate;
          });
          
          // Limit to maximum 5 announcements
          setAnnouncements(filteredAnnouncements.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promotion':
        return 'text-purple-600';
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full ml-2">URGENT</span>;
      case 'high':
        return <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full ml-2">HIGH</span>;
      default:
        return null;
    }
  };

  // Convert target audience to user-friendly label
  const getTargetAudienceLabel = (targetAudience: string) => {
    switch (targetAudience) {
      case 'all':
        return 'For Everyone';
      case 'registered':
        return 'Members Only';
      case 'guests':
        return 'New Customers';
      default:
        return 'For Everyone';
    }
  };

  // Convert display location to user-friendly label
  const getDisplayLocationLabel = (displayLocation: string) => {
    switch (displayLocation) {
      case 'top':
        return 'Featured';
      case 'bottom':
        return 'Updates';
      case 'sidebar':
        return 'News';
      case 'modal':
        return 'Important';
      default:
        return 'News';
    }
  };

  // Get appropriate icon for target audience
  const getTargetAudienceIcon = (targetAudience: string) => {
    switch (targetAudience) {
      case 'registered':
        return <Users className="h-3 w-3" />;
      case 'guests':
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const handleReadMore = (announcement: Announcement) => {
    // Open announcement in a new window/tab
    const announcementUrl = `/announcement/${announcement._id}`;
    window.open(announcementUrl, '_blank');
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (announcements.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-12 relative">
      {/* Fading border effect at top - fades to bg-secondary/30 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-secondary/30 via-secondary/20 to-transparent"></div>
      
      {/* Fading border effect at bottom - fades to red gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-red-50 via-red-25 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Megaphone className="h-6 w-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Latest News & Updates</h2>
          </div>
          <p className="text-gray-600">Stay informed with our latest announcements and important updates.</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {announcements.map((announcement) => (
            <article key={announcement._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Section - Left Side */}
                <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100 relative overflow-hidden">
                  {announcement.images && announcement.images.length > 0 ? (
                    <img
                      src={announcement.images[0].url}
                      alt={announcement.images[0].alt || announcement.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                      <Megaphone className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content Section - Right Side */}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-lg font-semibold ${getTypeColor(announcement.type)}`}>
                        {announcement.title}
                      </h3>
                      {getPriorityBadge(announcement.priority)}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(announcement.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {announcement.content.length > 200 
                        ? `${announcement.content.substring(0, 200)}...` 
                        : announcement.content
                      }
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {/* User-friendly target audience label */}
                      <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                        {getTargetAudienceIcon(announcement.targetAudience)}
                        <span className="text-xs font-medium">{getTargetAudienceLabel(announcement.targetAudience)}</span>
                      </div>
                      
                      {/* User-friendly display location label */}
                      <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs font-medium">{getDisplayLocationLabel(announcement.displayLocation)}</span>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReadMore(announcement)}
                      className="flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 hover:text-white hover:border-red-600 hover:scale-105 transition-all duration-300 group relative"
                    >
                      <span className="relative z-10">Read More</span>
                      <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300 relative z-10" />
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsletterAnnouncements; 