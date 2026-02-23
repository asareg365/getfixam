'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { updateSecuritySettings } from './actions';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type SecurityFormProps = {
  isLocked: boolean;
  providerLoginsDisabled: boolean;
  reason: string;
  updatedBy: string;
  updatedAt: string;
};

export default function SecurityForm({ 
    isLocked: initialLocked, 
    providerLoginsDisabled: initialDisabled, 
    reason: initialReason, 
    updatedBy, 
    updatedAt 
}: SecurityFormProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const [adminLocked, setAdminLocked] = useState(initialLocked);
  const [providerLoginsDisabled, setProviderLoginsDisabled] = useState(initialDisabled);
  const [reason, setReason] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    try {
        await updateSecuritySettings({
            adminLocked,
            providerLoginsDisabled,
            reason: reason || 'Manual update via admin dashboard.',
        });
        toast({
            title: 'Settings Updated',
            description: 'System security preferences have been applied.',
        });
        setReason(''); // Clear reason after success
    } catch (error) {
        toast({ 
            title: 'Error', 
            description: 'Failed to update security settings. Please ensure you have permission.', 
            variant: 'destructive' 
        });
    } finally {
        setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {initialLocked || initialDisabled ? (
        <Alert variant="destructive" className="rounded-[24px] border-2 bg-destructive/5">
          <ShieldAlert className="h-6 w-6" />
          <AlertTitle className="text-lg font-bold">System Restrictions Active</AlertTitle>
          <AlertDescription className="text-base mt-1">
            Access is currently restricted. Changed by <b>{updatedBy}</b> on {updatedAt}.
            <div className="mt-2 text-sm italic">"{initialReason}"</div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="rounded-[24px] border-2 bg-green-50 border-green-200">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
          <AlertTitle className="text-lg font-bold text-green-800">Systems Operational</AlertTitle>
          <AlertDescription className="text-base mt-1 text-green-700">
            Admin portal and provider logins are functioning normally.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30 border border-muted-foreground/10">
            <div className="space-y-1">
                <Label htmlFor="adminLocked" className="text-lg font-bold">Lock Admin Portal</Label>
                <p className="text-sm text-muted-foreground">When enabled, only Super Admins can log in.</p>
            </div>
            <Switch
                id="adminLocked"
                checked={adminLocked}
                onCheckedChange={setAdminLocked}
                className="data-[state=checked]:bg-destructive"
            />
        </div>
        
        <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30 border border-muted-foreground/10">
            <div className="space-y-1">
                <Label htmlFor="providerLoginsDisabled" className="text-lg font-bold">Disable Artisan Logins</Label>
                <p className="text-sm text-muted-foreground">Temporarily disable all artisan app access.</p>
            </div>
            <Switch
                id="providerLoginsDisabled"
                checked={providerLoginsDisabled}
                onCheckedChange={setProviderLoginsDisabled}
                className="data-[state=checked]:bg-destructive"
            />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="reason" className="text-base font-bold">Update Note / Reason</Label>
        <Textarea
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Scheduled maintenance"
          className="rounded-2xl min-h-[120px] border-muted-foreground/20 text-lg"
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl" 
        disabled={isPending}
        variant={(adminLocked || providerLoginsDisabled) ? "destructive" : "default"}
      >
        {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
        Save Security Settings
      </Button>
    </form>
  );
}