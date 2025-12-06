import React, { useContext, useState, useMemo, useCallback } from 'react';
import { AppContext } from '../App';
import Button from '../components/Button';
import ProfileForm from '../components/ProfileForm';
import AddressForm from '../components/AddressForm';
import Modal from '../components/Modal';
import { Address, PaymentMethod, PaymentType, User } from '../types'; // Fix: Imported User type
import { HiOutlineUserCircle, HiMapPin, HiCreditCard, HiPlus, HiPencilSquare, HiTrash, HiCheckCircle } from 'react-icons/hi2';
import { FaWallet } from 'react-icons/fa';
import { clsx } from 'clsx';
import Select from '../components/Select';
import Input from '../components/Input';
import { mockRestaurants } from '../constants'; // Fix: Imported mockRestaurants for past orders

const ProfilePage: React.FC = () => {
  const context = useContext(AppContext);
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [currentPaymentFormData, setCurrentPaymentFormData] = useState<{
    type: PaymentType;
    details: string;
    isDefault: boolean;
  }>({
    type: PaymentType.CREDIT_DEBIT_CARD,
    details: '',
    isDefault: false,
  });

  if (!context) {
    throw new Error('ProfilePage must be used within an AppContext.Provider');
  }

  const { user, setUser, addresses, setAddresses, paymentMethods, setPaymentMethods, showNotification } = context;

  const handleUpdateProfile = (updatedUser: User) => {
    setUser(updatedUser);
    setIsProfileEditing(false);
    showNotification('Profile updated successfully!', 'success');
  };

  const handleAddAddress = (newAddress: Address) => {
    const finalAddress: Address = {
      ...newAddress,
      id: `addr-${Date.now()}`,
    };
    let updatedAddresses = [...addresses];
    if (finalAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    updatedAddresses.push(finalAddress);
    setAddresses(updatedAddresses);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    showNotification('Address added successfully!', 'success');
  };

  const handleUpdateAddress = (updatedAddress: Address) => {
    let updatedAddresses = addresses.map(addr => {
      if (addr.id === updatedAddress.id) {
        return updatedAddress;
      } else if (updatedAddress.isDefault) {
        // If the current address is set to default, ensure others are not
        return { ...addr, isDefault: false };
      }
      return addr;
    });
    setAddresses(updatedAddresses);
    setIsAddressModalOpen(false);
    setEditingAddress(null);
    showNotification('Address updated successfully!', 'success');
  };

  const handleDeleteAddress = (addressId: string) => {
    setAddresses(addresses.filter(addr => addr.id !== addressId));
    showNotification('Address removed.', 'info');
  };

  const handleSetDefaultAddress = (addressId: string) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    setAddresses(updatedAddresses);
    showNotification('Default address set.', 'success');
  };

  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setCurrentPaymentFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAddPaymentMethod = () => {
    const newPayment: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: currentPaymentFormData.type,
      details: currentPaymentFormData.details,
      isDefault: currentPaymentFormData.isDefault,
    };

    let updatedMethods = [...paymentMethods];
    if (newPayment.isDefault) {
      updatedMethods = updatedMethods.map(pm => ({ ...pm, isDefault: false }));
    }
    updatedMethods.push(newPayment);
    setPaymentMethods(updatedMethods);
    setIsPaymentModalOpen(false);
    setCurrentPaymentFormData({
      type: PaymentType.CREDIT_DEBIT_CARD,
      details: '',
      isDefault: false,
    });
    showNotification('Payment method added!', 'success');
  };

  const handleUpdatePaymentMethod = (updatedPayment: PaymentMethod) => {
    let updatedMethods = paymentMethods.map(pm => {
      if (pm.id === updatedPayment.id) {
        return updatedPayment;
      } else if (updatedPayment.isDefault) {
        return { ...pm, isDefault: false };
      }
      return pm;
    });
    setPaymentMethods(updatedMethods);
    setIsPaymentModalOpen(false);
    setEditingPayment(null);
    setCurrentPaymentFormData({
      type: PaymentType.CREDIT_DEBIT_CARD,
      details: '',
      isDefault: false,
    });
    showNotification('Payment method updated!', 'success');
  };

  const handleDeletePaymentMethod = (pmId: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== pmId));
    showNotification('Payment method removed.', 'info');
  };

  const handleSetDefaultPaymentMethod = (pmId: string) => {
    const updatedMethods = paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === pmId,
    }));
    setPaymentMethods(updatedMethods);
    showNotification('Default payment method set.', 'success');
  };

  const handleOpenAddPayment = () => {
    setEditingPayment(null);
    setCurrentPaymentFormData({
      type: PaymentType.CREDIT_DEBIT_CARD,
      details: '',
      isDefault: false,
    });
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPayment = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setCurrentPaymentFormData({
      type: payment.type,
      details: payment.details,
      isDefault: payment.isDefault || false,
    });
    setIsPaymentModalOpen(true);
  };


  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiOutlineUserCircle className="mr-2 text-3xl text-orange-600" /> My Profile
          </h2>
          <Button onClick={() => setIsProfileEditing(!isProfileEditing)} variant="secondary">
            {isProfileEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
        {isProfileEditing ? (
          <ProfileForm initialData={user} onSubmit={handleUpdateProfile} onCancel={() => setIsProfileEditing(false)} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <p className="font-semibold">Name:</p>
              <p>{user.name}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="font-semibold">Phone:</p>
              <p>{user.phone}</p>
            </div>
            <div>
              <p className="font-semibold">Loyalty Points:</p>
              <p>{user.loyaltyPoints || 0}</p>
            </div>
            <div>
              <p className="font-semibold">Membership:</p>
              <p>{user.membershipLevel || 'None'}</p>
            </div>
            {user.preferences && user.preferences.length > 0 && (
              <div>
                <p className="font-semibold">Preferences:</p>
                <p>{user.preferences.join(', ')}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Addresses */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiMapPin className="mr-2 text-3xl text-orange-600" /> My Addresses
          </h2>
          <Button onClick={handleOpenAddAddress} size="sm">
            <HiPlus className="mr-1" /> Add New Address
          </Button>
        </div>
        {addresses.length === 0 ? (
          <p className="text-gray-600">No addresses saved. Add one to speed up checkout!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <div key={addr.id} className="border border-gray-200 rounded-lg p-4 relative">
                <p className="font-semibold text-gray-900 flex items-center">
                  {addr.tag}
                  {addr.isDefault && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                      <HiCheckCircle className="mr-1" /> Default
                    </span>
                  )}
                </p>
                <p className="text-gray-700">{addr.street}</p>
                <p className="text-gray-700">{addr.city}, {addr.state} {addr.zipCode}</p>
                <p className="text-gray-700">{addr.country}</p>
                {addr.instructions && <p className="text-sm italic text-gray-500">Inst: {addr.instructions}</p>}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEditAddress(addr)} aria-label="Edit address">
                    <HiPencilSquare className="text-lg" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)} aria-label="Delete address">
                    <HiTrash className="text-lg text-red-500" />
                  </Button>
                </div>
                {!addr.isDefault && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleSetDefaultAddress(addr.id)}>
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
        title={editingAddress ? 'Edit Address' : 'Add New Address'}
      >
        <AddressForm
          initialData={editingAddress || undefined}
          onSubmit={editingAddress ? handleUpdateAddress : handleAddAddress}
          onCancel={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
          isNew={!editingAddress}
        />
      </Modal>

      {/* Payment Methods */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <HiCreditCard className="mr-2 text-3xl text-orange-600" /> My Payment Methods
          </h2>
          <Button onClick={handleOpenAddPayment} size="sm">
            <HiPlus className="mr-1" /> Add New Card
          </Button>
        </div>
        {paymentMethods.length === 0 ? (
          <p className="text-gray-600">No payment methods saved. Add one for faster checkout!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="border border-gray-200 rounded-lg p-4 relative">
                <p className="font-semibold text-gray-900 flex items-center">
                  {pm.type}
                  {pm.isDefault && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center">
                      <HiCheckCircle className="mr-1" /> Default
                    </span>
                  )}
                </p>
                <p className="text-gray-700">{pm.details}</p>
                <div className="absolute top-2 right-2 flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEditPayment(pm)} aria-label="Edit payment method">
                    <HiPencilSquare className="text-lg" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeletePaymentMethod(pm.id)} aria-label="Delete payment method">
                    <HiTrash className="text-lg text-red-500" />
                  </Button>
                </div>
                {!pm.isDefault && (
                  <Button variant="outline" size="sm" className="mt-4" onClick={() => handleSetDefaultPaymentMethod(pm.id)}>
                    Set as Default
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setEditingPayment(null); }}
        title={editingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}
      >
        <form onSubmit={(e) => { e.preventDefault(); editingPayment ? handleUpdatePaymentMethod({ ...editingPayment, ...currentPaymentFormData }) : handleAddPaymentMethod(); }} className="space-y-4">
          <Select
            label="Payment Type"
            name="type"
            value={currentPaymentFormData.type}
            onChange={handlePaymentFormChange}
            options={[
              { value: PaymentType.CREDIT_DEBIT_CARD, label: PaymentType.CREDIT_DEBIT_CARD },
              { value: PaymentType.UPI, label: PaymentType.UPI },
              { value: PaymentType.WALLET, label: PaymentType.WALLET },
              { value: PaymentType.NET_BANKING, label: PaymentType.NET_BANKING },
              { value: PaymentType.CASH_ON_DELIVERY, label: PaymentType.CASH_ON_DELIVERY },
            ]}
          />
          {currentPaymentFormData.type !== PaymentType.CASH_ON_DELIVERY && (
            <Input
              label="Details"
              name="details"
              value={currentPaymentFormData.details}
              onChange={handlePaymentFormChange}
              placeholder={currentPaymentFormData.type === PaymentType.CREDIT_DEBIT_CARD ? 'e.g., Visa **** 1234' : 'e.g., Paytm Wallet'}
            />
          )}
          <div className="flex items-center">
            <input
              id="paymentIsDefault"
              name="isDefault"
              type="checkbox"
              checked={currentPaymentFormData.isDefault}
              onChange={handlePaymentFormChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="paymentIsDefault" className="ml-2 block text-sm text-gray-900">
              Set as default payment method
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingPayment ? 'Save Changes' : 'Add Payment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Past Orders - Mock Data */}
      <section className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-3 flex items-center">
          <FaWallet className="mr-2 text-2xl text-orange-600" /> Past Orders
        </h2>
        {/* Placeholder for actual past orders list */}
        <p className="text-gray-600">No past orders found. Start ordering now!</p>
        <div className="mt-4 space-y-4">
          {/* Example of a mock past order */}
          <div className="border border-gray-200 rounded-lg p-4">
            <p className="font-semibold text-lg">Order #ORD-2024-001</p>
            <p className="text-gray-700">Restaurant: {mockRestaurants.find(r => r.id === 'r1')?.name}</p>
            <p className="text-gray-700">Total: $36.50</p>
            <p className="text-gray-500 text-sm">Delivered on {new Date(Date.now() - 86400000 * 10).toLocaleDateString()}</p>
            <Button variant="outline" size="sm" className="mt-3">
              View Details / Reorder
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProfilePage;