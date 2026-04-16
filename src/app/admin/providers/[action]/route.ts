
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { providerId } = await req.json();

    const providerRef = adminDb.collection("providers").doc(providerId);
    const providerSnap = await providerRef.get();

    if (!providerSnap.exists) {
      return NextResponse.json({ error: "Provider not found" }, { status: 404 });
    }

    const provider = providerSnap.data()!;

    if (provider.status === "approved") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Generate a 6-digit PIN consistent with the rest of the app
    const pin = Math.floor(100000 + Math.random() * 900000).toString();

    // Create Firebase Auth user
    const authPhone = provider.phone.startsWith('0') 
        ? '+233' + provider.phone.substring(1) 
        : provider.phone;

    let user;
    try {
        user = await adminAuth.getUserByPhoneNumber(authPhone);
    } catch (e) {
        user = await adminAuth.createUser({
            phoneNumber: authPhone,
            displayName: provider.name,
        });
    }

    // Set role claim
    await adminAuth.setCustomUserClaims(user.uid, {
      role: "provider",
    });

    await providerRef.update({
      status: "approved",
      authUid: user.uid,
      loginPin: pin,
      verified: true,
      approvedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      generatedPin: pin,
    });
  } catch (error: any) {
      console.error("Manual Approval Error:", error);
      return NextResponse.json({ error: error.message || "Failed to approve provider" }, { status: 500 });
  }
}
