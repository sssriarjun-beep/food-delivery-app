import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Button from './Button';
import Input from './Input';
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiSearch, HiMenu, HiX } from 'react-icons/hi';
import { FaHamburger } from 'react-icons/fa';

interface HeaderProps {
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!context) {
    throw new Error('Header must be used within an AppContext.Provider');
  }
  const { user, cart } = context;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = (
    <>
      <Link to="/" className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition duration-300 md:inline-block md:p-0">Home</Link>
      <Link to="/cart" className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition duration-300 md:inline-block md:p-0">Cart ({cartItemCount})</Link>
      {user ? (
        <>
          <Link to="/profile" className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition duration-300 md:inline-block md:p-0">Profile</Link>
          <Button onClick={onLogout} variant="secondary" className="block w-full text-left py-2 px-4 mt-2 md:mt-0 md:inline-block md:ml-4">Logout</Button>
        </>
      ) : (
        <Link to="/auth" className="block py-2 px-4 text-gray-700 hover:text-orange-500 transition duration-300 md:inline-block md:p-0">Login/Signup</Link>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto p-4 flex items-center justify-between flex-wrap">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-orange-600 text-2xl font-bold">
          <FaHamburger className="text-3xl" />
          <span>FlavorFinds</span>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-grow max-w-lg mx-4">
          <form onSubmit={handleSearch} className="flex w-full">
            <Input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow rounded-r-none border-r-0"
            />
            <Button type="submit" className="rounded-l-none px-4 py-2">
              <HiSearch className="text-xl" />
            </Button>
          </form>
        </div>

        {/* Desktop Navigation & Icons */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition duration-300">
            <HiOutlineShoppingCart className="text-2xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          {user ? (
            <Link to="/profile" className="text-gray-700 hover:text-orange-500 transition duration-300">
              <HiOutlineUserCircle className="text-2xl" />
            </Link>
          ) : (
            <Link to="/auth" className="text-gray-700 hover:text-orange-500 transition duration-300">
              Login
            </Link>
          )}
          {user && (
            <Button onClick={onLogout} variant="secondary">Logout</Button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <Link to="/cart" className="relative text-gray-700 hover:text-orange-500 transition duration-300">
            <HiOutlineShoppingCart className="text-2xl" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <button onClick={toggleMobileMenu} className="text-gray-700 hover:text-orange-500 focus:outline-none">
            {isMobileMenuOpen ? <HiX className="text-3xl" /> : <HiMenu className="text-3xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu & Search */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white p-4 shadow-md pb-6">
          <form onSubmit={handleSearch} className="flex mb-4">
            <Input
              type="text"
              placeholder="Search restaurants or dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow rounded-r-none border-r-0"
            />
            <Button type="submit" className="rounded-l-none px-4 py-2">
              <HiSearch className="text-xl" />
            </Button>
          </form>
          <nav className="flex flex-col space-y-2">
            {navLinks}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;