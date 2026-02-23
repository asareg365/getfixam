
'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { getGeneralSettings, updateGeneralSettings } from '@/app/admin/settings/general/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GeneralSettings {
    maintenanceMode: boolean;
    siteBanner: string;
}

export function GeneralSettingsForm() {
  const [settings, setSettings] = useState<GeneralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    getGeneralSettings().then((settings: GeneralSettings) => {
      setSettings(settings);
      setLoading(false);
    });
  }, []);

  const handleToggle = async (field: 'maintenanceMode', value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    setLoading(true);
    try {
      await updateGeneralSettings(newSettings);
      toast({ title: 'Settings updated successfully!' });
    } catch (error) {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
      // Revert UI change on failure
      const oldSettings = { ...settings, [field]: !value };
      setSettings(oldSettings);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: 'siteBanner', value: string) => {
    if (!settings) return;
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
  };

  const handleInputBlur = async () => {
    if (!settings) return;
    setLoading(true);
    try {
      await updateGeneralSettings(settings);
      toast({ title: 'Settings updated successfully!' });
    } catch (error) {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Manage general application settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border">
          <div>
            <Label htmlFor="maintenance-mode" className="font-bold text-base">
              Maintenance Mode
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              If enabled, the entire site will be temporarily unavailable.
            </p>
          </div>
          {loading ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <Switch
              id="maintenance-mode"
              checked={settings?.maintenanceMode || false}
              onCheckedChange={(value) => handleToggle('maintenanceMode', value)}
            />
          )}
        </div>
        <div className="space-y-2">
            <Label htmlFor="site-banner" className="font-bold text-base">
                Site-wide Banner
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
                A banner to display at the top of every page for important announcements.
            </p>
            <Input
                id="site-banner"
                value={settings?.siteBanner || ''}
                onChange={(e) => handleInputChange('siteBanner', e.target.value)}
                onBlur={handleInputBlur}
                placeholder="e.g. ✨ New features available!"
            />
        </div>
      </CardContent>
    </Card>
  );
}
