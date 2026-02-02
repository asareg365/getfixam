'use server';

import type { Provider } from './types';
import { admin } from './firebase-admin';
import { logProviderAction } from './audit-log';

type RuleStatus = 'OK' | 'SUSPEND' | 'LOCK';

/**
 * Evaluates a provider's status based on a set of rules.
 * @param provider The provider data object.
 * @returns The status determined by the rules.
 */
export function evaluateProvider(provider: Provider): RuleStatus {
  // Example rule: Suspend if performance score is below 40
  if (provider.performanceScore && provider.performanceScore < 40) {
    return 'SUSPEND';
  }

  // Example rule: Lock account after too many failed logins
  if (provider.failedLogins && provider.failedLogins >= 5) {
      return 'LOCK';
  }

  return 'OK';
}

/**
 * Executes an action based on the evaluated provider status.
 * @param providerId The ID of the provider.
 * @param status The status returned by evaluateProvider.
 * @param reason A description of why the action was taken.
 */
export async function executeProviderAction(providerId: string, status: RuleStatus, reason: string) {
  if (status === 'OK') {
    return;
  }

  const updateData: { status: 'suspended' | 'locked' } = { status: 'suspended' };
  let actionLog: string = 'AUTO_SUSPENDED';

  if (status === 'LOCK') {
    // For now, 'LOCK' will also set status to 'suspended'. This can be expanded later.
    updateData.status = 'suspended'; 
    actionLog = 'AUTO_LOCKED';
  }

  try {
    await admin.firestore().collection('providers').doc(providerId).update(updateData);
    
    await logProviderAction({
        providerId: providerId,
        action: actionLog,
        ipAddress: 'SYSTEM',
        userAgent: `Rule: ${reason}`,
    });

  } catch (error) {
    console.error(`Failed to execute action '${status}' for provider ${providerId}:`, error);
  }
}
