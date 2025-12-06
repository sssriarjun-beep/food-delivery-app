import React from 'react';
import { HiStar } from 'react-icons/hi';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({ rating, maxStars = 5, className }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const stars = [];
  for (let i = 0; i < maxStars; i++) {
    if (i < fullStars) {
      stars.push(<HiStar key={i} className="text-yellow-400" />);
    } else if (i === fullStars && hasHalfStar) {
      // For simplicity, we'll represent half-star with a full star for now
      // In a more advanced UI, you might use a half-star icon or mask
      stars.push(<HiStar key={i} className="text-yellow-400 opacity-50" />);
    } else {
      stars.push(<HiStar key={i} className="text-gray-300" />);
    }
  }

  return (
    <div className={`flex items-center space-x-0.5 ${className}`}>
      {stars}
      <span className="ml-1 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
};

export default RatingStars;