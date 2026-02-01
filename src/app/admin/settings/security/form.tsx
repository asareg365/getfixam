'use client';

import { useFormStatus } from 'react-dom';
import { useActionState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldAlert } from 'lucide-react';
import { updateLockoutStatus } from './actions';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type SecurityFormProps = {
  isLocked: boolean;
  reason: string;
  updatedBy: string;
  updatedAt: string;
};

function SubmitButton({ isLocked }: { isLocked: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={isLocked ? 'default' : 'destructive'} className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {isLocked ? 'Enable Admin Access' : 'Disable Admin Access'}
    </Button>
  );
}

export default function SecurityForm({ isLocked, reason, updatedBy, updatedAt }: SecurityFormProps) {
  const [state, formAction] = useActionState(updateLockoutStatus, { success: false, message: '', errors: {} });
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.message) {
      toast({
        title: 'Success!',
        description: state.message,
        variant: isLocked ? 'destructive' : 'default',
      });
    } else if (!state.success && state.message) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, isLocked]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {isLocked && (
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Admin Access is Currently DISABLED</AlertTitle>
          <AlertDescription>
            All admin pages and APIs are blocked. Last changed by {updatedBy} on {updatedAt}.
            <br />
            <strong>Reason:</strong> {reason}
          </AlertDescription>
        </Alert>
      )}
       {!isLocked && (
        <Alert>
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Admin Access is Currently ENABLED</AlertTitle>
          <AlertDescription>
            All systems are operating normally. Last change by {updatedBy || 'system'} on {updatedAt || 'initial setup'}.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-3 rounded-md border p-4">
        <Label htmlFor="adminLocked" className="flex-1 text-lg font-semibold">
          {isLocked ? 'Unlock Admin Access' : 'Lock Admin Access'}
        </Label>
        <Switch
          id="adminLocked"
          name="adminLocked"
          defaultChecked={!isLocked}
          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-destructive"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Change</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="e.g., 'Performing system maintenance' or 'Disabling due to suspicious activity.'"
          required
        />
        {state.errors?.reason && <p className="text-sm text-destructive">{state.errors.reason[0]}</p>}
      </div>

      <SubmitButton isLocked={isLocked} />
    </form>
  );
}
