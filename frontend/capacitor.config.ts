import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.invoicedesk.app',
  appName: 'Invoice Desk',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: true
    }
  }
};

export default config;
