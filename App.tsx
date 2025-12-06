import React, { useState, useEffect, createContext, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import { User, Address, Restaurant, Dish, CartItem, Order, PaymentMethod } from './types';
import { mockRestaurants, mockDishes, mockUser, mockAddresses, mockPaymentMethods } from './constants';
import NotificationBell from './components/NotificationBell'; // Fix: Changed to default import

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addresses: Address[];
  setAddresses: React.Dispatch<React.SetStateAction<Address[]>>;
  paymentMethods: PaymentMethod[];
  setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
  restaurants: Restaurant[];
  dishes: Dish[];
  addToCart: (dish: Dish, quantity: number, variants?: Record<string, string>, addOns?: string[]) => void;
  updateCartItem: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  activeOrder: Order | null;
  setActiveOrder: React.Dispatch<React.SetStateAction<Order | null>>;
  showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : mockUser;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const savedAddresses = localStorage.getItem('addresses');
    // Fix: mockUser does not have 'addresses' property directly, use mockAddresses constant.
    return savedAddresses ? JSON.parse(savedAddresses) : (mockAddresses || []); 
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const savedPayments = localStorage.getItem('paymentMethods');
    // Fix: mockUser does not have 'paymentMethods' property directly, use mockPaymentMethods constant.
    return savedPayments ? JSON.parse(savedPayments) : (mockPaymentMethods || []);
  });
  const [restaurants] = useState<Restaurant[]>(mockRestaurants);
  const [dishes] = useState<Dish[]>(mockDishes);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'info' | 'success' | 'warning' | 'error'; id: number } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('addresses', JSON.stringify(addresses));
  }, [addresses]);

  useEffect(() => {
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  }, [paymentMethods]);

  const showNotification = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const id = Date.now();
    setNotification({ message, type, id });
    setTimeout(() => {
      setNotification(prev => (prev && prev.id === id ? null : prev));
    }, 3000);
  }, []);

  const addToCart = useCallback((dish: Dish, quantity: number, variants?: Record<string, string>, addOns?: string[]) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        item => item.dish.id === dish.id &&
                JSON.stringify(item.variants) === JSON.stringify(variants) &&
                JSON.stringify(item.addOns) === JSON.stringify(addOns)
      );

      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { id: Date.now().toString(), dish, quantity, variants, addOns }];
      }
    });
    showNotification(`${quantity}x ${dish.name} added to cart!`, 'success');
  }, [showNotification]);

  const updateCartItem = useCallback((itemId: string, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== itemId);
      }
      return prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    showNotification('Item removed from cart.', 'info');
  }, [showNotification]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    clearCart();
    setAddresses([]);
    setPaymentMethods([]);
    setActiveOrder(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    localStorage.removeItem('addresses');
    localStorage.removeItem('paymentMethods');
    showNotification('Logged out successfully.', 'info');
    navigate('/auth');
  }, [clearCart, navigate, showNotification, setAddresses, setPaymentMethods, setActiveOrder]);

  const contextValue: AppContextType = {
    user,
    setUser,
    cart,
    setCart,
    addresses,
    setAddresses,
    paymentMethods,
    setPaymentMethods,
    restaurants,
    dishes,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    activeOrder,
    setActiveOrder,
    showNotification,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header onLogout={handleLogout} />
        {notification && (
          <NotificationBell
            message={notification.message}
            type={notification.type}
          />
        )}
        <main className="flex-grow p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurant/:id" element={<RestaurantDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/order-tracking/:orderId" element={<OrderTrackingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            {/* Add more routes here */}
          </Routes>
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  );
};

export default App;