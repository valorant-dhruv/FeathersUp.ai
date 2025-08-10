import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Customer, 
  Agent, 
  Ticket, 
  TicketStats,
  PaginatedTicketsResponse,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  BackendAuthResponse,
  Category
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Don't redirect here - let the component handle it
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.api.post<BackendAuthResponse>('/auth/login', credentials);
    return response.data.data;
  }

  async registerCustomer(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<BackendAuthResponse>('/auth/register/customer', data);
    return response.data.data;
  }

  async registerAgent(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<BackendAuthResponse>('/auth/register/agent', data);
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<{ success: boolean; message: string; data: User; timestamp: string }>('/auth/profile');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.put<{ success: boolean; message: string; data: User; timestamp: string }>('/auth/profile', data);
    return response.data.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
    const response = await this.api.put<{ success: boolean; message: string; data: { message: string }; timestamp: string }>('/auth/change-password', data);
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Ticket endpoints
  async getTickets(params?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: number;
    customerId?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedTicketsResponse> {
    const response = await this.api.get<PaginatedTicketsResponse>('/tickets', { params });
    return response.data;
  }

  async getTicket(id: number): Promise<Ticket> {
    const response = await this.api.get<{ success: boolean; message: string; data: { ticket: Ticket }; timestamp: string }>(`/tickets/${id}`);
    return response.data.data.ticket;
  }

  async createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ticket> {
    const response = await this.api.post<{ success: boolean; message: string; data: { ticket: Ticket }; timestamp: string }>('/tickets', data);
    return response.data.data.ticket;
  }

  async updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    const response = await this.api.put<{ success: boolean; message: string; data: { ticket: Ticket }; timestamp: string }>(`/tickets/${id}`, data);
    return response.data.data.ticket;
  }

  async assignTicket(id: number, agentId: number): Promise<Ticket> {
    const response = await this.api.put<{ success: boolean; message: string; data: { ticket: Ticket }; timestamp: string }>(`/tickets/${id}/assign`, { agentId });
    return response.data.data.ticket;
  }

  async deleteTicket(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/tickets/${id}`);
    return response.data;
  }

  async getTicketStats(): Promise<TicketStats> {
    const response = await this.api.get<{ success: boolean; message: string; data: { stats: TicketStats }; timestamp: string }>('/tickets/stats');
    return response.data.data.stats;
  }

  // Queue management endpoints
  async getNextTicket(): Promise<Ticket | null> {
    const response = await this.api.get<{ success: boolean; message: string; data: { nextTicket: Ticket | null }; timestamp: string }>('/tickets/queue/next');
    return response.data.data.nextTicket;
  }

  async getAgentQueue(agentId?: number): Promise<any> {
    const url = agentId ? `/tickets/queue/agent/${agentId}` : '/tickets/queue/agent';
    const response = await this.api.get<{ success: boolean; message: string; data: { queueInfo: any }; timestamp: string }>(url);
    return response.data.data.queueInfo;
  }

  async getSystemQueueStats(): Promise<any> {
    const response = await this.api.get<{ success: boolean; message: string; data: { systemStats: any }; timestamp: string }>('/tickets/queue/system/stats');
    return response.data.data.systemStats;
  }

  async completeTicket(id: number, status: 'resolved' | 'closed' = 'resolved'): Promise<Ticket> {
    const response = await this.api.patch<{ success: boolean; message: string; data: { ticket: Ticket }; timestamp: string }>(`/tickets/${id}/complete`, { status });
    return response.data.data.ticket;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response = await this.api.get<{ success: boolean; message: string; data: { categories: Category[] }; timestamp: string }>('/categories');
    return response.data.data.categories;
  }

  async getAllCategories(): Promise<Category[]> {
    const response = await this.api.get<{ success: boolean; message: string; data: { categories: Category[] }; timestamp: string }>('/categories/all');
    return response.data.data.categories;
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const response = await this.api.post<{ success: boolean; message: string; data: { category: Category }; timestamp: string }>('/categories', data);
    return response.data.data.category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const response = await this.api.put<{ success: boolean; message: string; data: { category: Category }; timestamp: string }>(`/categories/${id}`, data);
    return response.data.data.category;
  }

  async deleteCategory(id: number): Promise<{ message: string }> {
    const response = await this.api.delete<{ message: string }>(`/categories/${id}`);
    return response.data;
  }

  // User management endpoints
  async getCustomers(): Promise<Customer[]> {
    const response = await this.api.get<{ success: boolean; message: string; data: Customer[]; timestamp: string }>('/users/customers');
    return response.data.data;
  }

  async getAgents(): Promise<Agent[]> {
    const response = await this.api.get<{ success: boolean; message: string; data: Agent[]; timestamp: string }>('/users/agents');
    return response.data.data;
  }

  async getCustomer(id: number): Promise<Customer> {
    const response = await this.api.get<{ success: boolean; message: string; data: Customer; timestamp: string }>(`/users/customers/${id}`);
    return response.data.data;
  }

  async updateCustomerStatus(id: number, status: string): Promise<Customer> {
    const response = await this.api.put<{ success: boolean; message: string; data: Customer; timestamp: string }>(`/users/customers/${id}/status`, { status });
    return response.data.data;
  }

  // Agent management endpoints
  async createAgent(data: { name: string; email: string; password: string; categoryIds?: number[] }): Promise<Agent> {
    const response = await this.api.post<{ success: boolean; message: string; data: { agent: Agent }; timestamp: string }>('/agents', data);
    return response.data.data.agent;
  }

  async getAllAgents(): Promise<Agent[]> {
    const response = await this.api.get<{ success: boolean; message: string; data: { agents: Agent[] }; timestamp: string }>('/agents');
    return response.data.data.agents;
  }

  async getAgent(id: number): Promise<Agent> {
    const response = await this.api.get<{ success: boolean; message: string; data: { agent: Agent }; timestamp: string }>(`/agents/${id}`);
    return response.data.data.agent;
  }

  async subscribeAgentToCategories(agentId: number, categoryIds: number[]): Promise<any> {
    const response = await this.api.post<{ success: boolean; message: string; data: any; timestamp: string }>(`/agents/${agentId}/categories`, { categoryIds });
    return response.data.data;
  }

  async unsubscribeAgentFromCategories(agentId: number, categoryIds: number[]): Promise<any> {
    const response = await this.api.delete<{ success: boolean; message: string; data: any; timestamp: string }>(`/agents/${agentId}/categories`, { data: { categoryIds } });
    return response.data.data;
  }

  async updateAgentStatus(agentId: number, status: string): Promise<Agent> {
    const response = await this.api.patch<{ success: boolean; message: string; data: { agent: Agent }; timestamp: string }>(`/agents/${agentId}/status`, { status });
    return response.data.data.agent;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number; environment: string }> {
    const response = await this.api.get<{ status: string; timestamp: string; uptime: number; environment: string }>('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 