import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { AppContext } from '../App';
import RestaurantCard from '../components/RestaurantCard';
import { useLocation } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { HiAdjustmentsHorizontal, HiOutlineXCircle } from 'react-icons/hi2';
import Select from '../components/Select';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Restaurant } from '../types';
import { geminiService } from '../services/geminiService';

const HomePage: React.FC = () => {
  const context = useContext(AppContext);
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<any>({
    cuisine: '',
    rating: '',
    priceRange: '',
    deliveryTime: '',
    offers: false,
    vegOnly: false,
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [recommendedRestaurants, setRecommendedRestaurants] = useState<Restaurant[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  if (!context) {
    throw new Error('HomePage must be used within an AppContext.Provider');
  }

  const { restaurants, user } = context;

  // Initialize search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  // Fetch recommendations when user or restaurants change
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoadingRecommendations(true);
      if (user && restaurants.length > 0) {
        // Mock past order cuisines for Gemini, in a real app this would come from user's order history
        const pastOrderCuisines = user.preferences || []; // Using preferences as a proxy for now
        const recommendations = await geminiService.getRestaurantRecommendations(
          user.preferences || [],
          pastOrderCuisines,
          restaurants
        );
        setRecommendedRestaurants(recommendations);
      } else {
        setRecommendedRestaurants([]);
      }
      setLoadingRecommendations(false);
    };

    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.preferences, restaurants.length]); // Dependencies for useEffect

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setActiveFilters((prev: any) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setActiveFilters((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const applyFilters = () => {
    // Filters are applied in the memoized filteredRestaurants below
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    setActiveFilters({
      cuisine: '',
      rating: '',
      priceRange: '',
      deliveryTime: '',
      offers: false,
      vegOnly: false,
    });
  };

  const allCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    restaurants.forEach(r => r.cuisine.forEach(c => cuisines.add(c)));
    return Array.from(cuisines).sort();
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    let filtered = restaurants;

    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
        context.dishes.some(d => d.restaurantId === r.id && d.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (activeFilters.cuisine) {
      filtered = filtered.filter(r => r.cuisine.includes(activeFilters.cuisine));
    }
    if (activeFilters.rating) {
      filtered = filtered.filter(r => r.rating >= parseFloat(activeFilters.rating));
    }
    if (activeFilters.priceRange) {
      filtered = filtered.filter(r => r.priceRange === activeFilters.priceRange);
    }
    if (activeFilters.deliveryTime) {
      filtered = filtered.filter(r => r.deliveryTimeMinutes <= parseInt(activeFilters.deliveryTime));
    }
    if (activeFilters.offers) {
      filtered = filtered.filter(r => r.hasOffers);
    }
    if (activeFilters.vegOnly) {
      filtered = filtered.filter(r => r.isVegOnly);
    }

    return filtered;
  }, [restaurants, searchQuery, activeFilters, context.dishes]);

  // Determine which section to show
  const showRecommendations = user && filteredRestaurants.length > 0 && searchQuery === '' && Object.values(activeFilters).every(v => !v || v === false);
  const showSearchResults = searchQuery !== '' || Object.values(activeFilters).some(v => v && v !== false);

  return (
    <div className="space-y-8">
      {/* Search Bar (Mobile) */}
      <div className="flex gap-2 mb-6 md:hidden">
        <Input
          type="text"
          placeholder="Search restaurants or dishes..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="flex-grow"
        />
        <Button onClick={() => setIsFilterModalOpen(true)} variant="secondary" className="p-2">
          <HiAdjustmentsHorizontal className="text-xl" />
        </Button>
      </div>

      {showRecommendations && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Recommended For You</h2>
          {loadingRecommendations ? (
            <LoadingSpinner className="h-24" />
          ) : recommendedRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendedRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No personalized recommendations at the moment. Explore popular restaurants!</p>
          )}
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {showSearchResults ? 'Search Results' : 'Popular Restaurants'}
          </h2>
          <Button onClick={() => setIsFilterModalOpen(true)} variant="secondary" className="hidden md:flex items-center">
            <HiAdjustmentsHorizontal className="mr-2" /> Filters
          </Button>
        </div>

        {/* Applied Filters Display */}
        {Object.values(activeFilters).some(v => v && v !== false) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (value && value !== false) {
                return (
                  <span key={key} className="flex items-center bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {key}: {String(value)}
                    <button
                      onClick={() => setActiveFilters((prev: any) => ({ ...prev, [key]: key === 'offers' || key === 'vegOnly' ? false : '' }))}
                      className="ml-2 text-gray-500 hover:text-gray-800"
                    >
                      <HiOutlineXCircle />
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        )}

        {filteredRestaurants.length === 0 && (
          <p className="text-gray-600 text-center py-8">No restaurants found matching your criteria. Try adjusting your search or filters.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRestaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Restaurants">
        <div className="space-y-4">
          <Select
            label="Cuisine"
            name="cuisine"
            value={activeFilters.cuisine}
            onChange={handleFilterChange}
            options={[{ value: '', label: 'All Cuisines' }, ...allCuisines.map(c => ({ value: c, label: c }))]}
          />
          <Select
            label="Min Rating"
            name="rating"
            value={activeFilters.rating}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'Any Rating' },
              { value: '4.5', label: '4.5 Stars & Up' },
              { value: '4.0', label: '4.0 Stars & Up' },
              { value: '3.5', label: '3.5 Stars & Up' },
            ]}
          />
          <Select
            label="Price Range"
            name="priceRange"
            value={activeFilters.priceRange}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'Any Price' },
              { value: '$', label: '$ (Cheap)' },
              { value: '$$', label: '$$ (Moderate)' },
              { value: '$$$', label: '$$$ (Expensive)' },
              { value: '$$$$', label: '$$$$ (Very Expensive)' },
            ]}
          />
          <Select
            label="Max Delivery Time"
            name="deliveryTime"
            value={activeFilters.deliveryTime}
            onChange={handleFilterChange}
            options={[
              { value: '', label: 'Any Time' },
              { value: '20', label: 'Under 20 min' },
              { value: '30', label: 'Under 30 min' },
              { value: '45', label: 'Under 45 min' },
            ]}
          />
          <div className="flex items-center">
            <input
              id="offers"
              name="offers"
              type="checkbox"
              checked={activeFilters.offers}
              onChange={handleFilterChange}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="offers" className="ml-2 block text-sm text-gray-900">
              Only show offers
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="vegOnly"
              name="vegOnly"
              type="checkbox"
              checked={activeFilters.vegOnly}
              onChange={handleFilterChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="vegOnly" className="ml-2 block text-sm text-gray-900">
              Vegetarian only
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="secondary" onClick={clearFilters}>
            Clear All
          </Button>
          <Button onClick={applyFilters}>
            Show Results
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;