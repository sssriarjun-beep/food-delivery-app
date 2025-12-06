import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Input from './Input';
import Button from './Button';

interface ProfileFormProps {
  initialData: User;
  onSubmit: (user: User) => void;
  onCancel: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [user, setUser] = useState<User>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setUser(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!user.name.trim()) newErrors.name = 'Name is required';
    if (!user.email.trim()) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(user.email)) newErrors.email = 'Email is invalid';
    if (!user.phone.trim()) newErrors.phone = 'Phone number is required';
    // Basic phone number validation, can be more robust
    if (!/^\+?\d[\d\s-]{7,}\d$/.test(user.phone)) newErrors.phone = 'Phone number is invalid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(user);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={user.name}
        onChange={handleChange}
        error={errors.name}
      />
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={user.email}
        onChange={handleChange}
        error={errors.email}
      />
      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={user.phone}
        onChange={handleChange}
        error={errors.phone}
      />
      {/* Preferences can be a multi-select or tags input */}
      {/* Membership and loyalty points are display-only */}
      <div className="flex justify-end space-x-3 mt-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;