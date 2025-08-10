import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import toast from 'react-hot-toast';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  company?: string;
  role: 'customer'; // Only customer registration allowed in public form
}

const RegisterForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'customer',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;
      
      if (data.role === 'customer') {
        await registerCustomer(registerData);
        toast.success('Customer registration successful!');
      } else {
        // Agent registration should be done through admin interface
        throw new Error('Agent registration is not available through public registration');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed roleOptions as only customer registration is supported in public form

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-dark-400">Join FeathersUp ticketing system</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Only customer registration is allowed in public form */}
            <input type="hidden" {...register('role')} value="customer" />
            <div className="text-center py-4">
              <p className="text-dark-400 text-sm">
                Creating a customer account
              </p>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              leftIcon={<User className="h-4 w-4" />}
              error={errors.name?.message}
              {...register('name', {
                required: 'Name is required',
                minLength: {
                  value: 2,
                  message: 'Name must be at least 2 characters',
                },
              })}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
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

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="Enter your phone number"
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Company (Optional)"
              type="text"
              placeholder="Enter your company name"
              leftIcon={<Building className="h-4 w-4" />}
              error={errors.company?.message}
              {...register('company')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-dark-400 hover:text-white transition-colors"
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
                    message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)',
                  },
                })}
              />
              <p className="text-xs text-dark-400 mt-1">
                Password must contain at least 8 characters, including uppercase, lowercase, number, and special character (@$!%*?&)
              </p>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-dark-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-500 hover:text-primary-400 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterForm; 