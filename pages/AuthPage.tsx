import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Input from '../components/Input';
import Button from '../components/Button';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { User } from '../types';
import { mockUser, mockAddresses, mockPaymentMethods } from '../constants';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('AuthPage must be used within an AppContext.Provider');
  }

  const { setUser, setAddresses, setPaymentMethods, showNotification } = context;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Simulate login API call
        if (email === mockUser.email && password === 'password123') {
          setUser(mockUser);
          setAddresses(mockAddresses);
          setPaymentMethods(mockPaymentMethods);
          showNotification('Login successful!', 'success');
          navigate('/');
        } else {
          setError('Invalid email or password.');
        }
      } else {
        // Simulate signup API call
        if (name && email && password && phone) {
          const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            email,
            phone,
            preferences: [],
            loyaltyPoints: 0,
            membershipLevel: 'None',
          };
          setUser(newUser);
          setAddresses(mockAddresses); // Initialize with mock addresses for new user
          setPaymentMethods(mockPaymentMethods); // Initialize with mock payments for new user
          showNotification('Account created successfully!', 'success');
          navigate('/');
        } else {
          setError('Please fill in all fields.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] py-10">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {!isLogin && (
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          )}
          <Button type="submit" className="w-full py-3 text-lg" loading={loading}>
            {isLogin ? 'Login' : 'Sign Up'}
          </Button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="space-y-3">
          <Button variant="secondary" className="w-full py-3 flex items-center justify-center">
            <FcGoogle className="mr-2 text-2xl" /> Continue with Google
          </Button>
          <Button variant="secondary" className="w-full py-3 flex items-center justify-center">
            <FaFacebook className="mr-2 text-2xl text-blue-600" /> Continue with Facebook
          </Button>
        </div>

        <p className="text-center text-gray-600 mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
              setPhone('');
            }}
            className="text-orange-600 hover:underline font-semibold"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;