import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../App';
import { Address, PaymentMethod, PaymentType, OrderStatus, Order } from '../types';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { HiMapPin, HiCreditCard, HiCheckCircle, HiChevronRight, HiPlus } from 'react-icons/hi2';
import Modal from '../components/Modal';
import AddressForm from '../components/AddressForm';
import Select from '../components/Select';
import Input from '../components/Input';
import { FaWallet } from 'react-icons/fa';

const CheckoutPage: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddressData, setNewAddressData] = useState<Address | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [newPaymentData, setNewPaymentData] = useState<{
    type: PaymentType;
    details: string;
    isDefault: boolean;
  }>({
    type: PaymentType.CREDIT_DEBIT_CARD,
    details: '',
    isDefault: false,
  });

  if (!context) {
    throw new Error('CheckoutPage must be used within an AppContext.Provider');
  }

  const {
    user,
    cart,
    addresses,
    setAddresses,
    paymentMethods,
    setPaymentMethods,
    clearCart,
    setActiveOrder,
    showNotification,
  } = context;

  // Initialize selected address/payment to default if available
  useMemo(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddress.id);
    }
    if (paymentMethods.length > 0 && !selectedPaymentMethodId) {
      const defaultPayment = paymentMethods.find(pm => pm.isDefault) || paymentMethods[0];
      setSelectedPaymentMethodId(defaultPayment.id);
    }
  }, [addresses, paymentMethods, selectedAddressId, selectedPaymentMethodId]);

  const calculateItemPrice = (item: any) => {
    let price = item.dish.price;
    if (item.variants) {
      for (const variantCategoryName in item.variants) {
        const selectedOptionName = item.variants[variantCategoryName];
        const variantCategory = item.dish.variants?.find(vc => vc.name === variantCategoryName);
        const selectedOption = variantCategory?.options.find(opt => opt.name === selectedOptionName);
        if (selectedOption) {
          price += selectedOption.price;
        }
      }
    }
    if (item.addOns && item.dish.addOns) {
      item.addOns.forEach((addOnName: string) => {
        const addOn = item.dish.addOns?.find(ao => ao.name === addOnName);
        if (addOn) {
          price += addOn.price;
        }
      });
    }
    return price;
  };

  const subtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0);
  const deliveryFee = subtotal > 0 ? 5.00 : 0; // Example delivery fee
  const totalAmount = subtotal + deliveryFee;

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
  const selectedPaymentMethod = paymentMethods.find(pm => pm.id === selectedPaymentMethodId);

  const handlePlaceOrder = async () => {
    if (!user) {
      showNotification('Please log in to place an order.', 'error');
      navigate('/auth');
      return;
    }
    if (cart.length === 0) {
      showNotification('Your cart is empty.', 'error');
      navigate('/');
      return;
    }
    if (!selectedAddress) {
      showNotification('Please select a delivery address.', 'error');
      return;
    }
    if (!selectedPaymentMethod) {
      showNotification('Please select a payment method.', 'error');
      return;
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId: user.id,
      restaurantId: cart[0].dish.restaurantId, // Assuming all items from one restaurant for simplicity
      items: cart,
      totalAmount: totalAmount,
      deliveryAddress: selectedAddress,
      deliveryInstructions: deliveryInstructions,
      paymentMethod: selectedPaymentMethod.type,
      orderTime: new Date().toISOString(),
      status: OrderStatus.PENDING,
      trackingUpdates: [
        {
          timestamp: new Date().toISOString(),
          status: OrderStatus.PENDING,
          message: 'Order placed successfully.',
        },
      ],
    };

    // Simulate order placement API call
    showNotification('Placing your order...', 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));

    setActiveOrder(newOrder); // Set the active order
    clearCart(); // Clear the cart after placing order
    showNotification('Order placed successfully!', 'success');
    navigate(`/order-tracking/${newOrder.id}`); // Navigate to tracking page
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
    setSelectedAddressId(finalAddress.id); // Select the newly added address
    setIsAddressModalOpen(false);
    showNotification('New address added.', 'success');
  };

  const handleAddPaymentMethod = () => {
    const newPayment: PaymentMethod = {
      id: `pm-${Date.now()}`,
      type: newPaymentData.type,
      details: newPaymentData.details,
      isDefault: newPaymentData.isDefault,
    };

    let updatedMethods = [...paymentMethods];
    if (newPayment.isDefault) {
      updatedMethods = updatedMethods.map(pm => ({ ...pm, isDefault: false }));
    }
    updatedMethods.push(newPayment);
    setPaymentMethods(updatedMethods);
    setSelectedPaymentMethodId(newPayment.id); // Select the newly added payment method
    setIsPaymentModalOpen(false);
    setNewPaymentData({
      type: PaymentType.CREDIT_DEBIT_CARD,
      details: '',
      isDefault: false,
    });
    showNotification('New payment method added!', 'success');
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Please log in to checkout.</h2>
        <Button onClick={() => navigate('/auth')}>Login / Signup</Button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Your cart is empty!</h2>
        <p className="text-gray-600 mb-6">Add items to proceed to checkout.</p>
        <Button onClick={() => navigate('/')}>Go to Home</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Order Summary & Details */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">Review Your Order</h2>

        {/* Cart Items */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Items in Cart</h3>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-center">
                <img
                  src={item.dish.imageUrl}
                  alt={item.dish.name}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.dish.name}</p>
                  {item.variants && Object.keys(item.variants).length > 0 && (
                    <p className="text-sm text-gray-600">
                      {Object.entries(item.variants).map(([cat, val]) => `${cat}: ${val}`).join(', ')}
                    </p>
                  )}
                  {item.addOns && item.addOns.length > 0 && (
                    <p className="text-sm text-gray-600">Add-ons: {item.addOns.join(', ')}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-700">{item.quantity} x ${calculateItemPrice(item).toFixed(2)}</p>
                  <p className="font-bold text-orange-600">${(calculateItemPrice(item) * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <HiMapPin className="mr-2 text-2xl text-orange-600" /> Delivery Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {addresses.map(addr => (
              <label
                key={addr.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200
                  ${selectedAddressId === addr.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <input
                  type="radio"
                  name="deliveryAddress"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-3">
                  <p className="font-semibold text-gray-900">{addr.tag} {addr.isDefault && <span className="text-xs text-green-600">(Default)</span>}</p>
                  <p className="text-sm text-gray-700">{addr.street}, {addr.city}</p>
                </span>
              </label>
            ))}
            <Button variant="outline" className="flex items-center justify-center p-4" onClick={() => setIsAddressModalOpen(true)}>
              <HiPlus className="mr-2" /> Add New Address
            </Button>
          </div>
        </div>

        {/* Delivery Instructions */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Delivery Instructions (Optional)</h3>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            rows={3}
            placeholder="e.g., Leave at door, call on arrival..."
            value={deliveryInstructions}
            onChange={(e) => setDeliveryInstructions(e.target.value)}
          ></textarea>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
            <HiCreditCard className="mr-2 text-2xl text-orange-600" /> Payment Method
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {paymentMethods.map(pm => (
              <label
                key={pm.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors duration-200
                  ${selectedPaymentMethodId === pm.id ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={pm.id}
                  checked={selectedPaymentMethodId === pm.id}
                  onChange={() => setSelectedPaymentMethodId(pm.id)}
                  className="form-radio h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-3">
                  <p className="font-semibold text-gray-900">{pm.type} {pm.isDefault && <span className="text-xs text-green-600">(Default)</span>}</p>
                  <p className="text-sm text-gray-700">{pm.details}</p>
                </span>
              </label>
            ))}
            <Button variant="outline" className="flex items-center justify-center p-4" onClick={() => setIsPaymentModalOpen(true)}>
              <HiPlus className="mr-2" /> Add New Payment
            </Button>
          </div>
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-28"> {/* Sticky for persistent CTA */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Order Summary</h3>
          <div className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            {/* Discount Placeholder */}
            {/* <div className="flex justify-between text-green-600 font-semibold">
              <span>Discount:</span>
              <span>-$0.00</span>
            </div> */}
            <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <Button
            onClick={handlePlaceOrder}
            className="w-full mt-6 py-3 text-lg"
            disabled={!selectedAddress || !selectedPaymentMethod || cart.length === 0}
          >
            Place Order
          </Button>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Add New Address">
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setIsAddressModalOpen(false)}
          isNew={true}
        />
      </Modal>

      {/* Add Payment Method Modal */}
      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Add New Payment Method">
        <form onSubmit={(e) => { e.preventDefault(); handleAddPaymentMethod(); }} className="space-y-4">
          <Select
            label="Payment Type"
            name="type"
            value={newPaymentData.type}
            onChange={(e) => setNewPaymentData(prev => ({ ...prev, type: e.target.value as PaymentType }))}
            options={[
              { value: PaymentType.CREDIT_DEBIT_CARD, label: PaymentType.CREDIT_DEBIT_CARD },
              { value: PaymentType.UPI, label: PaymentType.UPI },
              { value: PaymentType.WALLET, label: PaymentType.WALLET },
              { value: PaymentType.NET_BANKING, label: PaymentType.NET_BANKING },
              { value: PaymentType.CASH_ON_DELIVERY, label: PaymentType.CASH_ON_DELIVERY },
            ]}
          />
          {newPaymentData.type !== PaymentType.CASH_ON_DELIVERY && (
            <Input
              label="Details"
              name="details"
              value={newPaymentData.details}
              onChange={(e) => setNewPaymentData(prev => ({ ...prev, details: e.target.value }))}
              placeholder={newPaymentData.type === PaymentType.CREDIT_DEBIT_CARD ? 'e.g., Visa **** 1234' : 'e.g., Paytm Wallet'}
            />
          )}
          <div className="flex items-center">
            <input
              id="newPaymentIsDefault"
              name="isDefault"
              type="checkbox"
              checked={newPaymentData.isDefault}
              onChange={(e) => setNewPaymentData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="newPaymentIsDefault" className="ml-2 block text-sm text-gray-900">
              Set as default payment method
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CheckoutPage;