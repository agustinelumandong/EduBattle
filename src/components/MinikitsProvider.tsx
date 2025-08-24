'use client'

import { ReactNode, useEffect, useState } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

interface MiniKitProviderProps {
  children: ReactNode;
}

export default function MiniKitProvider({ children }: MiniKitProviderProps) {
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  
  useEffect(() => {
    const appId = 'app_quiz_blockchain_challenge';
    
    try {
      MiniKit.install(appId);
      setIsInstalled(MiniKit.isInstalled());
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