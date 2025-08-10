import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Ticket, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Plus,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  role?: 'customer' | 'agent';
}

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const customerItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'My Tickets', href: '/tickets', icon: <Ticket className="h-5 w-5" /> },
    { label: 'New Ticket', href: '/tickets/new', icon: <Plus className="h-5 w-5" /> },
    { label: 'Profile', href: '/profile', icon: <Settings className="h-5 w-5" /> },
  ];

  const agentItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <Home className="h-5 w-5" /> },
    { label: 'All Tickets', href: '/tickets', icon: <Ticket className="h-5 w-5" /> },
    { label: 'Customers', href: '/customers', icon: <Users className="h-5 w-5" /> },
    { label: 'Categories', href: '/categories', icon: <FileText className="h-5 w-5" /> },
    { label: 'Reports', href: '/reports', icon: <BarChart3 className="h-5 w-5" /> },
    { label: 'Profile', href: '/profile', icon: <Settings className="h-5 w-5" /> },
  ];

  // Add admin option for super agents
  const superAgentItems: SidebarItem[] = [
    ...agentItems,
    { label: 'Admin', href: '/admin', icon: <Shield className="h-5 w-5" /> },
  ];

  const items = user?.role === 'agent' 
    ? (user?.isSuperAgent ? superAgentItems : agentItems)
    : customerItems;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 border-r border-dark-700">
      {/* Logo */}
      <div className="p-6 border-b border-dark-700">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Ticket className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FeathersUp</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-dark-700">
        <div className="mb-4 p-3 bg-dark-800 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={handleLogout}
          icon={<LogOut className="h-4 w-4" />}
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 