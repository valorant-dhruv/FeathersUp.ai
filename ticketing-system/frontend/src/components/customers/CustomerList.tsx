import React, { useEffect, useState } from 'react';
import { Customer } from '../../types';
import apiService from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Search, Users, Mail, Building, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const customersData = await apiService.getCustomers();
      setCustomers(customersData);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'warning' as const, label: 'Inactive' },
      suspended: { variant: 'danger' as const, label: 'Suspended' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const updateCustomerStatus = async (customerId: number, newStatus: string) => {
    try {
      await apiService.updateCustomerStatus(customerId, newStatus);
      setCustomers(customers.map(customer => 
        customer.id === customerId 
          ? { ...customer, status: newStatus as any }
          : customer
      ));
      toast.success(`Customer status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update customer status:', error);
      toast.error('Failed to update customer status');
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
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Customers</h1>
        <p className="text-dark-400">Manage customer accounts and information</p>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center space-x-4">
          <Search className="h-5 w-5 text-dark-400" />
          <Input
            placeholder="Search customers by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={fetchCustomers} size="sm">
            Refresh
          </Button>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Customers</p>
              <p className="text-2xl font-bold text-white">{customers.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Active</p>
              <p className="text-2xl font-bold text-white">
                {customers.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-600 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Inactive</p>
              <p className="text-2xl font-bold text-white">
                {customers.filter(c => c.status !== 'active').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            All Customers ({filteredCustomers.length})
          </h2>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400 text-lg mb-2">No customers found</p>
            <p className="text-dark-500">
              {searchTerm ? 'Try adjusting your search' : 'No customers have registered yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="p-6 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-white">
                        {customer.name}
                      </h3>
                      {getStatusBadge(customer.status)}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-dark-300">
                        <Mail className="h-4 w-4" />
                        <span>{customer.email}</span>
                      </div>
                      
                      {customer.phone && (
                        <div className="flex items-center space-x-2 text-dark-300">
                          <span>📞</span>
                          <span>{customer.phone}</span>
                        </div>
                      )}
                      
                      {customer.company && (
                        <div className="flex items-center space-x-2 text-dark-300">
                          <Building className="h-4 w-4" />
                          <span>{customer.company}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2 text-dark-500">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {customer.status === 'active' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateCustomerStatus(customer.id, 'inactive')}
                      >
                        Deactivate
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateCustomerStatus(customer.id, 'active')}
                      >
                        Activate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {/* TODO: View customer details */}}
                    >
                      View Details
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

export default CustomerList;