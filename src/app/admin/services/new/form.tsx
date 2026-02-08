'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef } from 'react';
import { addServiceAction } from '@/app/admin/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const iconMapList = [
    { name: 'Wrench', icon: 'Wrench' },
    { name: 'Zap', icon: 'Zap' },
    { name: 'Smartphone', icon: 'Smartphone' },
    { name: 'Car', icon: 'Car' },
    { name: 'Hammer', icon: 'Hammer' },
    { name: 'Scissors', icon: 'Scissors' },
    { name: 'Sparkles', icon: 'Sparkles' },
    { name: 'Shirt', icon: 'Shirt' },
    { name: 'Tv2', icon: 'Tv2' },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Add Service
    </Button>
  );
}

export default function AddServiceForm() {
  const [state, formAction] = useActionState(addServiceAction, {
    errors: {},
    success: false,
  });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'Success!',
        description: "Service added successfully!",
      });
      formRef.current?.reset();
    } else if (state.errors && Object.keys(state.errors).length > 0) {
      toast({
        title: 'Error',
        description: "Please correct the errors and try again.",
        variant: 'destructive',
      });
    }
  }, [state, toast]);
  
  if (state.success) {
      return (
        <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
            <h3 className="text-xl font-bold text-green-800 dark:text-green-300">Service Added!</h3>
             <Button asChild className="mt-6">
                <Link href="/admin/services">Back to Services</Link>
            </Button>
        </div>
      )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input id="name" name="name" placeholder="e.g., House Painting" />
        {state.errors?.name && <p className="text-sm text-destructive">{state.errors.name[0]}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Select name="icon">
          <SelectTrigger id="icon">
            <SelectValue placeholder="Select an icon for the service" />
          </SelectTrigger>
          <SelectContent>
            {iconMapList.map((icon) => (
              <SelectItem key={icon.name} value={icon.icon}>{icon.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state.errors?.icon && <p className="text-sm text-destructive">{state.errors.icon[0]}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="basePrice">Base Price (GHS)</Label>
            <Input id="basePrice" name="basePrice" type="number" placeholder="50.00" step="0.01" />
            {state.errors?.basePrice && <p className="text-sm text-destructive">{state.errors.basePrice[0]}</p>}
        </div>
         <div className="flex items-center space-x-2 pt-8">
            <Switch id="active" name="active" defaultChecked={true} />
            <Label htmlFor="active">Active</Label>
             {state.errors?.active && <p className="text-sm text-destructive">{state.errors.active[0]}</p>}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
            <Label htmlFor="minSurge">Min Surge Multiplier</Label>
            <Input id="minSurge" name="minSurge" type="number" placeholder="1.0" step="0.1" defaultValue="1.0" />
            {state.errors?.minSurge && <p className="text-sm text-destructive">{state.errors.minSurge[0]}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="maxSurge">Max Surge Multiplier</Label>
            <Input id="maxSurge" name="maxSurge" type="number" placeholder="1.5" step="0.1" defaultValue="1.5" />
            {state.errors?.maxSurge && <p className="text-sm text-destructive">{state.errors.maxSurge[0]}</p>}
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
