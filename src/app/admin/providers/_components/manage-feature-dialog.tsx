'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { updateFeatureStatus } from '@/app/admin/actions';
import type { Provider } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
      Save Changes
    </Button>
  );
}

type ManageFeatureDialogProps = {
  provider: Provider;
  children: React.ReactNode;
};

export function ManageFeatureDialog({ provider, children }: ManageFeatureDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [isFeatured, setIsFeatured] = useState(provider.isFeatured || false);
  const [featuredUntil, setFeaturedUntil] = useState<Date | undefined>(
    provider.featuredUntil ? new Date(provider.featuredUntil) : undefined
  );

  const initialState = { success: false, error: undefined, message: undefined };
  const [state, formAction] = useActionState(updateFeatureStatus, initialState);

  useEffect(() => {
    if (state.success && state.message) {
      toast({ title: 'Success', description: state.message });
      setOpen(false);
    } else if (state.error) {
      toast({ title: 'Error', description: state.error, variant: 'destructive' });
    }
  }, [state, toast]);
  
  useEffect(() => {
    if(open) {
        setIsFeatured(provider.isFeatured || false);
        setFeaturedUntil(provider.featuredUntil ? new Date(provider.featuredUntil) : undefined);
    }
  }, [open, provider]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Feature Status</DialogTitle>
          <DialogDescription>
            Set featured status for <span className="font-bold">{provider.name}</span>.
            Featured providers appear at the top of search results.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
            <div className="space-y-6 py-4">
                <input type="hidden" name="providerId" value={provider.id} />
                
                <div className="flex items-center space-x-2">
                    <Switch
                    id="isFeatured"
                    name="isFeatured"
                    checked={isFeatured}
                    onCheckedChange={setIsFeatured}
                    />
                    <Label htmlFor="isFeatured" className="text-base">
                    Is Featured
                    </Label>
                </div>
                
                {isFeatured && (
                    <div className="space-y-2">
                        <Label htmlFor="featuredUntil">Featured Until</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="featuredUntil"
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !featuredUntil && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {featuredUntil ? format(featuredUntil, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={featuredUntil}
                                    onSelect={setFeaturedUntil}
                                    disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <input 
                            type="hidden" 
                            name="featuredUntil" 
                            value={featuredUntil ? featuredUntil.toISOString() : ''} 
                        />
                    </div>
                )}
            </div>
          
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
