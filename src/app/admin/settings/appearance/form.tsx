'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { updateAppearanceSettings } from './actions';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type AppearanceFormProps = {
  siteName: string;
  primaryColor: string;
  darkModeEnabled: boolean;
};

export default function AppearanceForm({ 
    siteName: initialSiteName, 
    primaryColor: initialColor, 
    darkModeEnabled: initialDarkMode 
}: AppearanceFormProps) {
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  
  const [siteName, setSiteName] = useState(initialSiteName);
  const [primaryColor, setPrimaryColor] = useState(initialColor);
  const [darkModeEnabled, setDarkModeEnabled] = useState(initialDarkMode);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    try {
        await updateAppearanceSettings({
            siteName,
            primaryColor,
            darkModeEnabled,
        });
        toast({
            title: 'Settings Updated',
            description: 'Appearance preferences have been applied.',
        });
    } catch (error) {
        toast({ 
            title: 'Error', 
            description: 'Failed to update appearance settings.', 
            variant: 'destructive' 
        });
    } finally {
        setIsPending(false);
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-3xl font-black font-headline">Appearance</CardTitle>
        <CardDescription className="text-lg">
          Customize the look and branding of GetFixam.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 py-6">
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="siteName" className="text-base font-bold">Platform Name</Label>
              <Input
                id="siteName"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="e.g. GetFixam Ghana"
                className="rounded-2xl h-14 border-muted-foreground/20 text-lg"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="primaryColor" className="text-base font-bold">Brand Primary Color</Label>
              <div className="flex gap-4 items-center">
                <Input
                  id="primaryColor"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-14 rounded-2xl p-2 cursor-pointer border-muted-foreground/20"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="rounded-2xl h-14 border-muted-foreground/20 text-lg uppercase"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/30 border border-muted-foreground/10">
              <div className="space-y-1">
                <Label htmlFor="darkModeEnabled" className="text-lg font-bold">Dark Mode Support</Label>
                <p className="text-sm text-muted-foreground">Allow the platform to use a dark theme when requested.</p>
              </div>
              <Switch
                id="darkModeEnabled"
                checked={darkModeEnabled}
                onCheckedChange={setDarkModeEnabled}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl" 
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
            Save Appearance Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}