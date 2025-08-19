
import { ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AndroidLayoutProps {
  children: ReactNode;
}

export function AndroidLayout({ children }: AndroidLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    // Detect if running in Capacitor/Android
    const isCapacitor = window.location.protocol === 'capacitor:';
    
    if (isCapacitor) {
      // Enable fullscreen mode for robot interface
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
      
      // Prevent zoom on touch devices
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
      
      // Handle orientation changes
      const handleOrientationChange = () => {
        setOrientation(window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
      };
      
      window.addEventListener('orientationchange', handleOrientationChange);
      window.addEventListener('resize', handleOrientationChange);
      handleOrientationChange();
      
      return () => {
        window.removeEventListener('orientationchange', handleOrientationChange);
        window.removeEventListener('resize', handleOrientationChange);
      };
    }
  }, []);

  return (
    <div className={cn(
      "min-h-screen w-full",
      isFullscreen && "android-fullscreen",
      orientation === 'landscape' && "landscape-mode"
    )}>
      <style jsx>{`
        .android-fullscreen {
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
          padding-left: env(safe-area-inset-left);
          padding-right: env(safe-area-inset-right);
        }
        
        .landscape-mode .container {
          max-width: none;
          padding-left: 2rem;
          padding-right: 2rem;
        }
        
        /* Optimize touch targets for robot interface */
        .landscape-mode button {
          min-height: 56px;
          min-width: 120px;
        }
        
        .landscape-mode input,
        .landscape-mode select,
        .landscape-mode textarea {
          min-height: 48px;
          font-size: 16px;
        }
      `}</style>
      {children}
    </div>
  );
}
