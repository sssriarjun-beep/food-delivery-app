import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { HiPlus, HiMinus, HiTrash, HiOutlineShoppingCart } from 'react-icons/hi2';
import { CartItem } from '../types';

const CartPage: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  if (!context) {
    throw new Error('CartPage must be used within an AppContext.Provider');
  }

  const { cart, updateCartItem, removeFromCart, clearCart, showNotification } = context;

  const calculateItemPrice = (item: CartItem) => {
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
      item.addOns.forEach(addOnName => {
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
  const totalAmount = subtotal + deliveryFee - appliedDiscount;

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'flavor10') { // Example promo code
      setAppliedDiscount(subtotal * 0.10); // 10% discount
      setPromoError('');
      showNotification('Promo code applied!', 'success');
    } else {
      setAppliedDiscount(0);
      setPromoError('Invalid or expired promo code.');
      showNotification('Invalid promo code.', 'error');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-lg shadow-md">
        <HiOutlineShoppingCart className="text-6xl text-gray-400 mb-6" />
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Your cart is empty!</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => navigate('/')}>Start Ordering</Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">Your Cart ({cart.length} items)</h2>
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
              <img
                src={item.dish.imageUrl}
                alt={item.dish.name}
                className="w-20 h-20 object-cover rounded-md mr-4 flex-shrink-0"
              />
              <div className="flex-grow">
                <p className="font-semibold text-lg text-gray-800">{item.dish.name}</p>
                {item.variants && Object.keys(item.variants).length > 0 && (
                  <p className="text-sm text-gray-600">
                    {Object.entries(item.variants).map(([cat, val]) => `${cat}: ${val}`).join(', ')}
                  </p>
                )}
                {item.addOns && item.addOns.length > 0 && (
                  <p className="text-sm text-gray-600">Add-ons: {item.addOns.join(', ')}</p>
                )}
                <p className="text-orange-600 font-bold mt-1">${calculateItemPrice(item).toFixed(2)}</p>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Button variant="secondary" size="sm" onClick={() => updateCartItem(item.id, item.quantity - 1)}>
                  <HiMinus />
                </Button>
                <span className="text-lg font-semibold w-6 text-center">{item.quantity}</span>
                <Button variant="secondary" size="sm" onClick={() => updateCartItem(item.id, item.quantity + 1)}>
                  <HiPlus />
                </Button>
                <Button variant="danger" size="sm" onClick={() => removeFromCart(item.id)} className="ml-2">
                  <HiTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Discount:</span>
                <span>-${appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2 mt-2">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-2">Promo Code</h4>
            <div className="flex">
              <input
                type="text"
                placeholder="Enter promo code"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:ring-orange-500 focus:border-orange-500 text-sm"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setPromoError('');
                }}
              />
              <Button onClick={handleApplyPromo} className="rounded-l-none">
                Apply
              </Button>
            </div>
            {promoError && <p className="text-red-500 text-sm mt-1">{promoError}</p>}
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            className="w-full mt-6 py-3 text-lg"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;