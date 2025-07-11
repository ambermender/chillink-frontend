import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button, Input, Textarea, Card, CardHeader, CardContent } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useRooms } from '@/hooks/useRooms';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function CreateRoomPage() {
  const { user, loading: authLoading } = useAuth();
  const { createRoom } = useRooms();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    password: '',
    isPrivate: false,
    maxMembers: 10,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Room name is required';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Room name must be at least 3 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Room name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters';
    }

    if (formData.isPrivate && !formData.password) {
      newErrors.password = 'Password is required for private rooms';
    } else if (formData.password && formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (formData.maxMembers < 2) {
      newErrors.maxMembers = 'Room must allow at least 2 members';
    } else if (formData.maxMembers > 50) {
      newErrors.maxMembers = 'Room cannot have more than 50 members';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const room = await createRoom({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        password: formData.isPrivate ? formData.password : undefined,
        isPrivate: formData.isPrivate,
        maxMembers: formData.maxMembers,
      });
      
      if (room) {
        router.push(`/room/${room.id}`);
      }
    } catch (error) {
      // Error is handled by the useRooms hook
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Create Room - Chillink</title>
        <meta name="description" content="Create a new voice room" />
      </Head>
      
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">
              Create Voice Room
            </h1>
            <p className="text-secondary-600">
              Set up your voice room and invite friends to join
            </p>
          </div>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-secondary-900">
                Room Settings
              </h2>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="text"
                  name="name"
                  label="Room Name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Enter room name"
                  required
                />
                
                <Textarea
                  name="description"
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={handleChange}
                  error={errors.description}
                  placeholder="Describe what this room is for..."
                  rows={3}
                />
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isPrivate"
                      name="isPrivate"
                      checked={formData.isPrivate}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="isPrivate" className="text-sm font-medium text-secondary-700">
                      Make this room private
                    </label>
                  </div>
                  
                  {formData.isPrivate && (
                    <Input
                      type="password"
                      name="password"
                      label="Room Password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      placeholder="Enter room password"
                      helperText="Users will need this password to join"
                      required
                    />
                  )}
                </div>
                
                <Input
                  type="number"
                  name="maxMembers"
                  label="Maximum Members"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  error={errors.maxMembers}
                  min={2}
                  max={50}
                  helperText="Maximum number of people who can join this room"
                  required
                />
                
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading}
                    className="flex-1"
                  >
                    Create Room
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Tips */}
          <Card className="mt-8" variant="glass">
            <CardContent>
              <h3 className="text-lg font-semibold text-secondary-900 mb-3">
                💡 Tips for creating great rooms
              </h3>
              <ul className="space-y-2 text-sm text-secondary-600">
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">•</span>
                  <span>Choose a clear, descriptive name that tells people what the room is about</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">•</span>
                  <span>Add a description to help people understand the room's purpose</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">•</span>
                  <span>Use private rooms with passwords for intimate conversations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary-600 mt-0.5">•</span>
                  <span>Set an appropriate member limit based on your intended group size</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}