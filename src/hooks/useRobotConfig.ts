
import { useEffect, useState } from 'react';

interface RobotConfig {
  isAndroid: boolean;
  isKioskMode: boolean;
  screenSize: 'small' | 'medium' | 'large';
  orientation: 'portrait' | 'landscape';
  hasHardwareButtons: boolean;
}

export function useRobotConfig(): RobotConfig {
  const [config, setConfig] = useState<RobotConfig>({
    isAndroid: false,
    isKioskMode: false,
    screenSize: 'medium',
    orientation: 'portrait',
    hasHardwareButtons: false
  });

  useEffect(() => {
    const detectRobotEnvironment = () => {
      // Detect if running in Capacitor/Android
      const isCapacitor = window.location.protocol === 'capacitor:';
      const userAgent = navigator.userAgent.toLowerCase();
      const isAndroid = userAgent.includes('android') || isCapacitor;
      
      // Detect kiosk mode (fullscreen without browser chrome)
      const isKioskMode = window.screen.height === window.innerHeight;
      
      // Determine screen size based on viewport
      const screenWidth = window.innerWidth;
      let screenSize: 'small' | 'medium' | 'large' = 'medium';
      if (screenWidth < 768) screenSize = 'small';
      else if (screenWidth > 1200) screenSize = 'large';
      
      // Detect orientation
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
      
      // Check for hardware buttons (Android specific)
      const hasHardwareButtons = isAndroid && window.innerHeight < window.screen.height - 100;
      
      setConfig({
        isAndroid,
        isKioskMode,
        screenSize,
        orientation,
        hasHardwareButtons
      });
    };

    detectRobotEnvironment();
    
    // Listen for orientation and resize changes
    window.addEventListener('resize', detectRobotEnvironment);
    window.addEventListener('orientationchange', detectRobotEnvironment);
    
    return () => {
      window.removeEventListener('resize', detectRobotEnvironment);
      window.removeEventListener('orientationchange', detectRobotEnvironment);
    };
  }, []);

  return config;
}
