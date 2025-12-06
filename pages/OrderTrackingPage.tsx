import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../App';
import { Order, OrderStatus } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { HiCheckCircle, HiTruck, HiHome, HiClock } from 'react-icons/hi2';
import { FaKitchenSet } from "react-icons/fa6"; // For 'Preparing' stage
import { mockRestaurants } from '../constants'; // Fix: Imported mockRestaurants

// Mock order data for demonstration
const mockOrder: Order = {
  id: 'order-123',
  userId: 'user-123',
  restaurantId: 'r1',
  items: [], // Simplified for tracking page
  totalAmount: 45.00,
  deliveryAddress: {
    id: 'addr-1',
    tag: 'Home',
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    country: 'USA',
  },
  paymentMethod: 'Credit/Debit Card' as any, // Simplified
  orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
  status: OrderStatus.CONFIRMED,
  trackingUpdates: [
    {
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      status: OrderStatus.PENDING,
      message: 'Order placed successfully.',
    },
    {
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      status: OrderStatus.CONFIRMED,
      message: 'Restaurant confirmed your order.',
    },
    {
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      status: OrderStatus.PREPARING,
      message: 'Your food is being prepared.',
    },
  ],
};


const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const context = useContext(AppContext);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const statusSteps = [
    { status: OrderStatus.PENDING, label: 'Order Placed', icon: HiClock },
    { status: OrderStatus.CONFIRMED, label: 'Confirmed', icon: HiCheckCircle },
    { status: OrderStatus.PREPARING, label: 'Preparing Food', icon: FaKitchenSet },
    { status: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: HiTruck },
    { status: OrderStatus.DELIVERED, label: 'Delivered', icon: HiHome },
  ];

  useEffect(() => {
    // In a real app, you'd fetch the order details by orderId from an API
    // and ideally listen to real-time updates (e.g., via websockets).
    const fetchOrder = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrder(mockOrder); // Using mock order for now
      setLoading(false);

      // Simulate real-time updates
      let currentStatusIndex = statusSteps.findIndex(step => step.status === mockOrder.status);
      const interval = setInterval(() => {
        if (currentStatusIndex < statusSteps.length - 1) {
          currentStatusIndex++;
          const nextStatus = statusSteps[currentStatusIndex].status;
          setOrder(prevOrder => {
            if (prevOrder) {
              const newUpdate = {
                timestamp: new Date().toISOString(),
                status: nextStatus,
                message: `Order is now ${nextStatus}.`,
              };
              return {
                ...prevOrder,
                status: nextStatus,
                trackingUpdates: [...(prevOrder.trackingUpdates || []), newUpdate],
              };
            }
            return prevOrder;
          });
        } else {
          clearInterval(interval);
        }
      }, 10000); // Update every 10 seconds

      return () => clearInterval(interval); // Cleanup on unmount
    };

    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);


  if (loading) {
    return <LoadingSpinner className="h-64" />;
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Order Not Found</h2>
        <p className="text-gray-600">The order you are looking for does not exist or has been completed.</p>
        <Button className="mt-6" onClick={() => context?.showNotification('Order Not Found!', 'error')}>Go to Home</Button>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.findIndex(step => step.status === order.status);

  return (
    <div className="container mx-auto bg-white rounded-lg shadow-md p-6 md:p-8">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Track Your Order</h1>
      <p className="text-lg text-gray-700 mb-6">Order ID: <span className="font-semibold text-orange-600">{order.id}</span></p>

      {/* Progress Tracker */}
      <div className="relative mb-10">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full"></div>
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-green-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
        ></div>
        <div className="relative flex justify-between">
          {statusSteps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center text-center w-1/5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${index <= currentStatusIndex ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700'}
                  ${index === currentStatusIndex && order.status !== OrderStatus.DELIVERED ? 'animate-pulse' : ''}
                `}
              >
                <step.icon className="text-xl" />
              </div>
              <p className={`text-sm md:text-base ${index <= currentStatusIndex ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Update */}
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-8 rounded-md">
        <p className="font-semibold text-orange-800">Latest Update:</p>
        <p className="text-gray-700">
          {order.trackingUpdates?.[order.trackingUpdates.length - 1]?.message || 'No updates yet.'}
          <span className="text-sm text-gray-500 ml-2">
            ({new Date(order.trackingUpdates?.[order.trackingUpdates.length - 1]?.timestamp || '').toLocaleTimeString()})
          </span>
        </p>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Delivery Information</h3>
          <p className="text-gray-700"><strong>Address:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
          <p className="text-gray-700"><strong>Instructions:</strong> {order.deliveryAddress.instructions || 'N/A'}</p>
          <p className="text-gray-700"><strong>Estimated Delivery:</strong> {order.status === OrderStatus.DELIVERED ? 'Delivered' : 'Within 10-15 minutes'}</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">Order Summary</h3>
          <p className="text-gray-700"><strong>Restaurant:</strong> {mockRestaurants.find(r => r.id === order.restaurantId)?.name}</p>
          <p className="text-gray-700"><strong>Items:</strong> {order.items.length} dishes</p>
          <p className="text-gray-700"><strong>Payment:</strong> {order.paymentMethod}</p>
          <p className="text-gray-700 text-xl font-bold text-orange-600">Total: ${order.totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center text-gray-500 mb-8">
        <p className="text-lg">Delivery Map Placeholder (Live tracking map would go here)</p>
      </div>

      <div className="flex justify-center space-x-4">
        <Button variant="secondary" onClick={() => context?.showNotification('Contacting support...', 'info')}>
          Contact Support
        </Button>
        {order.status !== OrderStatus.DELIVERED && (
          <Button variant="danger" onClick={() => context?.showNotification('Order cancellation requested.', 'warning')}>
            Cancel Order
          </Button>
        )}
        {order.status === OrderStatus.DELIVERED && (
          <Button onClick={() => context?.showNotification('Order reordered successfully!', 'success')}>
            Reorder
          </Button>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingPage;