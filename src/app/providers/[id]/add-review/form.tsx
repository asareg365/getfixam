'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

import type { Provider } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function StarRatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hoverValue, setHoverValue] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHoverValue(star)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} stars`}
        >
          <Star
            className={cn(
              "h-8 w-8 cursor-pointer transition-colors",
              (hoverValue >= star || value >= star) ? 'text-accent' : 'text-muted'
            )}
            fill={(hoverValue >= star || value >= star) ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  );
}

export default function AddReviewForm({ provider }: { provider: Provider }) {
  const [rating, setRating] = useState(0);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const userName = formData.get('userName') as string;
    const comment = formData.get('comment') as string;

    const newErrors: Record<string, string> = {};
    if (!rating) newErrors.rating = 'Please select a rating.';
    if (!userName || userName.length < 2) newErrors.userName = 'Name must be at least 2 characters.';
    if (!comment || comment.length < 10) newErrors.comment = 'Comment must be at least 10 characters.';

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsPending(false);
        return;
    }

    const randomUserImageId = `user${Math.floor(Math.random() * 6) + 1}`;
    const reviewsRef = collection(db, 'reviews');
    const newReviewData = {
        providerId: provider.id,
        userName,
        rating,
        comment,
        userImageId: randomUserImageId,
        status: 'pending',
        createdAt: serverTimestamp(),
    };

    // CRITICAL: Non-blocking mutation with contextual error emission
    addDoc(reviewsRef, newReviewData)
        .then(() => {
            setIsSuccess(true);
            toast({
                title: 'Success!',
                description: 'Thank you! Your review has been submitted for moderation.',
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: reviewsRef.path,
                operation: 'create',
                requestResourceData: newReviewData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setIsPending(false);
        });
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
       <div className="max-w-2xl mx-auto mb-4">
        <Button variant="ghost" asChild>
          <Link href={`/providers/${provider.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {provider.name}
          </Link>
        </Button>
      </div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Leave a Review</CardTitle>
          <CardDescription>
            Share your experience with <span className="font-semibold text-primary">{provider.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
             <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Review Submitted!</h3>
                <p className="mt-2 text-green-700 dark:text-green-400">Thank you! Your review has been submitted for moderation.</p>
                <div className="mt-6 flex justify-center gap-4">
                    <Button asChild>
                        <Link href={`/providers/${provider.id}`}>View Reviews</Link>
                    </Button>
                     <Button asChild variant="outline">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
             </div>
          ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <StarRatingInput value={rating} onChange={setRating} />
              {errors.rating && <p className="text-sm text-destructive">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input id="userName" name="userName" placeholder="e.g., Ama K." required />
              {errors.userName && <p className="text-sm text-destructive">{errors.userName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea id="comment" name="comment" placeholder="Tell us about your experience..." rows={4} required />
              {errors.comment && <p className="text-sm text-destructive">{errors.comment}</p>}
            </div>
            
            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Review'}
            </Button>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
