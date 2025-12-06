import React, { useEffect, useState } from 'react';
import { HiCheckCircle, HiInformationCircle, HiExclamationCircle, HiXCircle } from 'react-icons/hi';
import { clsx } from 'clsx'; // Utility for conditional class names

interface NotificationBellProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // Duration in ms before hiding
}

const NotificationBell: React.FC<NotificationBellProps> = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, message, type]);

  if (!isVisible) return null;

  const typeStyles = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  const iconStyles = {
    info: <HiInformationCircle className="h-5 w-5 mr-2" />,
    success: <HiCheckCircle className="h-5 w-5 mr-2" />,
    warning: <HiExclamationCircle className="h-5 w-5 mr-2" />,
    error: <HiXCircle className="h-5 w-5 mr-2" />,
  };

  return (
    <div
      className={clsx(
        'fixed bottom-4 right-4 z-50 p-3 rounded-lg shadow-lg flex items-center',
        'border-l-4 transition-transform duration-300 ease-out transform',
        'animate-slide-in', // Add slide-in animation
        typeStyles[type]
      )}
      role="alert"
    >
      {iconStyles[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default NotificationBell;