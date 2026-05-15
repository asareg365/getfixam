'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { getCityConfig } from '@/lib/constants';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Business name must be at least 3 characters.' }),
  serviceId: z.string({ required_error: 'Please select a service category.' }),
  phone: z.string().regex(/^0[0-9]{9}$/, { message: 'A valid 10-digit phone number is required (e.g. 0241234567).' }),
  whatsapp: z.string().regex(/^0[0-9]{9}$/, { message: 'A valid 10-digit WhatsApp number is required.' }),
  zone: z.string({ required_error: 'Please select your primary work area.' }),
  digitalAddress: z.string().optional(),
});

type AddProviderFormProps = {
    categories: { id: string; name: string }[];
    zones: string[];
}

export default function AddProviderForm({ categories, zones }: AddProviderFormProps) {
  const { toast } = useToast();
  const params = useParams();
  const cityId = (params.city as string) || 'berekum';
  const cityConfig = getCityConfig(cityId);
  const cityPath = `/${cityId}`;

  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phone: '',
      whatsapp: '',
      digitalAddress: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const providersRef = collection(db, 'providers');
      
      // Duplicate check
      const q = query(providersRef, where('phone', '==', values.phone));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
          toast({
              title: 'Already Listed',
              description: 'A business with this phone number is already registered.',
              variant: 'destructive',
          });
          return;
      }

      const categoryName = categories.find(c => c.id === values.serviceId)?.name || 'Artisan';

      const newProviderData = {
        name: values.name,
        serviceId: values.serviceId,
        category: categoryName,
        phone: values.phone,
        whatsapp: values.whatsapp,
        digitalAddress: values.digitalAddress || '',
        location: {
          region: cityConfig.region,
          city: cityConfig.name,
          zone: values.zone,
        },
        status: 'pending',
        verified: false,
        isFeatured: false,
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
      };

      // CRITICAL: Non-blocking mutation with contextual error emission
      addDoc(providersRef, newProviderData)
        .then(() => {
            setIsSuccess(true);
            toast({
                title: 'Success!',
                description: 'Your business has been submitted for review!',
            });
        })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: providersRef.path,
                operation: 'create',
                requestResourceData: newProviderData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to submit business. Please check your connection and try again.',
        variant: 'destructive',
      });
    }
  }

  if (isSuccess) {
      return (
        <div className="text-center p-10 bg-primary/5 rounded-[32px] border-2 border-dashed border-primary/20">
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary font-headline">Submission Received!</h3>
            <p className="mt-4 text-muted-foreground text-lg font-medium">Your business has been submitted for review! Our team will contact you shortly.</p>
            <Button asChild className="mt-10 rounded-2xl px-10 h-14 font-bold" variant="default">
                <Link href={cityPath}>Back to Home</Link>
            </Button>
        </div>
      );
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-bold">Business Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Kwame Electric Works" {...field} className="h-14 rounded-xl border-muted-foreground/20 text-lg" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-bold">Primary Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-14 rounded-xl border-muted-foreground/20 text-lg">
                                    <SelectValue placeholder="Select a service category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-bold">Phone Number</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="0241234567" {...field} className="h-14 rounded-xl border-muted-foreground/20 text-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-bold">WhatsApp Number</FormLabel>
                            <FormControl>
                                <Input type="tel" placeholder="0551234567" {...field} className="h-14 rounded-xl border-muted-foreground/20 text-lg" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <FormField
                control={form.control}
                name="zone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-bold">Area / Neighborhood</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger className="h-14 rounded-xl border-muted-foreground/20 text-lg">
                                    <SelectValue placeholder="Select your primary work area" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {zones.map((zone) => (
                                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="digitalAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-base font-bold">Digital Address (Optional)</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., GA-123-4567" {...field} className="h-14 rounded-xl border-muted-foreground/20 text-lg" />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                Submit for Review
            </Button>
        </form>
    </Form>
  );
}