'use server'

import { adminDb } from "@/lib/firebase-admin";

export async function getGeneralSettings() {
  const doc = await adminDb.collection('system_settings').doc('general').get();
  const data = doc.data() as { maintenanceMode: boolean; siteBanner: string } | undefined;
  return {
    maintenanceMode: data?.maintenanceMode || false,
    siteBanner: data?.siteBanner || '',
  };
}

export async function updateGeneralSettings(settings: { maintenanceMode: boolean; siteBanner: string }) {
  await adminDb.collection('system_settings').doc('general').set(settings, { merge: true });
}