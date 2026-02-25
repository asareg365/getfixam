import { getAdminAuth, initializeAdminApp } from '../src/lib/firebase-admin.ts';

initializeAdminApp();

async function createAdminSessionCookie() {
    const auth = getAdminAuth();
    // This UID must be an existing admin user in your Firebase Auth project.
    const adminUid = 'Fh3o1Vj9hTcyo9w9uF7vB1g5c0f2'; 
    const expiresIn = 60 * 60 * 1000; // 1 hour

    try {
        // Set the custom claim required by the middleware
        await auth.setCustomUserClaims(adminUid, { portal: 'admin' });

        // Create the session cookie
        const sessionCookie = await auth.createSessionCookie(adminUid, { expiresIn });

        console.log('Admin session cookie:');
        console.log(sessionCookie);

    } catch (error) {
        console.error('Error creating admin session cookie:', error);
    }
}

createAdminSessionCookie();
