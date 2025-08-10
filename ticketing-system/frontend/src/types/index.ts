export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'agent';
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // Agent-specific properties (only present when role is 'agent')
  permissions?: {
    canManageCustomers: boolean;
    canManageTickets: boolean;
    canManageAgents: boolean;
    canViewReports: boolean;
    canManageSystem: boolean;
  };
  isSuperAgent?: boolean;
  // Customer-specific properties (only present when role is 'customer')
  phone?: string;
  company?: string;
}

export interface Customer extends User {
  role: 'customer';
  phone?: string;
  company?: string;
}

export interface Agent extends User {
  role: 'agent';
  permissions: {
    canManageCustomers: boolean;
    canManageTickets: boolean;
    canManageAgents: boolean;
    canViewReports: boolean;
    canManageSystem: boolean;
  };
  isSuperAgent: boolean;
  subscribedCategories?: Category[];
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId: number;
  customerId: number;
  assignedTo?: number;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  resolvedAt?: string;
  closedAt?: string;
  tags?: string[];
  internalNotes?: string;
  queuePosition?: number;
  queueEnteredAt?: string;
  assignedAt?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  agent?: Agent;
  ticketCategory?: Category;
  assignedAgent?: Agent;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  ticketId: number;
  userId: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Attachment {
  id: number;
  ticketId: number;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  createdAt: string;
}

export interface TicketStats {
  // Expected format
  total?: number;
  open?: number;
  inProgress?: number;
  resolved?: number;
  closed?: number;
  cancelled?: number;
  byPriority?: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  byCategory?: Record<string, number>;
  
  // Actual backend format (for compatibility)
  totalTickets?: number;
  statusDistribution?: {
    open?: number;
    in_progress?: number;
    resolved?: number;
    closed?: number;
    cancelled?: number;
  };
  priorityDistribution?: {
    low?: number;
    medium?: number;
    high?: number;
    urgent?: number;
  };
  recentTickets?: number;
  averageResolutionTimeHours?: string | null;
}

export interface PaginatedTicketsResponse {
  success: boolean;
  message: string;
  data: {
    tickets: Ticket[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  userType: 'customer' | 'agent';
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  // Agent-specific properties
  permissions?: object;
  isSuperAgent?: boolean;
  role?: 'customer' | 'agent';
}

export interface AuthResponse {
  user: User;
  token: string;
  tokenExpires: string;
}

export interface BackendAuthResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Queue management types
export interface QueueStatus {
  urgent: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

export interface AgentQueueInfo {
  queueStatus: QueueStatus;
  nextTicket: Ticket | null;
}

export interface SystemQueueStats {
  totalAgents: number;
  categorySubscriptions: number;
  agentQueues: Record<number, QueueStatus>;
}

export interface CreateTicketResponse {
  ticket: Ticket;
  assignedAgent: Agent | null;
  queueStats: QueueStatus | null;
  message: string;
} 