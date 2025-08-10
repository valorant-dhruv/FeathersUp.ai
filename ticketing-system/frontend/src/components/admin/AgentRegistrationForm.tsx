import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, User, Tag } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

import { apiService } from '../../services/api';
import { Category } from '../../types';
import toast from 'react-hot-toast';

interface AgentRegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  categoryIds: number[];
  permissions?: object;
  isSuperAgent?: boolean;
}

interface AgentRegistrationFormProps {
  onSuccess?: () => void;
}

const AgentRegistrationForm: React.FC<AgentRegistrationFormProps> = ({ onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AgentRegistrationFormData>();

  const password = watch('password');

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await apiService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Failed to load categories');
      }
    };

    loadCategories();
  }, []);

  // Only super agents should be able to register new agents
  if (!user || user.role !== 'agent' || !user.isSuperAgent) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-dark-400">Access Denied</p>
          <p className="text-dark-500 text-sm mt-2">
            Only super agents can register new support agents.
          </p>
        </div>
      </Card>
    );
  }

  const onSubmit = async (data: AgentRegistrationFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      
      await apiService.createAgent({
        ...registerData,
        categoryIds: selectedCategories
      });
      
      toast.success('Agent registered successfully with category subscriptions!');
      reset();
      setSelectedCategories([]);
      onSuccess?.();
    } catch (error: any) {
      console.error('Agent registration error:', error);
      toast.error(error.response?.data?.message || 'Failed to register agent. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Register New Agent</h3>
        <p className="text-dark-400 text-sm">Create a new support agent account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          placeholder="Enter agent's full name"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
            pattern: {
              value: /^[a-zA-Z\s]+$/,
              message: 'Name can only contain letters and spaces',
            },
          })}
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter agent's email"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a strong password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-dark-400 hover:text-dark-300"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
              },
            })}
          />
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm the password"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-dark-400 hover:text-dark-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm the password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-dark-300">
            <Tag className="h-4 w-4 inline mr-2" />
            Category Subscriptions
          </label>
          <p className="text-xs text-dark-400">
            Select categories this agent will handle tickets for
          </p>
          <div className="grid grid-cols-2 gap-3 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center space-x-2 p-2 rounded border border-dark-600 hover:border-dark-500 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCategories([...selectedCategories, category.id]);
                    } else {
                      setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                    }
                  }}
                  className="rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800"
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm text-dark-300">{category.name}</span>
                </div>
              </label>
            ))}
          </div>
          {selectedCategories.length === 0 && (
            <p className="text-xs text-yellow-400">
              Warning: Agent will not receive auto-assigned tickets without category subscriptions
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isSuperAgent"
            className="rounded border-dark-600 bg-dark-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-800"
            {...register('isSuperAgent')}
          />
          <label htmlFor="isSuperAgent" className="text-sm text-dark-300">
            Grant super agent privileges (can register other agents)
          </label>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          Register Agent
        </Button>
      </form>
    </Card>
  );
};

export default AgentRegistrationForm;