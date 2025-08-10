import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Edit, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Ticket } from '../../types';
import apiService from '../../services/api';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        console.log('Fetching ticket with ID:', id);
        const ticketData = await apiService.getTicket(parseInt(id));
        console.log('Ticket data received:', ticketData);
        setTicket(ticketData);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        toast.error('Failed to load ticket details');
        navigate('/tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTicket();
  }, [id, navigate]);

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!ticket) {
    console.log('No ticket data available');
    return (
      <div className="text-center py-12">
        <p className="text-dark-400 text-lg">Ticket not found</p>
        <Button onClick={() => navigate('/tickets')} className="mt-4">
          Back to Tickets
        </Button>
      </div>
    );
  }

  console.log('Rendering ticket:', ticket);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/tickets')}
          className="mb-4"
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Tickets
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">#{ticket.id} - {ticket.title}</h1>
            <p className="text-dark-400 mt-2">
              Created on {new Date(ticket.createdAt).toLocaleDateString()}
            </p>
          </div>
          {user?.role === 'agent' && (
            <Link to={`/tickets/${ticket.id}/edit`}>
              <Button variant="secondary" icon={<Edit className="h-4 w-4" />}>
                Edit Ticket
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
            <p className="text-dark-300 whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          {/* Comments Section - Placeholder */}
          <Card>
            <h2 className="text-lg font-semibold text-white mb-4">Comments</h2>
            <div className="text-center py-8 text-dark-400">
              <p>Comments feature coming soon</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Priority */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Ticket Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Status</label>
                {getStatusBadge(ticket.status)}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Priority</label>
                {getPriorityBadge(ticket.priority)}
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Category</label>
                                 <span className="text-white">{ticket.ticketCategory?.name || 'Unknown'}</span>
              </div>
              {ticket.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-2">Due Date</label>
                  <span className="text-white">{new Date(ticket.dueDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Customer Info */}
          <Card>
            <h3 className="text-lg font-semibold text-white mb-4">Customer Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Name</label>
                <span className="text-white">{ticket.customer?.name || 'N/A'}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-1">Email</label>
                <span className="text-white">{ticket.customer?.email || 'N/A'}</span>
              </div>
              {ticket.customer?.company && (
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">Company</label>
                  <span className="text-white">{ticket.customer.company}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Assigned Agent */}
          {ticket.agent && (
            <Card>
              <h3 className="text-lg font-semibold text-white mb-4">Assigned Agent</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">Name</label>
                  <span className="text-white">{ticket.agent.name}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">Email</label>
                  <span className="text-white">{ticket.agent.email}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail; 