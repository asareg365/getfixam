import { ShieldAlert } from 'lucide-react';

export default function ProviderLoginsDisabledPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Provider Logins Disabled</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          For security reasons, provider logins are temporarily disabled. Please try again later.
        </p>
      </div>
    </div>
  );
}
