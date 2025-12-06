import React, { useContext } from 'react';
import { AppContext } from '../App';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { HiOutlineShoppingCart } from 'react-icons/hi';

const CartSummary: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('CartSummary must be used within an AppContext.Provider');
  }

  const { cart } = context;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => {
      let itemPrice = item.dish.price;
      // Add variant prices
      if (item.variants) {
        for (const variantCategoryName in item.variants) {
          const selectedOptionName = item.variants[variantCategoryName];
          const variantCategory = item.dish.variants?.find(vc => vc.name === variantCategoryName);
          const selectedOption = variantCategory?.options.find(opt => opt.name === selectedOptionName);
          if (selectedOption) {
            itemPrice += selectedOption.price;
          }
        }
      }
      // Add add-on prices
      if (item.addOns && item.dish.addOns) {
        item.addOns.forEach(addOnName => {
          const addOn = item.dish.addOns?.find(ao => ao.name === addOnName);
          if (addOn) {
            itemPrice += addOn.price;
          }
        });
      }
      return sum + itemPrice * item.quantity;
    },
    0
  );

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-lg p-4 md:p-6 border-t border-gray-200">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between max-w-7xl">
        <div className="flex items-center mb-2 md:mb-0">
          <HiOutlineShoppingCart className="text-3xl text-orange-600 mr-3" />
          <div className="text-gray-800">
            <p className="font-semibold text-lg">{totalItems} Item{totalItems > 1 ? 's' : ''} in Cart</p>
            <p className="text-sm text-gray-600">Total: <span className="font-bold text-orange-600 text-xl">${totalPrice.toFixed(2)}</span></p>
          </div>
        </div>
        <Button
          onClick={() => navigate('/cart')}
          className="w-full md:w-auto px-8 py-3"
        >
          View Cart & Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartSummary;