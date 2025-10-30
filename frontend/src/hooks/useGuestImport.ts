import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface GuestImport {
  id: string;
  title: string;
  content: string; // Original content
  summary?: string; // AI-generated summary
  keyPoints?: string[]; // AI-generated key points
  createdAt: string; // ISO string from server
  isSynced?: boolean;
}

const GUEST_IMPORTS_KEY = 'guest_imports';
const GUEST_USAGE_COUNT_KEY = 'guest_usage_count';
const MAX_GUEST_IMPORTS = 3;

export const useGuestImport = () => {
  const [guestImports, setGuestImports] = useState<GuestImport[]>([]);
  const [usageCount, setUsageCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  // Load guest imports from localStorage on mount
  useEffect(() => {
    const savedImports = localStorage.getItem(GUEST_IMPORTS_KEY);
    const savedCount = localStorage.getItem(GUEST_USAGE_COUNT_KEY);

    if (savedImports) {
      try {
        const parsedImports = JSON.parse(savedImports);
        setGuestImports(parsedImports);
      } catch (error) {
        console.error('Failed to parse guest imports from localStorage:', error);
        localStorage.removeItem(GUEST_IMPORTS_KEY);
      }
    }

    if (savedCount) {
      const count = parseInt(savedCount, 10);
      setUsageCount(count);
    }
  }, []);

  // Sync guest imports to server when user logs in
  useEffect(() => {
    if (isAuthenticated && user && guestImports.length > 0) {
      syncGuestImportsToServer();
    }
  }, [isAuthenticated, user]);

  const canImport = () => {
    return usageCount < MAX_GUEST_IMPORTS;
  };

  const getRemainingImports = () => {
    return Math.max(0, MAX_GUEST_IMPORTS - usageCount);
  };

  const addGuestImport = async (title: string, content: string) => {
    if (!canImport()) {
      throw new Error('Maximum guest imports reached');
    }

    // Import the API function dynamically to avoid circular dependencies
    const { guestImportMeetingCapsule } = await import('../services/api/meetingCapsule');

    // Call AI API to generate capsule
    const response = await guestImportMeetingCapsule({
      title,
      content,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to import capsule');
    }

    const capsuleData = response.data.capsule;

    const newImport: GuestImport = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: capsuleData.title,
      content, // Keep original content for potential re-processing
      summary: capsuleData.summary,
      keyPoints: capsuleData.keyPoints,
      createdAt: capsuleData.createdAt,
      isSynced: false,
    };

    const updatedImports = [...guestImports, newImport];
    setGuestImports(updatedImports);
    setUsageCount(prev => prev + 1);

    // Save to localStorage
    localStorage.setItem(GUEST_IMPORTS_KEY, JSON.stringify(updatedImports));
    localStorage.setItem(GUEST_USAGE_COUNT_KEY, (usageCount + 1).toString());

    return newImport;
  };

  const syncGuestImportsToServer = async () => {
    if (!isAuthenticated || guestImports.length === 0) return;

    try {
      // Import the API function dynamically to avoid circular dependencies
      const { importMeetingCapsule } = await import('../services/api/meetingCapsule');

      const unsyncedImports = guestImports.filter(imp => !imp.isSynced);

      for (const guestImport of unsyncedImports) {
        try {
          // Since the guest import already has AI-generated summary and keyPoints,
          // we can directly create the capsule with the processed data
          const response = await importMeetingCapsule({
            title: guestImport.title,
            content: guestImport.content,
            metadata: {
              guestImportedAt: guestImport.createdAt,
            },
          });

          if (response.success) {
            // Mark as synced
            const updatedImports = guestImports.map(imp =>
              imp.id === guestImport.id ? { ...imp, isSynced: true } : imp
            );
            setGuestImports(updatedImports);
            localStorage.setItem(GUEST_IMPORTS_KEY, JSON.stringify(updatedImports));
          }
        } catch (error) {
          console.error(`Failed to sync guest import ${guestImport.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to sync guest imports:', error);
    }
  };

  const clearGuestImports = () => {
    setGuestImports([]);
    setUsageCount(0);
    localStorage.removeItem(GUEST_IMPORTS_KEY);
    localStorage.removeItem(GUEST_USAGE_COUNT_KEY);
  };

  const removeGuestImport = (id: string) => {
    const updatedImports = guestImports.filter(imp => imp.id !== id);
    setGuestImports(updatedImports);
    localStorage.setItem(GUEST_IMPORTS_KEY, JSON.stringify(updatedImports));
  };

  return {
    guestImports,
    usageCount,
    canImport,
    getRemainingImports,
    addGuestImport,
    syncGuestImportsToServer,
    clearGuestImports,
    removeGuestImport,
    maxImports: MAX_GUEST_IMPORTS,
  };
};
