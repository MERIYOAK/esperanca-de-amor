import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Megaphone, Calendar, ExternalLink, Users, MapPin, ChevronDown, ChevronUp, AlertTriangle, Info, CheckCircle, XCircle, Gift } from 'lucide-react';

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
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const announcementsPerPage = 3;

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
          
          // Sort by priority (urgent first) and then by date (newest first)
          const sortedAnnouncements = filteredAnnouncements.sort((a: Announcement, b: Announcement) => {
            const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
            const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
            
            if (aPriority !== bPriority) {
              return bPriority - aPriority;
            }
            
            return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
          });
          
          setAnnouncements(sortedAnnouncements);
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion':
        return Gift;
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'error':
        return XCircle;
      default:
        return Info;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      low: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[priority as keyof typeof colors] || colors.low}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getTargetAudienceLabel = (targetAudience: string) => {
    switch (targetAudience) {
      case 'all':
        return 'All Users';
      case 'registered':
        return 'Registered Users';
      case 'guests':
        return 'Guest Users';
      default:
        return 'All Users';
    }
  };

  const getDisplayLocationLabel = (displayLocation: string) => {
    switch (displayLocation) {
      case 'top':
        return 'Top Banner';
      case 'bottom':
        return 'Bottom Banner';
      case 'sidebar':
        return 'Sidebar';
      case 'modal':
        return 'Modal';
      default:
        return 'Top Banner';
    }
  };

  const getTargetAudienceIcon = (targetAudience: string) => {
        return <Users className="h-3 w-3" />;
  };

  const handleReadMore = (announcement: Announcement) => {
    // Track view/click
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/public/announcements/${announcement._id}/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }).catch(console.error);

    // For now, just show the full content in an alert
    // In a real implementation, you might want to show a modal or navigate to a detail page
    alert(`${announcement.title}\n\n${announcement.content}`);
  };

  // Calculate pagination
  const totalPages = Math.ceil(announcements.length / announcementsPerPage);
  const startIndex = (currentPage - 1) * announcementsPerPage;
  const endIndex = startIndex + announcementsPerPage;
  const displayedAnnouncements = announcements.slice(startIndex, endIndex);

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
            <Megaphone className="h-6 w-6 text-gray-600" />
            <h2 className="text-2xl font-bold text-gray-900">Latest News & Updates</h2>
              {announcements.length > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {announcements.length} {announcements.length === 1 ? 'announcement' : 'announcements'}
                </span>
              )}
            </div>
            {announcements.length > announcementsPerPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="flex items-center space-x-2"
              >
                {showAll ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    <span>Show Less</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    <span>Show All ({announcements.length})</span>
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-gray-600">Stay informed with our latest announcements and important updates.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Show urgent announcements first */}
          {announcements.filter(a => a.priority === 'urgent').length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Urgent Announcements
              </h3>
              <div className="space-y-4">
                {announcements
                  .filter(a => a.priority === 'urgent')
                  .slice(0, showAll ? undefined : 2)
                  .map((announcement) => (
                    <article key={announcement._id} className="bg-red-50 border border-red-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        {/* Image Section */}
                        <div className="w-full md:w-64 h-48 md:h-auto bg-red-100 relative overflow-hidden">
                          {announcement.images && announcement.images.length > 0 ? (
                            <img
                              src={announcement.images[0].url}
                              alt={announcement.images[0].alt || announcement.title}
                              className="w-full h-full object-cover object-center"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
                              <AlertTriangle className="h-12 w-12 text-red-400" />
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-6">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <h3 className="text-lg font-semibold text-red-700">
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
                              <div className="flex items-center space-x-1 bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                {getTargetAudienceIcon(announcement.targetAudience)}
                                <span className="text-xs font-medium">{getTargetAudienceLabel(announcement.targetAudience)}</span>
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReadMore(announcement)}
                              className="flex items-center space-x-2 border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600"
                            >
                              <span>Read More</span>
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}

          {/* Show regular announcements */}
          {displayedAnnouncements.filter(a => a.priority !== 'urgent').length > 0 && (
            <div className="space-y-6">
              {displayedAnnouncements
                .filter(a => a.priority !== 'urgent')
                .map((announcement) => {
                  const TypeIcon = getTypeIcon(announcement.type);
                  return (
            <article key={announcement._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Section - Left Side */}
                <div className="w-full md:w-64 h-48 md:h-auto bg-gray-100 relative overflow-hidden">
                  {announcement.images && announcement.images.length > 0 ? (
                    <img
                      src={announcement.images[0].url}
                      alt={announcement.images[0].alt || announcement.title}
                              className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                              <TypeIcon className="h-12 w-12 text-gray-400" />
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
                  );
                })}
            </div>
          )}

          {/* Pagination */}
          {!showAll && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Show all button when there are more announcements */}
          {!showAll && announcements.length > announcementsPerPage && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAll(true)}
                className="flex items-center space-x-2"
              >
                <ChevronDown className="h-4 w-4" />
                <span>Show All {announcements.length} Announcements</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterAnnouncements; 