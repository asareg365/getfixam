import { redirect } from 'next/navigation';

/**
 * Root Redirector
 * Defaults users to the Berekum tenant while allowing direct access to /accra.
 */
export default function RootPage() {
  redirect('/berekum');
}
