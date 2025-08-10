import React, { useEffect, useState } from 'react';
import { TicketStats } from '../../types';
import apiService from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Download,
  Calendar,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const Reports: React.FC = () => {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7');

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const statsData = await apiService.getTicketStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setIsLoading(false);
    }
  };

  const dateRangeOptions = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '365', label: 'Last year' },
  ];

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const totalTickets = stats?.totalTickets || stats?.total || 0;
  const statusDistribution = stats?.statusDistribution || {};
  const priorityDistribution = stats?.priorityDistribution || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
          <p className="text-dark-400">View insights and analytics for your support system</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select
            options={dateRangeOptions}
            value={dateRange}
            onChange={(value) => setDateRange(value)}
            placeholder="Select date range"
          />
          <Button 
            variant="outline" 
            size="sm" 
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={fetchReports}
          >
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Tickets</p>
              <p className="text-2xl font-bold text-white">{totalTickets}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Resolved</p>
              <p className="text-2xl font-bold text-white">
                {statusDistribution.resolved || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning-600 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Avg. Resolution</p>
              <p className="text-2xl font-bold text-white">
                {stats?.averageResolutionTimeHours ? 
                  `${parseFloat(stats.averageResolutionTimeHours).toFixed(1)}h` : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-info-600 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Recent Tickets</p>
              <p className="text-2xl font-bold text-white">
                {stats?.recentTickets || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Distribution */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Status Distribution</h2>
        </div>
        
        <div className="space-y-4">
          {Object.entries(statusDistribution).map(([status, count]) => {
            const percentage = getPercentage(count as number, totalTickets);
            const statusConfig = {
              open: { color: 'bg-blue-500', label: 'Open' },
              in_progress: { color: 'bg-yellow-500', label: 'In Progress' },
              resolved: { color: 'bg-green-500', label: 'Resolved' },
              closed: { color: 'bg-gray-500', label: 'Closed' },
              cancelled: { color: 'bg-red-500', label: 'Cancelled' },
            };
            
            const config = statusConfig[status as keyof typeof statusConfig] || 
              { color: 'bg-gray-500', label: status };
            
            return (
              <div key={status} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-dark-300">{config.label}</div>
                <div className="flex-1 bg-dark-700 rounded-full h-2">
                  <div 
                    className={`${config.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-dark-300 text-right">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Priority Distribution */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Priority Distribution</h2>
        </div>
        
        <div className="space-y-4">
          {Object.entries(priorityDistribution).map(([priority, count]) => {
            const percentage = getPercentage(count as number, totalTickets);
            const priorityConfig = {
              low: { color: 'bg-green-500', label: 'Low' },
              medium: { color: 'bg-blue-500', label: 'Medium' },
              high: { color: 'bg-yellow-500', label: 'High' },
              urgent: { color: 'bg-red-500', label: 'Urgent' },
            };
            
            const config = priorityConfig[priority as keyof typeof priorityConfig] || 
              { color: 'bg-gray-500', label: priority };
            
            return (
              <div key={priority} className="flex items-center space-x-4">
                <div className="w-20 text-sm text-dark-300">{config.label}</div>
                <div className="flex-1 bg-dark-700 rounded-full h-2">
                  <div 
                    className={`${config.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-dark-300 text-right">
                  {count} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Performance Insights</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Resolution Rate</span>
              <span className="text-white">
                {totalTickets > 0 ? 
                  `${getPercentage(statusDistribution.resolved || 0, totalTickets)}%` : 
                  'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Open Tickets</span>
              <span className="text-white">{statusDistribution.open || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Urgent Tickets</span>
              <span className="text-white">{priorityDistribution.urgent || 0}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
          <div className="space-y-3 text-sm text-dark-300">
            {(statusDistribution.open || 0) > 10 && (
              <div className="p-3 bg-warning-600/20 rounded-lg border border-warning-600/30">
                <p className="text-warning-300">High number of open tickets. Consider increasing agent capacity.</p>
              </div>
            )}
            {(priorityDistribution.urgent || 0) > 5 && (
              <div className="p-3 bg-danger-600/20 rounded-lg border border-danger-600/30">
                <p className="text-danger-300">Multiple urgent tickets require immediate attention.</p>
              </div>
            )}
            {(statusDistribution.resolved || 0) / Math.max(totalTickets, 1) > 0.8 && (
              <div className="p-3 bg-success-600/20 rounded-lg border border-success-600/30">
                <p className="text-success-300">Great job! High resolution rate indicates efficient support.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;