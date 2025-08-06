import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Tag, 
  Search, 
  Filter, 
  Eye, 
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Percent,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  MoreHorizontal,
  TrendingUp,
  Activity,
  FileText,
  X
} from 'lucide-react';

interface Offer {
  _id: string;
  title: string;
  description: string;
  code: string;
  type: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  minimumOrderAmount: number;
  maximumDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  applicableProducts: Array<{
    _id: string;
    name: string;
    price: number;
    images?: string[];
  }>;
  isActive: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface OfferStats {
  totalOffers: number;
  activeOffers: number;
  inactiveOffers: number;
  expiringOffers: number;
  activePercentage: number;
}

const OfferManagement = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<OfferStats | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    code: '',
    type: 'discount',
    discountValue: 0,
    discountType: 'percentage',
    minimumOrderAmount: 0,
    maximumDiscountAmount: 0,
    startDate: '',
    endDate: '',
    usageLimit: 0,
    isActive: true,
    image: null,
    applicableProducts: []
  });
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOffers();
    fetchProducts(); // Fetch products on component mount
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  // Filter products based on search term
  useEffect(() => {
    if (productSearchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(productSearchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [products, productSearchTerm]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Offers response:', data);
        
        // Handle case where data structure might be different
        if (data.data && data.data.offers && data.data.pagination) {
          setOffers(data.data.offers);
          setTotalPages(data.data.pagination.pages);
          setTotalOffers(data.data.pagination.total);
        } else if (data.data && Array.isArray(data.data)) {
          // Handle case where response is just an array of offers
          setOffers(data.data);
          setTotalPages(1);
          setTotalOffers(data.data.length);
        } else {
          // Handle empty or unexpected response
          setOffers([]);
          setTotalPages(1);
          setTotalOffers(0);
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Backend error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch offers');
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load offers. Please check if the backend server is running.",
        variant: "destructive",
      });
      // Set empty state on error
      setOffers([]);
      setTotalPages(1);
      setTotalOffers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOfferDetails = async (offerId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers/${offerId}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSelectedOffer(data.data);
        setShowOfferModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to fetch offer details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching offer details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch offer details",
        variant: "destructive",
      });
    }
  };

  const handleToggleOfferStatus = async (offerId: string) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers/${offerId}/toggle`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
        fetchOffers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to update offer status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating offer status:', error);
      toast({
        title: "Error",
        description: "Failed to update offer status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers/${offerId}`,
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
          description: "Offer deleted successfully",
        });
        fetchOffers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to delete offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      toast({
        title: "Error",
        description: "Failed to delete offer",
        variant: "destructive",
      });
    }
  };

  const handleExportOffers = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      toast({
        title: "Exporting Offers",
        description: "Preparing your export...",
      });

      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== '') {
        params.append('status', statusFilter);
      }

      if (typeFilter && typeFilter !== '') {
        params.append('type', typeFilter);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers/export?${params}`,
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
        a.download = `offers-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Export Successful",
          description: "Offers exported successfully as Excel file",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to export offers');
      }
    } catch (error) {
      console.error('Error exporting offers:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export offers. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewAnalytics = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      setAnalyticsLoading(true);
      setShowAnalyticsModal(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers/stats`,
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

  const handleCloseOfferModal = () => {
    setShowOfferModal(false);
    setSelectedOffer(null);
  };

  const handleCloseAnalyticsModal = () => {
    setShowAnalyticsModal(false);
    setAnalyticsData(null);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      title: '',
      description: '',
      code: '',
      type: 'discount',
      discountValue: 0,
      discountType: 'percentage',
      minimumOrderAmount: 0,
      maximumDiscountAmount: 0,
      startDate: '',
      endDate: '',
      usageLimit: 0,
      isActive: true,
      image: null,
      applicableProducts: []
    });
    setSelectedProducts([]);
    setProductSearchTerm('');
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products?limit=100`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      const isSelected = prev.includes(productId);
      if (isSelected) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAllVisible = () => {
    const visibleProductIds = filteredProducts.map(product => product._id);
    setSelectedProducts(prev => {
      const newSelected = [...prev];
      visibleProductIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      return newSelected;
    });
  };

  const handleDeselectAllVisible = () => {
    const visibleProductIds = filteredProducts.map(product => product._id);
    setSelectedProducts(prev => prev.filter(id => !visibleProductIds.includes(id)));
  };

  const handleSelectByCategory = (category) => {
    const categoryProducts = products.filter(product => 
      product.category?.toLowerCase() === category.toLowerCase()
    );
    const categoryProductIds = categoryProducts.map(product => product._id);
    setSelectedProducts(prev => {
      const newSelected = [...prev];
      categoryProductIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      return newSelected;
    });
  };

  const handleCreateOffer = async () => {
    try {
      setCreateLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      // Validate required fields
      if (!createForm.title || !createForm.code || !createForm.discountValue || !createForm.startDate || !createForm.endDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Create FormData for multipart/form-data submission
      const formData = new FormData();
      formData.append('title', createForm.title);
      formData.append('description', createForm.description);
      formData.append('code', createForm.code);
      formData.append('type', createForm.type);
      formData.append('discountValue', createForm.discountValue.toString());
      formData.append('discountType', createForm.discountType);
      formData.append('minimumOrderAmount', createForm.minimumOrderAmount.toString());
      formData.append('maximumDiscountAmount', createForm.maximumDiscountAmount.toString());
      formData.append('startDate', createForm.startDate);
      formData.append('endDate', createForm.endDate);
      formData.append('usageLimit', createForm.usageLimit.toString());
      formData.append('isActive', createForm.isActive.toString());
      
      // Add selected products
      selectedProducts.forEach(productId => {
        formData.append('applicableProducts[]', productId);
      });
      
      // Add image if selected
      if (createForm.image) {
        formData.append('image', createForm.image);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/offers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`
          },
          body: formData
        }
      );

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message || "Offer created successfully",
        });
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          code: '',
          type: 'discount',
          discountValue: 0,
          discountType: 'percentage',
          minimumOrderAmount: 0,
          maximumDiscountAmount: 0,
          startDate: '',
          endDate: '',
          usageLimit: 0,
          isActive: true,
          image: null,
          applicableProducts: []
        });
        setSelectedProducts([]);
        fetchOffers();
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: "Error",
          description: errorData.message || "Failed to create offer",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: "Failed to create offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />;
  };

  const getDiscountDisplay = (offer: Offer) => {
    if (offer.discountType === 'percentage') {
      return `${offer.discountValue}%`;
    } else {
      return `$${offer.discountValue}`;
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const isExpiringSoon = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return end <= sevenDaysFromNow && end > now;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Offer Management</h2>
          <p className="text-sm text-gray-600">Create and manage promotional offers and discounts</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button variant="outline" size="sm" className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white" onClick={handleExportOffers}>
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export Offers</span>
            <span className="sm:hidden">Export</span>
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleViewAnalytics}>
            <Activity className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">View Analytics</span>
            <span className="sm:hidden">Analytics</span>
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => {
            setShowCreateModal(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Create Offer</span>
            <span className="sm:hidden">Create</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search offers by title, code..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            >
              <option value="">All Types</option>
              <option value="discount">Discount</option>
              <option value="free_shipping">Free Shipping</option>
              <option value="buy_one_get_one">Buy One Get One</option>
              <option value="cashback">Cashback</option>
            </select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
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

      {/* Offers List */}
      <div className="space-y-4">
        {offers.map((offer) => (
          <Card key={offer._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {offer.image && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border flex-shrink-0">
                      <img 
                        src={offer.image} 
                        alt={offer.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Tag className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{offer.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{offer.code}</span>
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(offer.isActive)}>
                    {getStatusIcon(offer.isActive)}
                    <span className="ml-1 text-xs">{offer.isActive ? 'Active' : 'Inactive'}</span>
                  </Badge>
                  {isExpired(offer.endDate) && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                  {isExpiringSoon(offer.endDate) && !isExpired(offer.endDate) && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Offer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center text-sm">
                    <Info className="h-4 w-4 mr-2" />
                    Offer Details
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p className="flex items-center">
                      <span className="font-medium">Type:</span>
                      <span className="ml-2 capitalize">{offer.type.replace('_', ' ')}</span>
                    </p>
                    <p className="flex items-center">
                      {offer.discountType === 'percentage' ? <Percent className="h-4 w-4 mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
                      Discount: {getDiscountDisplay(offer)}
                    </p>
                    {offer.minimumOrderAmount > 0 && (
                      <p className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Min Order: ${offer.minimumOrderAmount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Validity Period
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>Start: {new Date(offer.startDate).toLocaleDateString()}</p>
                    <p>End: {new Date(offer.endDate).toLocaleDateString()}</p>
                    {offer.usageLimit && (
                      <p>Usage Limit: {offer.usageLimit}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Applicable Products
                  </h4>
                  <div className="text-sm">
                    <p>{offer.applicableProducts.length} products selected</p>
                    {offer.applicableProducts.length > 0 && (
                      <p className="text-gray-600 truncate">
                        {offer.applicableProducts.slice(0, 2).map(p => p.name).join(', ')}
                        {offer.applicableProducts.length > 2 && '...'}
                      </p>
                    )}
                    {offer.applicableProducts.length === 0 && (
                      <p className="text-gray-500 italic">Applies to all products</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                <div className="text-sm text-gray-600">
                  <p>Created: {new Date(offer.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewOfferDetails(offer._id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleOfferStatus(offer._id)}
                    className={offer.isActive 
                      ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm" 
                      : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-sm"
                    }
                  >
                    {offer.isActive ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                    <span className="hidden sm:inline">{offer.isActive ? 'Deactivate' : 'Activate'}</span>
                    <span className="sm:hidden">{offer.isActive ? 'Deactivate' : 'Activate'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteOffer(offer._id)}
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
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
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalOffers)} of {totalOffers} offers
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

      {offers.length === 0 && !loading && (
        <div className="text-center py-12">
          <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Offers Found</h3>
          <p className="text-gray-600 text-sm">
            {searchTerm || statusFilter || typeFilter 
              ? "Try adjusting your search or filter criteria"
              : "No offers have been created yet"
            }
          </p>
        </div>
      )}

      {/* Offer Details Modal */}
      {showOfferModal && selectedOffer && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseOfferModal}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {selectedOffer.image && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border flex-shrink-0">
                    <img 
                      src={selectedOffer.image} 
                      alt={selectedOffer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <Tag className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                      {selectedOffer.title}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Code: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">{selectedOffer.code}</span>
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseOfferModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-shrink-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Close Offer Details</span>
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Offer Status */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 flex items-center text-sm">
                  <Info className="h-4 w-4 mr-2" />
                  Offer Status
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={getStatusColor(selectedOffer.isActive)}>
                    {getStatusIcon(selectedOffer.isActive)}
                    <span className="ml-1 text-xs">{selectedOffer.isActive ? 'Active' : 'Inactive'}</span>
                  </Badge>
                  {isExpired(selectedOffer.endDate) && (
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Expired
                    </Badge>
                  )}
                  {isExpiringSoon(selectedOffer.endDate) && !isExpired(selectedOffer.endDate) && (
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Expiring Soon
                    </Badge>
                  )}
                </div>
              </div>

              {/* Offer Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 flex items-center text-sm">
                  <Info className="h-4 w-4 mr-2" />
                  Offer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Title:</span> {selectedOffer.title}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Type:</span> {selectedOffer.type.replace('_', ' ')}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Discount:</span> {getDiscountDisplay(selectedOffer)}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Description:</span> {selectedOffer.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      Validity Period
                    </h4>
                    <div className="text-sm space-y-1">
                      <p>Start: {new Date(selectedOffer.startDate).toLocaleDateString()}</p>
                      <p>End: {new Date(selectedOffer.endDate).toLocaleDateString()}</p>
                      {selectedOffer.minimumOrderAmount > 0 && (
                        <p>Min Order: ${selectedOffer.minimumOrderAmount}</p>
                      )}
                      {selectedOffer.maximumDiscountAmount && (
                        <p>Max Discount: ${selectedOffer.maximumDiscountAmount}</p>
                      )}
                      {selectedOffer.usageLimit && (
                        <p>Usage Limit: {selectedOffer.usageLimit}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Applicable Products */}
              {selectedOffer.applicableProducts.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    Applicable Products ({selectedOffer.applicableProducts.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedOffer.applicableProducts.map((product, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-sm text-gray-600">${product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="border-t pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      Created: {new Date(selectedOffer.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Updated: {new Date(selectedOffer.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleOfferStatus(selectedOffer._id)}
                      className={selectedOffer.isActive 
                        ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm" 
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-sm"
                      }
                    >
                      {selectedOffer.isActive ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                      <span className="hidden sm:inline">{selectedOffer.isActive ? 'Deactivate' : 'Activate'}</span>
                      <span className="sm:hidden">{selectedOffer.isActive ? 'Deactivate' : 'Activate'}</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteOffer(selectedOffer._id)}
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Delete Offer</span>
                      <span className="sm:hidden">Delete</span>
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
            className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Activity className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Offer Analytics Dashboard
                  </h2>
                  <p className="text-sm text-gray-600">
                    Comprehensive offer statistics and insights
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseAnalyticsModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
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
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Total Offers</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.totalOffers}</p>
                        </div>
                        <Tag className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Active Offers</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.activeOffers}</p>
                        </div>
                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Inactive Offers</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.inactiveOffers}</p>
                        </div>
                        <XCircle className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 sm:p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm opacity-90">Expiring Soon</p>
                          <p className="text-xl sm:text-2xl font-bold">{analyticsData.expiringOffers}</p>
                        </div>
                        <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 opacity-80" />
                      </div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Offer Performance</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Active Rate:</span>
                          <span className="font-semibold">{analyticsData.activePercentage.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Total Offers:</span>
                          <span className="font-semibold">{analyticsData.totalOffers}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Updated:</span>
                          <span className="font-semibold">{new Date().toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expiring Offers:</span>
                          <span className="font-semibold">{analyticsData.expiringOffers}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                    <div className="text-sm text-gray-600">
                      <p>Last updated: {new Date().toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleExportOffers}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
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
                          fetchOffers();
                        }}
                        className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm"
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
                  <p className="text-gray-600 text-sm">
                    Unable to load analytics data. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={handleCloseCreateModal}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
            style={{ 
              zIndex: 10000,
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              maxWidth: '42rem',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div className="flex items-center space-x-3">
                <Tag className="h-6 w-6 text-red-600" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Create New Offer
                  </h2>
                  <p className="text-sm text-gray-600">
                    Add a new promotional offer or discount
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCloseCreateModal} className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white">
                <X className="h-4 w-4" />
                <span className="sr-only">Close Create Offer</span>
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="Enter offer title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="Enter offer description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Code *
                    </label>
                    <input
                      type="text"
                      value={createForm.code}
                      onChange={(e) => setCreateForm({...createForm, code: e.target.value.toUpperCase()})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="e.g., SUMMER20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Type *
                    </label>
                    <select
                      value={createForm.type}
                      onChange={(e) => setCreateForm({...createForm, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    >
                      <option value="discount">Discount</option>
                      <option value="free_shipping">Free Shipping</option>
                      <option value="buy_one_get_one">Buy One Get One</option>
                      <option value="cashback">Cashback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Offer Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCreateForm({...createForm, image: file});
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      />
                      {createForm.image && (
                        <div className="flex items-center space-x-2">
                          <img 
                            src={URL.createObjectURL(createForm.image)} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => setCreateForm({...createForm, image: null})}
                            className="text-red-600 text-sm hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Upload an image for the offer. Recommended size: 400x300px
                      </p>
                    </div>
                  </div>
                </div>

                {/* Discount Settings */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base">Discount Settings</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Value *
                      </label>
                      <input
                        type="number"
                        value={createForm.discountValue}
                        onChange={(e) => setCreateForm({...createForm, discountValue: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount Type *
                      </label>
                      <select
                        value={createForm.discountType}
                        onChange={(e) => setCreateForm({...createForm, discountType: e.target.value as 'percentage' | 'fixed'})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount ($)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Minimum Order Amount
                    </label>
                    <input
                      type="number"
                      value={createForm.minimumOrderAmount}
                      onChange={(e) => setCreateForm({...createForm, minimumOrderAmount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Discount Amount
                    </label>
                    <input
                      type="number"
                      value={createForm.maximumDiscountAmount}
                      onChange={(e) => setCreateForm({...createForm, maximumDiscountAmount: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                      placeholder="0 (no limit)"
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Validity Period</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={createForm.startDate}
                      onChange={(e) => setCreateForm({...createForm, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={createForm.endDate}
                      onChange={(e) => setCreateForm({...createForm, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    value={createForm.usageLimit}
                    onChange={(e) => setCreateForm({...createForm, usageLimit: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="0 (unlimited)"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Status</h3>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({...createForm, isActive: e.target.checked})}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Active (offer will be immediately available)
                  </label>
                </div>
              </div>

              {/* Product Selection */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 text-sm sm:text-base">Applicable Products</h3>
                <p className="text-sm text-gray-600">
                  Select which products this offer applies to. Leave empty to apply to all products.
                </p>
                
                {productsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-red-600 mr-2" />
                    <span className="text-gray-600 text-sm">Loading products...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Search and Selection Controls */}
                    <div className="space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products by name, category, or description..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                        />
                      </div>

                      {/* Selection Controls */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            Selected: {selectedProducts.length} | 
                            Showing: {filteredProducts.length} of {products.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllVisible}
                            className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                          >
                            Select All Visible
                          </button>
                          <button
                            type="button"
                            onClick={handleDeselectAllVisible}
                            className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                          >
                            Deselect All Visible
                          </button>
                          {selectedProducts.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setSelectedProducts([])}
                              className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Category Quick Select */}
                      {products.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Quick Select by Category:</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(category => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => handleSelectByCategory(category)}
                                className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-700 hover:text-red-700"
                              >
                                {category}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Products List */}
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {filteredProducts.length === 0 ? (
                        <div className="text-center py-8">
                          {productSearchTerm ? (
                            <div>
                              <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No products found for "{productSearchTerm}"</p>
                              <button
                                type="button"
                                onClick={() => setProductSearchTerm('')}
                                className="text-sm text-red-600 hover:text-red-800 mt-2"
                              >
                                Clear search
                              </button>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No products available</p>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredProducts.map((product) => (
                            <div
                              key={product._id}
                              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedProducts.includes(product._id)
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                              onClick={() => handleProductSelection(product._id)}
                            >
                              <input
                                type="checkbox"
                                checked={selectedProducts.includes(product._id)}
                                onChange={() => handleProductSelection(product._id)}
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <span>${product.price}</span>
                                  {product.category && (
                                    <>
                                      <span>•</span>
                                      <span className="capitalize">{product.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-4 sm:p-6 border-t">
              <Button
                variant="outline"
                onClick={handleCloseCreateModal}
                className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white text-sm w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffer}
                disabled={createLoading}
                className="bg-red-600 hover:bg-red-700 text-white text-sm w-full sm:w-auto"
              >
                {createLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Offer
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferManagement; 