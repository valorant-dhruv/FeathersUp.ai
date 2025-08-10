import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket } from '../../types';
import apiService from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import KanbanBoard from './KanbanBoard';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Grid3X3,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const TicketList: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(user?.role === 'agent' ? 'kanban' : 'list');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    category: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tickets based on user role
        const ticketParams = user?.role === 'customer' 
          ? { customerId: user.id }
          : {};
        
        const ticketsData = await apiService.getTickets(ticketParams);
        
        // Extract tickets from the API response
        let ticketsArray: Ticket[] = [];
        if (ticketsData && ticketsData.data && ticketsData.data.tickets && Array.isArray(ticketsData.data.tickets)) {
          ticketsArray = ticketsData.data.tickets;
        } else {
          ticketsArray = [];
        }
        
        setTickets(ticketsArray);
        
        // Extract unique categories from tickets
        const uniqueCategories = Array.from(new Set(ticketsArray.map(ticket => ticket.ticketCategory?.name).filter((name): name is string => Boolean(name))));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id, user?.role]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || ticket.status === filters.status;
    const matchesPriority = !filters.priority || ticket.priority === filters.priority;
    const matchesCategory = !filters.category || ticket.ticketCategory?.name === filters.category;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'info' as const, label: 'Open', icon: <Clock className="h-3 w-3" /> },
      in_progress: { variant: 'warning' as const, label: 'In Progress', icon: <Clock className="h-3 w-3" /> },
      resolved: { variant: 'success' as const, label: 'Resolved', icon: <CheckCircle className="h-3 w-3" /> },
      closed: { variant: 'default' as const, label: 'Closed', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { variant: 'danger' as const, label: 'Cancelled', icon: <XCircle className="h-3 w-3" /> },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant} size="sm">{config.icon} {config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'success' as const, label: 'Low' },
      medium: { variant: 'info' as const, label: 'Medium' },
      high: { variant: 'warning' as const, label: 'High' },
      urgent: { variant: 'danger' as const, label: 'Urgent' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      category: '',
    });
  };

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  const categoryOptions = categories.map(cat => ({
    value: cat,
    label: cat
  }));

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
          <h1 className="text-3xl font-bold text-white mb-2">
            {user?.role === 'agent' ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-dark-400">
            {user?.role === 'agent' 
              ? 'Manage and track all support tickets' 
              : 'Track the status of your support requests'
            }
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {user?.role === 'agent' && (
            <div className="flex items-center space-x-2 bg-dark-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                icon={<Grid3X3 className="h-4 w-4" />}
              >
                Kanban
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                icon={<List className="h-4 w-4" />}
              >
                List
              </Button>
            </div>
          )}
          {user?.role === 'customer' && (
            <Link to="/tickets/new">
              <Button icon={<Plus className="h-4 w-4" />}>
                New Ticket
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-dark-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="Search tickets..."
            leftIcon={<Search className="h-4 w-4" />}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          
          <Select
            placeholder="All Statuses"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
          />
          
          <Select
            placeholder="All Priorities"
            options={priorityOptions}
            value={filters.priority}
            onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
          />
          
          <Select
            placeholder="All Categories"
            options={categoryOptions}
            value={filters.category}
            onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
          />
        </div>
      </Card>

      {/* Main Content */}
      {user?.role === 'agent' && viewMode === 'kanban' ? (
        <KanbanBoard />
      ) : (
        /* Tickets List */
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              Tickets ({filteredTickets.length})
            </h2>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-dark-400 mx-auto mb-4" />
              <p className="text-dark-400 text-lg mb-2">No tickets found</p>
              <p className="text-dark-500 mb-6">
                {filters.search || filters.status || filters.priority || filters.category
                  ? 'Try adjusting your filters'
                  : user?.role === 'customer' ? 'Create your first ticket to get started' : 'No tickets to manage'
                }
              </p>
              {!filters.search && !filters.status && !filters.priority && !filters.category && user?.role === 'customer' && (
                <Link to="/tickets/new">
                  <Button>Create New Ticket</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {ticket.title}
                        </h3>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      
                      <p className="text-dark-300 mb-4 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-dark-500">
                        <span>#{ticket.id}</span>
                        <span>•</span>
                        <span>{ticket.ticketCategory?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        {ticket.dueDate && (
                          <>
                            <span>•</span>
                            <span>Due {new Date(ticket.dueDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Link to={`/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm" icon={<Eye className="h-4 w-4" />}>
                          View
                        </Button>
                      </Link>
                      {user?.role === 'agent' && (
                        <Link to={`/tickets/${ticket.id}/edit`}>
                          <Button variant="secondary" size="sm" icon={<Edit className="h-4 w-4" />}>
                            Edit
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default TicketList; 