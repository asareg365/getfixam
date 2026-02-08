'use client';

import { useState, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type AddProviderFormProps = {
    categories: { id: string; name: string }[];
    zones: string[];
}

export default function AddProviderForm({ categories, zones }: AddProviderFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Basic Validation
    const newErrors: Record<string, string> = {};
    if (!data.name || String(data.name).length < 3) newErrors.name = 'Business name must be at least 3 characters.';
    if (!data.phone || !/^0[0-9]{9}$/.test(String(data.phone))) newErrors.phone = 'A valid 10-digit phone number is required.';
    if (!data.whatsapp || !/^0[0-9]{9}$/.test(String(data.whatsapp))) newErrors.whatsapp = 'A valid 10-digit WhatsApp number is required.';
    
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsPending(false);
        return;
    }

    try {
      // Check for duplicate phone number
      const providersRef = collection(db, 'providers');
      const q = query(providersRef, where('phone', '==', data.phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
          toast({
              title: 'Already Listed',
              description: 'A business with this phone number is already registered.',
              variant: 'destructive',
          });
          setIsPending(false);
          return;
      }

      // Add to Firestore
      await addDoc(collection(db, 'providers'), {
        name: data.name,
        serviceId: data.serviceId,
        phone: data.phone,
        whatsapp: data.whatsapp,
        digitalAddress: data.digitalAddress || '',
        location: {
          region: 'Bono Region',
          city: 'Berekum',
          zone: data.zone,
        },
        status: 'pending',
        verified: false,
        isFeatured: false,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
      });

      setIsSuccess(true);
      toast({
        title: 'Success!',
        description: 'Your business has been submitted for review!',
      });
    } catch (error: any) {
      console.error('Error adding provider:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit business. Please check your connection and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  }

  if (isSuccess) {
      return (
        <div className="text-center p-10 bg-primary/5 rounded-[32px] border-2 border-dashed border-primary/20">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary font-headline">Submission Received!</h3>
            <p className="mt-4 text-muted-foreground text-lg">Your business has been submitted for review! Our team will contact you shortly.</p>
            <Button asChild className="mt-10 rounded-2xl px-8" variant="outline">
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
      );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-bold">Business Name</Label>
            <Input id="name" name="name" placeholder="e.g., Kwame Electric Works" required className="h-12 rounded-xl border-muted-foreground/20" />
            {errors.name && <p className="text-sm text-destructive font-medium">{errors.name}</p>}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
            <Label htmlFor="phone" className="text-base font-bold">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="0241234567" required className="h-12 rounded-xl border-muted-foreground/20" />
                {errors.phone && <p className="text-sm text-destructive font-medium">{errors.phone}</p>}
            </div>
            <div className="space-y-3">
            <Label htmlFor="whatsapp" className="text-base font-bold">WhatsApp Number</Label>
            <Input id="whatsapp" name="whatsapp" type="tel" placeholder="0551234567" required className="h-12 rounded-xl border-muted-foreground/20" />
            {errors.whatsapp && <p className="text-sm text-destructive font-medium">{errors.whatsapp}</p>}
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
        </div>

        <div className="space-y-3">
            <Label htmlFor="digitalAddress" className="text-base font-bold">Digital Address (Optional)</Label>
            <Input id="digitalAddress" name="digitalAddress" placeholder="e.g., GA-123-4567" className="h-12 rounded-xl border-muted-foreground/20" />
        </div>

        <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            Submit for Review
        </Button>
    </form>
  );
}