'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef } from 'react';
import { addProviderAction } from './actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
      Submit for Review
    </Button>
  );
}

type AddProviderFormProps = {
    categories: { id: string; name: string }[];
    zones: string[];
}

export default function AddProviderForm({ categories, zones }: AddProviderFormProps) {
  const [state, formAction] = useActionState(addProviderAction, {
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
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div>
        {state.success ? (
            <div className="text-center p-10 bg-primary/5 rounded-[32px] border-2 border-dashed border-primary/20">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary font-headline">Submission Received!</h3>
                <p className="mt-4 text-muted-foreground text-lg">{state.message}</p>
                <Button asChild className="mt-10 rounded-2xl px-8" variant="outline">
                    <Link href="/">Back to Home</Link>
                </Button>
            </div>
        ) : (
        <form ref={formRef} action={formAction} className="space-y-8">
        <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-bold">Business Name</Label>
            <Input id="name" name="name" placeholder="e.g., Kwame Electric Works" required className="h-12 rounded-xl border-muted-foreground/20" />
            {state.errors?.name && <p className="text-sm text-destructive font-medium">{state.errors.name}</p>}
        </div>

        <div className="space-y-3">
            <Label htmlFor="category" className="text-base font-bold">Category</Label>
            <Select name="serviceId" required>
            <SelectTrigger id="category" className="h-12 rounded-xl border-muted-foreground/20">
                <SelectValue placeholder="Select a service category" />
            </SelectTrigger>
            <SelectContent>
                {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
            </SelectContent>
            </Select>
            {state.errors?.serviceId && <p className="text-sm text-destructive font-medium">{state.errors.serviceId}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
            <Label htmlFor="phone" className="text-base font-bold">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="0241234567" required className="h-12 rounded-xl border-muted-foreground/20" />
                {state.errors?.phone && <p className="text-sm text-destructive font-medium">{state.errors.phone}</p>}
            </div>
            <div className="space-y-3">
            <Label htmlFor="whatsapp" className="text-base font-bold">WhatsApp Number</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" placeholder="0551234567" required className="h-12 rounded-xl border-muted-foreground/20" />
            {state.errors?.whatsapp && <p className="text-sm text-destructive font-medium">{state.errors.whatsapp}</p>}
            </div>
        </div>
        
        <div className="space-y-3">
            <Label htmlFor="zone" className="text-base font-bold">Area / Neighborhood</Label>
            <Select name="zone" required>
            <SelectTrigger id="zone" className="h-12 rounded-xl border-muted-foreground/20">
                <SelectValue placeholder="Select your primary work area" />
            </SelectTrigger>
            <SelectContent>
                {zones.map((zone) => (
                <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
            </SelectContent>
            </Select>
            {state.errors?.zone && <p className="text-sm text-destructive font-medium">{state.errors.zone}</p>}
        </div>

        <div className="space-y-3">
            <Label htmlFor="digitalAddress" className="text-base font-bold">Digital Address (Optional)</Label>
            <Input id="digitalAddress" name="digitalAddress" placeholder="e.g., GA-123-4567" className="h-12 rounded-xl border-muted-foreground/20" />
            {state.errors?.digitalAddress && <p className="text-sm text-destructive font-medium">{state.errors.digitalAddress}</p>}
        </div>

        <SubmitButton />
        </form>
        )}
    </div>
  );
}