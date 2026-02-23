import SecurityForm from './form';
import { getSecuritySettings } from './actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function SecuritySettingsPage() {
  const settings = await getSecuritySettings();

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-3xl font-black font-headline">Security Control</CardTitle>
        <CardDescription className="text-lg">
          Emergency overrides and system-wide access controls.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-6">
        <SecurityForm 
          isLocked={settings.adminLocked}
          providerLoginsDisabled={settings.providerLoginsDisabled}
          reason={settings.reason}
          updatedBy={settings.updatedBy}
          updatedAt={settings.updatedAt}
        />
      </CardContent>
    </Card>
  );
}