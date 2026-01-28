import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

type StarRatingProps = {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
};

export default function StarRating({ 
  rating, 
  totalStars = 5, 
  size = 16,
  className,
  showText = true,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = totalStars - fullStars - (partialStar > 0 ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center" aria-label={`Rating: ${rating} out of ${totalStars} stars.`}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} fill="hsl(var(--accent))" strokeWidth={0} style={{ width: size, height: size }} />
        ))}
        {partialStar > 0 && (
          <div style={{ position: 'relative', width: size, height: size }}>
            <Star style={{ width: size, height: size }} fill="hsl(var(--muted))" strokeWidth={0} />
            <div style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: `${partialStar * 100}%` }}>
              <Star style={{ width: size, height: size }} fill="hsl(var(--accent))" strokeWidth={0} />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} fill="hsl(var(--muted))" strokeWidth={0} style={{ width: size, height: size }} />
        ))}
      </div>
      {showText && <span className="text-xs font-medium text-foreground/80">{rating.toFixed(1)}</span>}
    </div>
  );
}
