'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import { addReviewAction } from '@/app/providers/actions';
import type { Provider } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, Loader2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Submit Review'}
    </Button>
  );
}

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

  const [state, formAction] = useActionState(addReviewAction, {
    errors: {},
    success: false,
    message: '',
  });
  
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
      setRating(0);
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

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
          {state.success ? (
             <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Review Submitted!</h3>
                <p className="mt-2 text-green-700 dark:text-green-400">{state.message}</p>
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
          <form ref={formRef} action={formAction} className="space-y-6">
            <input type="hidden" name="providerId" value={provider.id} />
            
            <div className="space-y-2">
              <Label>Your Rating</Label>
              <StarRatingInput value={rating} onChange={setRating} />
              <input type="hidden" name="rating" value={rating} />
              {state.errors?.rating && <p className="text-sm text-destructive">{state.errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="userName">Your Name</Label>
              <Input id="userName" name="userName" placeholder="e.g., Ama K." />
              {state.errors?.userName && <p className="text-sm text-destructive">{state.errors.userName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea id="comment" name="comment" placeholder="Tell us about your experience..." rows={4} />
              {state.errors?.comment && <p className="text-sm text-destructive">{state.errors.comment}</p>}
            </div>
            
            <SubmitButton />
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
