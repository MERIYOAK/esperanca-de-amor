import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Download,
  Upload,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import AddProductForm from './AddProductForm';
import EditProductForm from './EditProductForm';
import * as XLSX from 'xlsx';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  isActive: boolean;
  images: Array<{
    url: string;
    alt: string;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Category {
  name: string;
  _id: string;
}

const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const [showImportDropdown, setShowImportDropdown] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm, selectedCategory]);

  // Close import dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.import-dropdown')) {
        setShowImportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const adminToken = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products);
        setCategories(data.data.categories);
        setTotalPages(data.data.pagination.pages);
        setTotalProducts(data.data.pagination.total);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "No Products Selected",
        description: "Please select products to delete",
        variant: "destructive",
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products/bulk`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ productIds: selectedProducts })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `${selectedProducts.length} product(s) deleted successfully`,
        });
        setSelectedProducts([]);
        fetchProducts();
      } else {
        throw new Error('Failed to delete products');
      }
    } catch (error) {
      console.error('Error deleting products:', error);
      toast({
        title: "Error",
        description: "Failed to delete products",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products/${productId}`,
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
          description: `Product "${productName}" deleted successfully`,
        });
        fetchProducts();
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`
          },
          body: JSON.stringify({ isActive: !currentStatus })
        }
      );

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${currentStatus ? 'deactivated' : 'activated'} successfully`,
        });
        fetchProducts();
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditForm(true);
  };

  const handleAddProduct = () => {
    setShowAddForm(true);
  };

  const handleFormSuccess = () => {
    fetchProducts();
    setSelectedProducts([]);
  };

  const handleExportProducts = async () => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      
      // Get all products for export (without pagination)
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products/export`,
        {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: "Products exported to Excel successfully",
        });
      } else {
        throw new Error('Failed to export products');
      }
    } catch (error) {
      console.error('Error exporting products:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export products to Excel",
        variant: "destructive",
      });
    }
  };

  const handleImportProducts = () => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx,.xls';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const adminToken = localStorage.getItem('adminToken');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/products/import`,
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
            title: "Import Successful",
            description: `${data.importedCount} products imported from Excel successfully`,
          });
          fetchProducts(); // Refresh the product list
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to import products');
        }
      } catch (error: any) {
        console.error('Error importing products:', error);
        toast({
          title: "Import Failed",
          description: error.message || "Failed to import products from Excel",
          variant: "destructive",
        });
      }
    };

    document.body.appendChild(fileInput);
    fileInput.click();
    document.body.removeChild(fileInput);
  };

  const handleDownloadTemplate = () => {
    // Create Excel template content
    const templateData = [
      {
        name: 'Sample Product',
        description: 'This is a sample product description',
        price: 29.99,
        originalPrice: 39.99,
        category: 'foodstuffs',
        stock: 100,
        tags: 'sample, demo, test',
        isActive: 'Yes',
        createdAt: new Date().toISOString(),
        images: 'https://example.com/image1.jpg; https://example.com/image2.jpg'
      }
    ];

    // Create workbook and worksheet
    const workbook = {
      SheetNames: ['Products'],
      Sheets: {
        'Products': {
          '!ref': 'A1:J2',
          A1: { v: 'name' },
          B1: { v: 'description' },
          C1: { v: 'price' },
          D1: { v: 'originalPrice' },
          E1: { v: 'category' },
          F1: { v: 'stock' },
          G1: { v: 'tags' },
          H1: { v: 'isActive' },
          I1: { v: 'createdAt' },
          J1: { v: 'images' },
          A2: { v: 'Sample Product' },
          B2: { v: 'This is a sample product description' },
          C2: { v: 29.99 },
          D2: { v: 39.99 },
          E2: { v: 'foodstuffs' },
          F2: { v: 100 },
          G2: { v: 'sample, demo, test' },
          H2: { v: 'Yes' },
          I2: { v: new Date().toISOString() },
          J2: { v: 'https://example.com/image1.jpg; https://example.com/image2.jpg' }
        }
      }
    };

    // Convert to Excel buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Create and download file
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-import-template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({
      title: "Template Downloaded",
      description: "Excel template downloaded successfully",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'foodstuffs': 'bg-green-100 text-green-800',
      'household-items': 'bg-blue-100 text-blue-800',
      'beverages': 'bg-purple-100 text-purple-800',
      'electronics': 'bg-orange-100 text-orange-800',
      'construction-materials': 'bg-gray-100 text-gray-800',
      'plastics': 'bg-indigo-100 text-indigo-800',
      'cosmetics': 'bg-pink-100 text-pink-800',
      'powder-detergent': 'bg-yellow-100 text-yellow-800',
      'liquid-detergent': 'bg-teal-100 text-teal-800',
      'juices': 'bg-red-100 text-red-800',
      'dental-care': 'bg-cyan-100 text-cyan-800',
      'beef': 'bg-amber-100 text-amber-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
          <p className="text-gray-600">Manage your store's product catalog</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative import-dropdown">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
              onClick={() => setShowImportDropdown(!showImportDropdown)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
            {showImportDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <button
                  onClick={() => {
                    handleImportProducts();
                    setShowImportDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                >
                  Import Excel File
                </button>
                <button
                  onClick={() => {
                    handleDownloadTemplate();
                    setShowImportDropdown(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Download Excel Template
                </button>
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            onClick={handleExportProducts}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleAddProduct}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Product
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
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className={selectedProducts.length === products.length 
                  ? 'bg-red-50 text-red-600 border-red-600' 
                  : 'border-red-600 text-red-600 hover:bg-red-600 hover:text-white'
                }
              >
                {selectedProducts.length === products.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedProducts.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedProducts.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold line-clamp-2">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {product.description}
                  </CardDescription>
                </div>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product._id)}
                  onChange={() => handleProductSelection(product._id)}
                  className="ml-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Product Image */}
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].alt || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(product.category)}>
                    {product.category}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Stock: {product.stock}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={product.isActive ? "default" : "secondary"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  onClick={() => handleEditProduct(product)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleProductStatus(product._id, product.isActive)}
                  className={product.isActive 
                    ? 'text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white' 
                    : 'text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
                  }
                >
                  {product.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteProduct(product._id, product.name)}
                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalProducts)} of {totalProducts} products
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
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
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Products Found</h3>
          <p className="text-gray-600">
            {searchTerm || selectedCategory 
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first product"
            }
          </p>
          <Button className="mt-4 bg-red-600 hover:bg-red-700" onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}

      {/* Add Product Form Modal */}
      {showAddForm && (
        <AddProductForm
          onClose={() => setShowAddForm(false)}
          onSuccess={handleFormSuccess}
          categories={categories}
        />
      )}

      {/* Edit Product Form Modal */}
      {showEditForm && editingProduct && (
        <EditProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setShowEditForm(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default ProductManagement; 