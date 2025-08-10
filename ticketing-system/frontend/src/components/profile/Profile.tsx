import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface ProfileFormData {
  name: string;
  email: string;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    try {
      // This would typically call an API to update the profile
      // For now, we'll just show a success message
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      reset(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset({
      name: user?.name || '',
      email: user?.email || ''
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-dark-400 mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card>
            <div className="text-center">
              <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">{user.name}</h2>
              <Badge variant={user.role === 'agent' ? 'success' : 'info'}>
                {user.role === 'agent' ? 'Support Agent' : 'Customer'}
              </Badge>
              
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="h-4 w-4 text-dark-400" />
                  <span className="text-dark-300">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Shield className="h-4 w-4 text-dark-400" />
                  <span className="text-dark-300">Account Active</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <Calendar className="h-4 w-4 text-dark-400" />
                  <span className="text-dark-300">Member since {new Date().getFullYear()}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Personal Information</h3>
              {!isEditing && (
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                      }
                    })}
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={errors.email?.message}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Full Name
                  </label>
                  <p className="text-white">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-400 mb-1">
                    Email Address
                  </label>
                  <p className="text-white">{user.email}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Account Settings */}
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Change Password</h4>
                  <p className="text-sm text-dark-400">Update your account password</p>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Two-Factor Authentication</h4>
                  <p className="text-sm text-dark-400">Add an extra layer of security</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-white">Notification Preferences</h4>
                  <p className="text-sm text-dark-400">Manage your notification settings</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile; 