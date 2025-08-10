import React, { useState } from 'react';
import { Users, Plus, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../ui/Card';
import AgentRegistrationForm from './AgentRegistrationForm';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'register-agent' | 'settings'>('overview');
  const { user } = useAuth();

  // Only super agents should access admin dashboard
  if (!user || user.role !== 'agent' || !user.isSuperAgent) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <Card>
          <div className="text-center py-8">
            <p className="text-dark-400">Access Denied</p>
            <p className="text-dark-500 text-sm mt-2">
              Only super agents can access the admin dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: Settings },
    { id: 'register-agent' as const, label: 'Register Agent', icon: Plus },
  ];

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-dark-400">Manage agents and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-dark-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-primary-500 text-primary-400'
                        : 'border-transparent text-dark-400 hover:text-dark-300 hover:border-dark-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-primary-500" />
                  <div className="ml-4">
                    <p className="text-dark-400 text-sm">Total Agents</p>
                    <p className="text-2xl font-semibold text-white">-</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-dark-400 text-sm">Active Agents</p>
                    <p className="text-2xl font-semibold text-white">-</p>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center">
                  <Settings className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-dark-400 text-sm">Super Agents</p>
                    <p className="text-2xl font-semibold text-white">-</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'register-agent' && (
            <div className="max-w-md mx-auto">
              <AgentRegistrationForm onSuccess={() => {
                // Optionally switch back to overview after successful registration
                // setActiveTab('overview');
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;