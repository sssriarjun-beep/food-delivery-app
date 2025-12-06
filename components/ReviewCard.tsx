import React from 'react';
import { Review } from '../types';
import RatingStars from './RatingStars';
import { HiUserCircle } from 'react-icons/hi';

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const reviewDate = new Date(review.reviewTime).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 mb-4">
      <div className="flex items-center mb-3">
        <HiUserCircle className="text-gray-400 text-3xl mr-3" />
        <div>
          <p className="font-semibold text-gray-800">{review.userName}</p>
          <RatingStars rating={review.rating} />
        </div>
      </div>
      <p className="text-gray-700 mb-3">{review.comment}</p>
      {review.imageUrl && (
        <img src={review.imageUrl} alt="Review attachment" className="rounded-md object-cover h-24 w-24 mb-3" />
      )}
      <p className="text-sm text-gray-500">Reviewed on {reviewDate}</p>
    </div>
  );
};

export default ReviewCard;