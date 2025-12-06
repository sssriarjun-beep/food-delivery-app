import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../App';
import DishCard from '../components/DishCard';
import LoadingSpinner from '../components/LoadingSpinner';
import RatingStars from '../components/RatingStars';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Dish, VariantCategory, AddOn } from '../types';
import { HiOutlineClock, HiMapPin, HiPlus, HiMinus, HiShoppingCart } from 'react-icons/hi2';
import ReviewCard from '../components/ReviewCard'; // Fix: Changed to default import
import { mockUser } from '../constants'; // For mock reviews
import { geminiService } from '../services/geminiService';

const mockReviews = [
  {
    id: 'rev1',
    userId: 'user-1',
    userName: 'Alice Smith',
    restaurantId: 'r1',
    rating: 5,
    comment: 'Absolutely love their Spaghetti Carbonara! Best in town.',
    reviewTime: new Date().toISOString(),
  },
  {
    id: 'rev2',
    userId: 'user-2',
    userName: 'Bob Johnson',
    restaurantId: 'r1',
    rating: 4,
    comment: 'Great pizza, a bit pricey but worth it for the quality ingredients.',
    reviewTime: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
  {
    id: 'rev3',
    userId: 'user-3',
    userName: 'Charlie Brown',
    restaurantId: 'r2',
    rating: 4.5,
    comment: 'The Butter Chicken is amazing! Highly recommend.',
    reviewTime: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
];

const DishDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  dish: Dish;
  onAddToCart: (dish: Dish, quantity: number, variants?: Record<string, string>, addOns?: string[]) => void;
  isLoadingDescription: boolean;
  enhancedDescription: string;
}> = ({ isOpen, onClose, dish, onAddToCart, isLoadingDescription, enhancedDescription }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  useEffect(() => {
    if (dish) {
      // Initialize variants to default (first option) or empty
      const initialVariants: Record<string, string> = {};
      dish.variants?.forEach(vc => {
        if (vc.options.length > 0) {
          initialVariants[vc.name] = vc.options[0].name;
        }
      });
      setSelectedVariants(initialVariants);
      setSelectedAddOns([]);
      setQuantity(1);
    }
  }, [dish]);

  const handleVariantChange = (categoryName: string, optionName: string) => {
    setSelectedVariants(prev => ({ ...prev, [categoryName]: optionName }));
  };

  const handleAddOnChange = (addOnName: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addOnName) ? prev.filter(name => name !== addOnName) : [...prev, addOnName]
    );
  };

  const calculateCurrentPrice = useCallback(() => {
    let currentPrice = dish.price;
    // Add variant prices
    dish.variants?.forEach(vc => {
      const selectedOptionName = selectedVariants[vc.name];
      const selectedOption = vc.options.find(opt => opt.name === selectedOptionName);
      if (selectedOption) {
        currentPrice += selectedOption.price;
      }
    });
    // Add add-on prices
    dish.addOns?.forEach(ao => {
      if (selectedAddOns.includes(ao.name)) {
        currentPrice += ao.price;
      }
    });
    return currentPrice;
  }, [dish, selectedVariants, selectedAddOns]);

  if (!dish) return null;

  const currentPrice = calculateCurrentPrice();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={dish.name}>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2">
          <img src={dish.imageUrl} alt={dish.name} className="w-full h-64 object-cover rounded-lg mb-4" />
          <h4 className="text-xl font-semibold mb-2 text-gray-900">Description</h4>
          {isLoadingDescription ? (
            <LoadingSpinner size="sm" className="h-10" />
          ) : (
            <p className="text-gray-700">{enhancedDescription || dish.description}</p>
          )}

          {dish.variants && dish.variants.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Variants</h4>
              {dish.variants.map((vc: VariantCategory) => (
                <div key={vc.name} className="mb-4">
                  <p className="font-medium text-gray-800 mb-2">{vc.name}:</p>
                  <div className="flex flex-wrap gap-2">
                    {vc.options.map(option => (
                      <Button
                        key={option.name}
                        variant={selectedVariants[vc.name] === option.name ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handleVariantChange(vc.name, option.name)}
                      >
                        {option.name} {option.price > 0 && `(+$${option.price.toFixed(2)})`}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dish.addOns && dish.addOns.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xl font-semibold mb-2 text-gray-900">Add-ons</h4>
              <div className="flex flex-wrap gap-2">
                {dish.addOns.map((addOn: AddOn) => (
                  <Button
                    key={addOn.id}
                    variant={selectedAddOns.includes(addOn.name) ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleAddOnChange(addOn.name)}
                  >
                    {addOn.name} (+$<span className="font-mono">{addOn.price.toFixed(2)}</span>)
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:w-1/2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-2xl font-bold text-orange-600 mb-4">
              <span>${currentPrice.toFixed(2)}</span>
            </div>

            <h4 className="text-xl font-semibold mb-2 text-gray-900">Ingredient Details</h4>
            <p className="text-gray-700 text-sm italic">
              A general list of ingredients: {dish.name} typically contains {' '}
              {dish.isVeg ? 'vegetables, spices' : 'meat, vegetables, spices'}.
              Please check with the restaurant for specific allergens.
            </p>
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button variant="secondary" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                <HiMinus />
              </Button>
              <span className="text-2xl font-bold text-gray-900">{quantity}</span>
              <Button variant="secondary" size="sm" onClick={() => setQuantity(quantity + 1)}>
                <HiPlus />
              </Button>
            </div>
            <Button
              onClick={() => {
                onAddToCart(dish, quantity, selectedVariants, selectedAddOns);
                onClose();
              }}
              className="w-full flex items-center justify-center text-lg py-3"
              disabled={!dish.inStock}
            >
              <HiShoppingCart className="mr-2 text-xl" />
              Add {quantity} to Cart - ${ (currentPrice * quantity).toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};


const RestaurantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const context = useContext(AppContext);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [enhancedDescription, setEnhancedDescription] = useState('');
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  if (!context) {
    throw new Error('RestaurantDetailsPage must be used within an AppContext.Provider');
  }

  const { restaurants, dishes, addToCart, showNotification } = context;
  const restaurant = restaurants.find(r => r.id === id);
  const restaurantDishes = dishes.filter(d => d.restaurantId === id);
  const restaurantReviews = mockReviews.filter(r => r.restaurantId === id); // Mock reviews

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top on page load
  }, [id]);

  const handleDishCardClick = useCallback(async (dish: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
    setEnhancedDescription(''); // Clear previous description
    setIsLoadingDescription(true);
    try {
      const description = await geminiService.getDishDescriptionEnhancement(dish);
      setEnhancedDescription(description);
    } catch (error) {
      console.error('Failed to get enhanced description:', error);
      setEnhancedDescription(dish.description); // Fallback to original
    } finally {
      setIsLoadingDescription(false);
    }
  }, []);


  const handleAddToCartFromModal = useCallback((dish: Dish, quantity: number, variants?: Record<string, string>, addOns?: string[]) => {
    addToCart(dish, quantity, variants, addOns);
  }, [addToCart]);


  if (!restaurant) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Restaurant Not Found</h2>
        <p className="text-gray-600">The restaurant you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-64 md:h-80 w-full">
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
          <div className="absolute bottom-0 left-0 p-6 text-white">
            <h1 className="text-4xl font-extrabold mb-2">{restaurant.name}</h1>
            <p className="text-lg mb-2">{restaurant.cuisine.join(', ')}</p>
            <div className="flex items-center space-x-4">
              <RatingStars rating={restaurant.rating} className="text-xl" />
              <span className="flex items-center text-lg">
                <HiOutlineClock className="mr-1" /> {restaurant.deliveryTimeMinutes} min
              </span>
              <span className="flex items-center text-lg">
                <HiMapPin className="mr-1" /> {restaurant.address}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <p className="text-gray-700 text-lg mb-8">{restaurant.description}</p>

          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">Menu</h2>
          {restaurantDishes.length === 0 ? (
            <p className="text-gray-600">No dishes available for this restaurant yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurantDishes.map(dish => (
                <DishCard
                  key={dish.id}
                  dish={dish}
                  onAddToCart={(d) => addToCart(d, 1)} // Default add to cart without customization
                  onClick={handleDishCardClick} // Open modal for customization
                />
              ))}
            </div>
          )}

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 border-b pb-3">Reviews</h2>
          {restaurantReviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {restaurantReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedDish && (
        <DishDetailsModal
          isOpen={isDishModalOpen}
          onClose={() => setIsDishModalOpen(false)}
          dish={selectedDish}
          onAddToCart={handleAddToCartFromModal}
          isLoadingDescription={isLoadingDescription}
          enhancedDescription={enhancedDescription}
        />
      )}
    </div>
  );
};

export default RestaurantDetailsPage;