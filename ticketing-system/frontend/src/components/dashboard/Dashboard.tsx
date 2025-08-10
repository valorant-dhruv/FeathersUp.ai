import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket, TicketStats } from '../../types';
import apiService from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { 
  Ticket as TicketIcon, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch tickets based on user role
        const ticketParams = user?.role === 'customer' 
          ? { customerId: user.id }
          : {};
        
        const [ticketsData, statsData] = await Promise.all([
          apiService.getTickets({ ...ticketParams, limit: 5 }),
          user?.role === 'agent' ? apiService.getTicketStats() : null
        ]);
        
        // Extract tickets from the API response
        let ticketsArray: Ticket[] = [];
        if (ticketsData && ticketsData.data && ticketsData.data.tickets && Array.isArray(ticketsData.data.tickets)) {
          ticketsArray = ticketsData.data.tickets;
        } else {
          ticketsArray = [];
        }
        
        setTickets(ticketsArray);
        setStats(statsData);
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { variant: 'info' as const, label: 'Open' },
      in_progress: { variant: 'warning' as const, label: 'In Progress' },
      resolved: { variant: 'success' as const, label: 'Resolved' },
      closed: { variant: 'default' as const, label: 'Closed' },
      cancelled: { variant: 'danger' as const, label: 'Cancelled' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { variant: 'success' as const, label: 'Low' },
      medium: { variant: 'info' as const, label: 'Medium' },
      high: { variant: 'warning' as const, label: 'High' },
      urgent: { variant: 'danger' as const, label: 'Urgent' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-dark-400">
          Welcome back, {user?.name}! Here's what's happening with your tickets.
        </p>
      </div>

      {/* Stats Cards */}
      {user?.role === 'agent' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <TicketIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Total Tickets</p>
                <p className="text-2xl font-bold text-white">{stats.total || stats.totalTickets || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-warning-600 rounded-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Open</p>
                <p className="text-2xl font-bold text-white">{stats.open || stats.statusDistribution?.open || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-success-600 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Resolved</p>
                <p className="text-2xl font-bold text-white">{stats.resolved || stats.statusDistribution?.resolved || 0}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-danger-600 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-dark-400">Urgent</p>
                <p className="text-2xl font-bold text-white">{stats.byPriority?.urgent || stats.priorityDistribution?.urgent || 0}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Tickets */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Recent Tickets</h2>
          <Link to="/tickets">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-dark-400 mx-auto mb-4" />
            <p className="text-dark-400 mb-4">No tickets found</p>
            <Link to="/tickets/new">
              <Button>Create Your First Ticket</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between p-4 bg-dark-700 rounded-lg border border-dark-600 hover:border-dark-500 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-white font-medium truncate">
                      {ticket.title}
                    </h3>
                    {getStatusBadge(ticket.status)}
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <p className="text-dark-400 text-sm truncate">
                    {ticket.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-dark-500">
                    <span>#{ticket.id}</span>
                    <span>•</span>
                                            <span>{ticket.ticketCategory?.name || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link to={`/tickets/${ticket.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.role === 'customer' ? (
            <>
              <Link to="/tickets/new">
                <Button className="w-full" icon={<TicketIcon className="h-4 w-4" />}>
                  Create New Ticket
                </Button>
              </Link>
              <Link to="/tickets">
                <Button variant="secondary" className="w-full" icon={<TicketIcon className="h-4 w-4" />}>
                  View My Tickets
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/tickets">
                <Button className="w-full" icon={<TicketIcon className="h-4 w-4" />}>
                  Manage Tickets
                </Button>
              </Link>
              <Link to="/customers">
                <Button variant="secondary" className="w-full" icon={<Users className="h-4 w-4" />}>
                  View Customers
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard; 