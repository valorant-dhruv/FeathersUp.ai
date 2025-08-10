import React, { useEffect, useState } from 'react';
import { Category } from '../../types';
import apiService from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Search, Tag, Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await apiService.getAllCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="warning">Inactive</Badge>;
  };

  const toggleCategoryStatus = async (categoryId: number, currentStatus: boolean) => {
    try {
      await apiService.updateCategory(categoryId, { isActive: !currentStatus });
      setCategories(categories.map(category => 
        category.id === categoryId 
          ? { ...category, isActive: !currentStatus }
          : category
      ));
      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    }
  };

  const deleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteCategory(categoryId);
      setCategories(categories.filter(category => category.id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
          <p className="text-dark-400">Manage ticket categories and their settings</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-dark-400" />
          <Input
            placeholder="Search categories by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchCategories} size="sm">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Categories</p>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-600 rounded-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Active</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-600 rounded-lg">
              <Tag className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Inactive</p>
              <p className="text-2xl font-bold text-white">
                {categories.filter(c => !c.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            All Categories ({filteredCategories.length})
          </h2>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400 text-lg mb-2">No categories found</p>
            <p className="text-dark-500 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'No categories have been created yet'}
            </p>
            <Button icon={<Plus className="h-4 w-4" />}>
              Create First Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="p-6 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="text-lg font-semibold text-white truncate">
                        {category.name}
                      </h3>
                    </div>
                    {getStatusBadge(category.isActive)}
                  </div>
                </div>
                
                {category.description && (
                  <p className="text-dark-300 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}
                
                <div className="text-xs text-dark-500 mb-4">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="h-3 w-3" />}
                    >
                      View
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Edit className="h-3 w-3" />}
                    >
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={category.isActive ? "secondary" : "success"}
                      size="sm"
                      onClick={() => toggleCategoryStatus(category.id, category.isActive)}
                    >
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 className="h-3 w-3" />}
                      onClick={() => deleteCategory(category.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CategoryList;