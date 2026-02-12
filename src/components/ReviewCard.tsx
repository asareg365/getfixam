import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import StarRating from './StarRating';
import type { Review } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { formatDistanceToNow } from 'date-fns';

type ReviewCardProps = {
  review: Review;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  const userImage = PlaceHolderImages.find(p => p.id === review.userImageId);
  
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden bg-muted/20">
      <CardHeader className="flex flex-row items-start gap-4 p-6">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={userImage?.imageUrl} alt={review.userName} data-ai-hint={userImage?.imageHint} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">{review.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="space-y-0.5">
              <p className="font-bold text-lg">{review.userName}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-primary/5">
                <StarRating rating={review.rating} size={14} showText={true} />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <p className="text-foreground/80 leading-relaxed font-medium bg-white/50 p-4 rounded-2xl italic">
            "{review.comment}"
        </p>
      </CardContent>
    </Card>
  );
}
