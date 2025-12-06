import React, { useState, useEffect } from 'react';
import { Address } from '../types';
import Input from './Input';
import Button from './Button';
import Select from './Select'; // Assuming a Select component exists

interface AddressFormProps {
  initialData?: Address;
  onSubmit: (address: Address) => void;
  onCancel: () => void;
  isNew?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialData, onSubmit, onCancel, isNew = false }) => {
  const [address, setAddress] = useState<Address>(
    initialData || {
      id: '',
      tag: 'Home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      instructions: '',
      isDefault: false,
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setAddress(initialData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setAddress(prev => ({ ...prev, [name]: checked }));
    } else {
      setAddress(prev => ({ ...prev, [name]: value }));
    }
    // Clear error for the field being edited
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!address.tag) newErrors.tag = 'Tag is required';
    if (!address.street.trim()) newErrors.street = 'Street is required';
    if (!address.city.trim()) newErrors.city = 'City is required';
    if (!address.state.trim()) newErrors.state = 'State is required';
    if (!address.zipCode.trim()) newErrors.zipCode = 'Zip Code is required';
    if (!address.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(address);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Address Tag"
        name="tag"
        value={address.tag}
        onChange={handleChange}
        options={[
          { value: 'Home', label: 'Home' },
          { value: 'Work', label: 'Work' },
          { value: 'Other', label: 'Other' },
        ]}
        error={errors.tag}
      />
      <Input
        label="Street Address"
        name="street"
        value={address.street}
        onChange={handleChange}
        placeholder="e.g., 123 Main St"
        error={errors.street}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="City"
          name="city"
          value={address.city}
          onChange={handleChange}
          error={errors.city}
        />
        <Input
          label="State / Province"
          name="state"
          value={address.state}
          onChange={handleChange}
          error={errors.state}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Zip / Postal Code"
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          error={errors.zipCode}
        />
        <Input
          label="Country"
          name="country"
          value={address.country}
          onChange={handleChange}
          error={errors.country}
        />
      </div>
      <div>
        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
          Delivery Instructions (Optional)
        </label>
        <textarea
          id="instructions"
          name="instructions"
          value={address.instructions}
          onChange={handleChange}
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
          placeholder="e.g., Leave at door, call on arrival..."
        ></textarea>
      </div>
      <div className="flex items-center">
        <input
          id="isDefault"
          name="isDefault"
          type="checkbox"
          checked={address.isDefault}
          onChange={handleChange}
          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
        />
        <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
          Set as default address
        </label>
      </div>
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isNew ? 'Add Address' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;