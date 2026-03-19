
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

interface Result {
  id: string;
  status: string;
  message?: string;
}

export async function POST() {
  const snapshot = await adminDb.collection("providers").get();

  const results: Result[] = [];

  for (const doc of snapshot.docs) {
    const provider = doc.data();

    // Skip if already migrated
    if (provider.uid) {
      results.push({ id: doc.id, status: "already migrated" });
      continue;
    }

    if (!provider.phone) {
      results.push({ id: doc.id, status: "missing phone" });
      continue;
    }

    try {
      // Create Firebase Auth user
      const user = await adminAuth.createUser({
        phoneNumber: `+233${provider.phone}`,
      });

      // Assign provider role
      await adminAuth.setCustomUserClaims(user.uid, {
        role: "provider",
      });

      // Update Firestore document with UID
      await adminDb.collection("providers").doc(doc.id).update({
        uid: user.uid,
      });

      results.push({ id: doc.id, status: "migrated" });
    } catch (error: any) {
      results.push({
        id: doc.id,
        status: "error",
        message: error.message,
      });
    }
  }

  return NextResponse.json(results);
}
