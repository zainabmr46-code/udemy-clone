import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, size = 14, showNumber = true }) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
          />
        ))}
      </span>
      {showNumber && <span className="text-sm text-gray-600 dark:text-gray-400">{rating.toFixed(1)}</span>}
    </span>
  );
};

export default StarRating;
