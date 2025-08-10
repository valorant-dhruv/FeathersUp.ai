import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Category } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Card from '../ui/Card';

interface NewTicketFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  categoryId: number;
}

const NewTicketForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<NewTicketFormData>({
    defaultValues: {
      priority: 'medium',
      categoryId: 0
    }
  });

  const priorityOptions = [
    { value: 'low', label: 'Low', className: 'text-success-400' },
    { value: 'medium', label: 'Medium', className: 'text-warning-400' },
    { value: 'high', label: 'High', className: 'text-danger-400' },
    { value: 'urgent', label: 'Urgent', className: 'text-danger-600' }
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const fetchedCategories = await apiService.getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories. Please refresh the page.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Transform categories for the Select component
  const categoryOptions = categories.map(category => ({
    value: category.id.toString(),
    label: category.name,
    className: `text-[${category.color}]`
  }));

  const onSubmit = async (data: NewTicketFormData) => {
    if (!user) return;
    
    console.log('Form data submitted:', data); // Debug log
    
    // Validate required fields
    if (!data.categoryId || !data.priority) {
      toast.error('Please select both category and priority');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const ticketData = {
        ...data,
        customerId: user.id,
        status: 'open' as const
      };
      
      console.log('Ticket data being sent:', ticketData); // Debug log
      
      await apiService.createTicket(ticketData);
      toast.success('Ticket created successfully!');
      reset();
      navigate('/tickets');
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/tickets')}
          className="mb-4"
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Tickets
        </Button>
        <h1 className="text-2xl font-bold text-white">Create New Ticket</h1>
        <p className="text-dark-400 mt-2">
          Describe your issue and we'll get back to you as soon as possible.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
              Ticket Title *
            </label>
            <Input
              id="title"
              placeholder="Brief description of your issue"
              {...register('title', {
                required: 'Title is required',
                minLength: {
                  value: 5,
                  message: 'Title must be at least 5 characters'
                }
              })}
              error={errors.title?.message}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
              Category *
            </label>
            {isLoadingCategories ? (
              <div className="animate-pulse bg-dark-700 rounded-lg p-3">
                <div className="h-10 bg-dark-600 rounded"></div>
              </div>
            ) : (
                          <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field }) => (
                <Select
                  id="categoryId"
                  options={categoryOptions}
                  value={field.value?.toString() || ''}
                  onChange={(value) => field.onChange(parseInt(value))}
                  error={errors.categoryId?.message}
                  disabled={isLoadingCategories}
                />
              )}
            />
            )}
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-white mb-2">
              Priority *
            </label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: 'Priority is required' }}
              render={({ field }) => (
                <Select
                  id="priority"
                  options={priorityOptions}
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.priority?.message}
                />
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description *
            </label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue..."
              rows={6}
              {...register('description', {
                required: 'Description is required',
                minLength: {
                  value: 20,
                  message: 'Description must be at least 20 characters'
                }
              })}
              error={errors.description?.message}
            />
          </div>

          {/* File Attachment Placeholder */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Attachments (Coming Soon)
            </label>
            <div className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center">
              <Paperclip className="h-8 w-8 text-dark-400 mx-auto mb-2" />
              <p className="text-dark-400 text-sm">
                File attachment feature will be available soon
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/tickets')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              icon={<Send className="h-4 w-4" />}
            >
              {isSubmitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewTicketForm; 