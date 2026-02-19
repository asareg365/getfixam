'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getSecuritySettings, updateSecuritySettings } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [loginsDisabled, setLoginsDisabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getSecuritySettings().then(settings => {
      setLoginsDisabled(settings.providerLoginsDisabled || false);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (value: boolean) => {
    setLoginsDisabled(value);
    setLoading(true);
    try {
        await updateSecuritySettings({ providerLoginsDisabled: value });
        toast({ title: 'Settings updated successfully!' });
    } catch (error) {
        toast({ title: 'Failed to update settings', variant: 'destructive' });
        // Revert UI change on failure
        setLoginsDisabled(!value);
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Manage system-wide security configurations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border">
          <div>
            <Label htmlFor="provider-logins" className="font-bold text-base">
              Disable Artisan Logins
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              If enabled, all artisans will be prevented from logging into their dashboards.
            </p>
          </div>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Switch
              id="provider-logins"
              checked={loginsDisabled}
              onCheckedChange={handleToggle}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
