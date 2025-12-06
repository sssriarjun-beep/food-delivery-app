import React from 'react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../types';
import RatingStars from './RatingStars';
import { HiFire, HiOutlineClock } from 'react-icons/hi';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
        <div className="relative h-40 overflow-hidden">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
          />
          {restaurant.hasOffers && (
            <span className="absolute bottom-2 left-2 bg-orange-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center">
              <HiFire className="mr-1" /> Offers!
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold text-gray-900 mb-1 line-clamp-1">{restaurant.name}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{restaurant.cuisine.join(', ')}</p>
          <div className="flex items-center justify-between text-sm text-gray-700 mb-3">
            <RatingStars rating={restaurant.rating} />
            <span className="flex items-center ml-auto">
              <HiOutlineClock className="mr-1 text-lg" /> {restaurant.deliveryTimeMinutes} min
            </span>
          </div>
          <p className="text-lg font-bold text-gray-800">{restaurant.priceRange}</p>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;