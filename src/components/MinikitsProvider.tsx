'use client'

import { MiniKit } from '@worldcoin/minikit-js';
import { ReactNode, useEffect, useState } from 'react';

interface MiniKitProviderProps {
  children: ReactNode;
}

export default function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  
  useEffect(() => {
    const appId = 'app_quiz_blockchain_challenge';
    
    try {
      // Initialize MiniKit
      MiniKit.install(appId);
      
      // Check installation after a brief delay to ensure proper initialization
      const checkInstallation = () => {
        const installed = MiniKit.isInstalled();
         
        setIsInstalled(installed);
      };
      
      // Check immediately and after a delay
      checkInstallation();
      setTimeout(checkInstallation, 500);
      
    } catch (error) {
      console.error('Failed to install MiniKit:', error);
      setIsInstalled(false);
    }
  }, []);
  
  return (
    <div data-minikit-installed={isInstalled}>
      {children}
    </div>
  );
}