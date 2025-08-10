import React, { useState, useEffect } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot
} from 'react-beautiful-dnd';
import { Ticket } from '../../types';
import apiService from '../../services/api';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { User, MessageSquare, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  tickets: Ticket[];
  color: string;
}

const KanbanBoard: React.FC = () => {
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'open', title: 'Open', status: 'open', tickets: [], color: 'bg-blue-500' },
    { id: 'in_progress', title: 'In Progress', status: 'in_progress', tickets: [], color: 'bg-yellow-500' },
    { id: 'resolved', title: 'Resolved', status: 'resolved', tickets: [], color: 'bg-green-500' },
    { id: 'closed', title: 'Closed', status: 'closed', tickets: [], color: 'bg-gray-500' },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getTickets();
      let tickets: Ticket[] = [];
      
      if (response && response.data && response.data.tickets && Array.isArray(response.data.tickets)) {
        tickets = response.data.tickets;
      }

      // Group tickets by status
      const updatedColumns = columns.map(column => ({
        ...column,
        tickets: tickets.filter(ticket => ticket.status === column.status)
      }));

      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const ticketId = parseInt(draggableId);
    const newStatus = destination.droppableId as 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';

    try {
      // Update ticket status on backend
      await apiService.updateTicket(ticketId, { status: newStatus });

      // Update local state
      const newColumns = [...columns];
      const sourceColumn = newColumns.find(col => col.id === source.droppableId);
      const destColumn = newColumns.find(col => col.id === destination.droppableId);

      if (sourceColumn && destColumn) {
        const ticket = sourceColumn.tickets.find(t => t.id === ticketId);
        if (ticket) {
          // Remove from source
          sourceColumn.tickets = sourceColumn.tickets.filter(t => t.id !== ticketId);
          
          // Add to destination
          ticket.status = newStatus as any;
          destColumn.tickets.splice(destination.index, 0, ticket);
          
          setColumns(newColumns);
          toast.success(`Ticket moved to ${destColumn.title}`);
        }
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
      toast.error('Failed to update ticket status');
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Ticket Management</h1>
          <p className="text-dark-400">Drag and drop tickets to update their status</p>
        </div>
        <Button onClick={fetchTickets} size="sm">
          Refresh
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-white">{column.title}</h3>
                <Badge variant="default" size="sm">{column.tickets.length}</Badge>
              </div>

              <Droppable droppableId={column.id}>
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[400px] space-y-3 p-3 rounded-lg border-2 border-dashed transition-colors ${
                      snapshot.isDraggingOver 
                        ? 'border-primary-500 bg-primary-500/10' 
                        : 'border-dark-600 bg-dark-800/50'
                    }`}
                  >
                    {column.tickets.map((ticket, index) => (
                      <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            }`}
                          >
                            <Card className="cursor-move hover:border-primary-500 transition-colors">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between">
                                  <h4 className="text-white font-medium text-sm leading-tight">
                                    {ticket.title}
                                  </h4>
                                  {getPriorityBadge(ticket.priority)}
                                </div>

                                <p className="text-dark-400 text-xs line-clamp-2">
                                  {ticket.description}
                                </p>

                                <div className="flex items-center justify-between text-xs text-dark-500">
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3" />
                                    <span>{ticket.customer?.name || 'Unknown'}</span>
                                  </div>
                                  <span>#{ticket.id}</span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-dark-500">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  {ticket.assignedTo && (
                                    <div className="flex items-center space-x-1">
                                      <User className="h-3 w-3" />
                                      <span>{ticket.agent?.name || 'Assigned'}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-dark-600">
                                  <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-3 w-3 text-dark-500" />
                                    <span className="text-xs text-dark-500">Comments</span>
                                  </div>
                                  <Link to={`/tickets/${ticket.id}`}>
                                    <Button size="sm" variant="outline">
                                      View
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;