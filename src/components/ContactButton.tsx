'use client';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button, type ButtonProps } from '@/components/ui/button';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import type { Provider } from '@/lib/types';

interface ContactButtonProps extends Omit<ButtonProps, 'type'> {
  provider: Provider;
  type: 'call' | 'whatsapp';
  children: React.ReactNode;
}

export function ContactButton({ provider, type, children, ...props }: ContactButtonProps) {
  const handleClick = () => {
    const jobsRef = collection(db, 'jobs');
    const jobData = {
      providerId: provider.id,
      assignedTo: provider.name,
      serviceType: provider.category,
      area: provider.location.zone,
      status: 'CONTACTED',
      contactMethod: type,
      createdAt: serverTimestamp(),
    };

    // CRITICAL: Non-blocking mutation with contextual error emission
    addDoc(jobsRef, jobData).catch(async (err) => {
      if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
        const permissionError = new FirestorePermissionError({
          path: jobsRef.path,
          operation: 'create',
          requestResourceData: jobData
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      }
    });

    // Proceed with initiating contact
    if (type === 'call') {
      window.location.href = `tel:${provider.phone}`;
    } else {
      const url = `https://wa.me/233${provider.whatsapp.slice(1)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Button onClick={handleClick} {...props}>
      {children}
    </Button>
  );
}
