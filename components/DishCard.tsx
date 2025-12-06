import React from 'react';
import { Dish } from '../types';
import Button from './Button';
import { HiOutlinePlusCircle } from 'react-icons/hi';
import { GiChiliPepper } from 'react-icons/gi'; // For spicy indicator
import { FaLeaf } from 'react-icons/fa'; // For vegetarian indicator

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
  onClick: (dish: Dish) => void; // For opening dish details modal/page
}

const DishCard: React.FC<DishCardProps> = ({ dish, onAddToCart, onClick }) => {
  const hasVariantsOrAddOns = (dish.variants && dish.variants.length > 0) || (dish.addOns && dish.addOns.length > 0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-full">
      <div className="relative h-40 w-full">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-full object-cover"
        />
        {dish.isVeg && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
            <FaLeaf className="mr-1" /> Veg
          </span>
        )}
        {/* Placeholder for spicy level if needed, e.g. from variants */}
        {/* {dish.spicyLevel && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
            <GiChiliPepper className="mr-1" /> Hot
          </span>
        )} */}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{dish.name}</h3>
        <p className="text-sm text-gray-600 mt-1 mb-3 flex-grow line-clamp-2">{dish.description}</p>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
          <span className="text-xl font-bold text-orange-600">${dish.price.toFixed(2)}</span>
          {!dish.inStock ? (
            <span className="text-red-500 text-sm font-semibold">Out of Stock</span>
          ) : (
            <Button
              onClick={(e) => {
                e.preventDefault(); // Prevent navigating if this card is inside a Link
                e.stopPropagation(); // Stop propagation to prevent card's onClick from firing
                if (hasVariantsOrAddOns) {
                  onClick(dish); // Open details modal if variants/addons exist
                } else {
                  onAddToCart(dish); // Directly add to cart if no customization needed
                }
              }}
              size="sm"
              className="flex items-center"
            >
              <HiOutlinePlusCircle className="mr-1 text-lg" />
              {hasVariantsOrAddOns ? 'Customize' : 'Add'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;