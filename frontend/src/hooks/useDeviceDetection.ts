import { useState, useEffect } from 'react';

interface AppStoreLinks {
  downloadUrl: string;
  platform: 'ios' | 'android' | 'desktop';
  storeName: string;
}

export const useDeviceDetection = (): AppStoreLinks => {
  const [deviceInfo, setDeviceInfo] = useState<AppStoreLinks>({
    downloadUrl: 'https://play.google.com/store/apps/details?id=tr.com.akinsoft.hasanustakebap&hl=tr',
    platform: 'desktop',
    storeName: 'Google Play'
  });

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // iOS Detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      setDeviceInfo({
        downloadUrl: 'https://apps.apple.com/tr/app/hasan-usta-kebap-izgara/id6446633952',
        platform: 'ios',
        storeName: 'App Store'
      });
    }
    // Android Detection
    else if (/android/i.test(userAgent)) {
      setDeviceInfo({
        downloadUrl: 'https://play.google.com/store/apps/details?id=tr.com.akinsoft.hasanustakebap&hl=tr',
        platform: 'android',
        storeName: 'Google Play'
      });
    }
    // Desktop - Default to Google Play
    else {
      setDeviceInfo({
        downloadUrl: 'https://play.google.com/store/apps/details?id=tr.com.akinsoft.hasanustakebap&hl=tr',
        platform: 'desktop',
        storeName: 'Google Play'
      });
    }
  }, []);

  return deviceInfo;
}; 