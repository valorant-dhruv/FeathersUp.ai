import React, { useState, useEffect } from 'react';
import { Clock, Users, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Ticket, AgentQueueInfo, QueueStatus } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

const AgentQueue: React.FC = () => {
  const [queueInfo, setQueueInfo] = useState<AgentQueueInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompletingTicket, setIsCompletingTicket] = useState(false);
  const { user } = useAuth();

  const loadQueueInfo = async () => {
    try {
      const info = await apiService.getAgentQueue();
      setQueueInfo(info);
    } catch (error) {
      console.error('Failed to load queue info:', error);
      toast.error('Failed to load queue information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetNextTicket = async () => {
    try {
      const nextTicket = await apiService.getNextTicket();
      if (nextTicket) {
        await loadQueueInfo(); // Refresh queue info
        toast.success('Next ticket retrieved!');
      } else {
        toast('No tickets in queue', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Failed to get next ticket:', error);
      toast.error('Failed to get next ticket');
    }
  };

  const handleCompleteTicket = async (ticketId: number) => {
    setIsCompletingTicket(true);
    try {
      await apiService.completeTicket(ticketId);
      await loadQueueInfo(); // Refresh queue info
      toast.success('Ticket completed successfully!');
    } catch (error) {
      console.error('Failed to complete ticket:', error);
      toast.error('Failed to complete ticket');
    } finally {
      setIsCompletingTicket(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'agent') {
      loadQueueInfo();
      // Refresh queue info every 30 seconds
      const interval = setInterval(loadQueueInfo, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (user?.role !== 'agent') {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-dark-400">Access Denied</p>
          <p className="text-dark-500 text-sm mt-2">
            Only agents can access the queue dashboard.
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-dark-600 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-dark-600 rounded"></div>
            <div className="h-4 bg-dark-600 rounded w-2/3"></div>
          </div>
        </div>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityBadgeVariant = (priority: string): 'default' | 'success' | 'warning' | 'danger' | 'info' => {
    switch (priority) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Queue Status Overview */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">My Queue Status</h3>
          <Button 
            onClick={loadQueueInfo} 
            variant="secondary" 
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {queueInfo?.queueStatus && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {queueInfo.queueStatus.urgent}
              </div>
              <div className="text-sm text-dark-400">Urgent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {queueInfo.queueStatus.high}
              </div>
              <div className="text-sm text-dark-400">High</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {queueInfo.queueStatus.medium}
              </div>
              <div className="text-sm text-dark-400">Medium</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {queueInfo.queueStatus.low}
              </div>
              <div className="text-sm text-dark-400">Low</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-400">
                {queueInfo.queueStatus.total}
              </div>
              <div className="text-sm text-dark-400">Total</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center">
          <Button 
            onClick={handleGetNextTicket}
            className="flex items-center space-x-2"
            disabled={!queueInfo?.queueStatus.total}
          >
            <ArrowRight className="h-4 w-4" />
            <span>Get Next Ticket</span>
          </Button>
        </div>
      </Card>

      {/* Current Ticket */}
      {queueInfo?.nextTicket && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Current Ticket</h3>
            <Badge variant={getPriorityBadgeVariant(queueInfo.nextTicket.priority)}>
              {queueInfo.nextTicket.priority}
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-2">
                {queueInfo.nextTicket.title}
              </h4>
              <p className="text-dark-300 text-sm">
                {queueInfo.nextTicket.description}
              </p>
            </div>

            <div className="flex items-center space-x-4 text-sm text-dark-400">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>{queueInfo.nextTicket.customer?.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>
                  Created {new Date(queueInfo.nextTicket.createdAt).toLocaleDateString()}
                </span>
              </div>
              {queueInfo.nextTicket.ticketCategory && (
                <div className="flex items-center space-x-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: queueInfo.nextTicket.ticketCategory.color }}
                  />
                  <span>{queueInfo.nextTicket.ticketCategory.name}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleCompleteTicket(queueInfo.nextTicket!.id)}
                loading={isCompletingTicket}
                disabled={isCompletingTicket}
                className="flex items-center space-x-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark as Resolved</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open(`/tickets/${queueInfo.nextTicket!.id}`, '_blank')}
              >
                View Details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* No tickets message */}
      {queueInfo?.queueStatus.total === 0 && (
        <Card>
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              All caught up!
            </h3>
            <p className="text-dark-400">
              You have no tickets in your queue at the moment.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AgentQueue;