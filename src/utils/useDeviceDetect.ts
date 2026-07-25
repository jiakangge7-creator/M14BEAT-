import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface DeviceInfo {
  deviceType: DeviceType;
  deviceName: string;
  isTouch: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      deviceName: '电脑端',
      isTouch: false,
      screenWidth: 1024,
      screenHeight: 768,
      orientation: 'landscape',
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const orientation = width < height ? 'portrait' : 'landscape';
  const ua = navigator.userAgent || '';
  
  const isTouch =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0;

  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTabletUA = /iPad|Macintosh/i.test(ua) && isTouch; // iPadOS reports Macintosh with multi-touch

  let deviceType: DeviceType = 'desktop';
  let deviceName = '电脑端';

  if (isMobileUA || (width < 640 && isTouch)) {
    deviceType = 'mobile';
    deviceName = '手机端';
  } else if (isTabletUA || (width >= 640 && width < 1024 && isTouch)) {
    deviceType = 'tablet';
    deviceName = '平板端';
  } else if (width < 768) {
    deviceType = 'mobile';
    deviceName = '手机端';
  } else if (width >= 768 && width < 1024) {
    deviceType = 'tablet';
    deviceName = '平板端';
  } else {
    deviceType = 'desktop';
    deviceName = '电脑端';
  }

  return {
    deviceType,
    deviceName,
    isTouch,
    screenWidth: width,
    screenHeight: height,
    orientation,
  };
}

export function useDeviceDetect(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(detectDevice());

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
}
