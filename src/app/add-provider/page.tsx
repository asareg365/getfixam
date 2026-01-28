'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addProviderAction } from '@/app/actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CATEGORIES, BEREKUM_ZONES } from '@/lib/data';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const providerSchema = z.object({
  name: z.string().min(3, 'Business name is required.'),
  category: z.string().min(1, 'Please select a category.'),
  phone: z.string().regex(/^0[0-9]{9}$/, 'Enter a valid 10-digit phone number (e.g., 0241234567).'),
  whatsapp: z.string().regex(/^0[0-9]{9}$/, 'Enter a valid 10-digit WhatsApp number (e.g., 0241234567).'),
  zone: z.string().min(3, 'Please select your business location/zone in Berekum.'),
});

type ProviderFormData = z.infer<typeof providerSchema>;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Submit for Review
    </Button>
  );
}

export default function AddProviderPage() {
  const [state, formAction] = useFormState(addProviderAction, {
    errors: {},
    success: false,
    message: '',
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const { register, handleSubmit, formState: { errors }, control, reset } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      name: '',
      category: '',
      phone: '',
      whatsapp: '',
      zone: '',
    },
  });

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: state.message,
      });
      formRef.current?.reset();
      reset();
    } else if (state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, reset]);
  
  const allErrors = { ...errors, ...state.errors };

  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">List your Business</CardTitle>
          <CardDescription>
            Join FixAm Ghana and connect with customers in Berekum. Fill out the form below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.success ? (
             <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                <h3 className="text-xl font-bold text-green-800">Submission Successful!</h3>
                <p className="mt-2 text-green-700">{state.message}</p>
                 <p className="mt-2 text-green-600">Our team will review your submission and get back to you.</p>
                <Button asChild className="mt-6">
                    <Link href="/">Back to Home</Link>
                </Button>
             </div>
          ) : (
          <form ref={formRef} action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input id="name" name="name" placeholder="e.g., Kwame Electric Works" />
              {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category">
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a service category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
               {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" placeholder="0241234567" />
                 {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input id="whatsapp" name="whatsapp" type="tel" placeholder="0551234567" />
                {state.errors?.whatsapp && <p className="text-sm text-destructive">{state.errors.whatsapp}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="zone">Area / Zone</Label>
              <Select name="zone">
                <SelectTrigger id="zone">
                  <SelectValue placeholder="Select your location/zone in Berekum" />
                </SelectTrigger>
                <SelectContent>
                  {BEREKUM_ZONES.map((zone) => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.zone && <p className="text-sm text-destructive">{state.errors.zone}</p>}
            </div>

            <SubmitButton />
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
