import AppearanceForm from './form';
import { getAppearanceSettings } from './actions';

export default async function AppearancePage() {
  const settings = await getAppearanceSettings();

  return (
    <div className="space-y-6">
      <AppearanceForm 
        siteName={settings.siteName}
        primaryColor={settings.primaryColor}
        darkModeEnabled={settings.darkModeEnabled}
      />
    </div>
  );
}