import { useState, useEffect, useRef } from 'react';
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
  const syncingRef = useRef(false);
  const syncedRef = useRef<Set<string>>(new Set());
  const wasAuthenticatedRef = useRef<boolean>(false);
  const importingRef = useRef<Set<string>>(new Set()); // Track ongoing imports by title+content key
  const hasSyncedRef = useRef(false); // Track if syncing has been triggered for current session
  const syncedCountRef = useRef(0); // Track count of synced imports to avoid duplicate cleanup

  // Load guest imports from localStorage on mount
  useEffect(() => {
    const savedImports = localStorage.getItem(GUEST_IMPORTS_KEY);
    const savedCount = localStorage.getItem(GUEST_USAGE_COUNT_KEY);

    if (savedImports) {
      try {
        const parsedImports: GuestImport[] = JSON.parse(savedImports);
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

    // Initialize ref with current authentication state
    wasAuthenticatedRef.current = isAuthenticated;
  }, []);

  // Sync guest imports to server when user logs in (only trigger once on login)
  useEffect(() => {
    // Only sync when user first logs in (isAuthenticated changes from false to true)
    if (isAuthenticated && user && guestImports.length > 0 && !syncingRef.current && !hasSyncedRef.current) {
      hasSyncedRef.current = true;
      syncGuestImportsToServer();
    }
    // Reset flag when user logs out
    if (!isAuthenticated) {
      hasSyncedRef.current = false;
    }
  }, [isAuthenticated, user]);

  // Clear synced guest imports after sync completes
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const savedImports = localStorage.getItem(GUEST_IMPORTS_KEY);
    if (!savedImports) return;

    let currentImports: GuestImport[];
    try {
      currentImports = JSON.parse(savedImports);
    } catch {
      return;
    }

    const syncedCount = currentImports.filter(imp => imp.isSynced).length;
    // Only proceed if synced count changed
    if (syncedCount === 0 || syncedCount === syncedCountRef.current) return;
    
    syncedCountRef.current = syncedCount;

    // Remove synced imports after a short delay to ensure sync completed
    const timer = setTimeout(() => {
      const remainingImports = currentImports.filter(imp => !imp.isSynced);
      setGuestImports(remainingImports);
      syncedCountRef.current = remainingImports.filter(imp => imp.isSynced).length;
      if (remainingImports.length === 0) {
        localStorage.removeItem(GUEST_IMPORTS_KEY);
        localStorage.removeItem(GUEST_USAGE_COUNT_KEY);
        setUsageCount(0);
      } else {
        localStorage.setItem(GUEST_IMPORTS_KEY, JSON.stringify(remainingImports));
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, guestImports]);

  // Clear all guest imports when user logs out (only when transitioning from authenticated to unauthenticated)
  useEffect(() => {
    // Only clear if user was previously authenticated and now is not
    if (wasAuthenticatedRef.current && !isAuthenticated) {
      // User logged out, clear all guest imports
      setGuestImports([]);
      setUsageCount(0);
      localStorage.removeItem(GUEST_IMPORTS_KEY);
      localStorage.removeItem(GUEST_USAGE_COUNT_KEY);
      syncedRef.current.clear();
    }
    // Update ref to track current authentication state
    wasAuthenticatedRef.current = isAuthenticated;
  }, [isAuthenticated]);

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

    const importKey = `${title.trim()}|${content.trim()}`;
    
    // Prevent duplicate API calls - if already importing, throw error
    if (importingRef.current.has(importKey)) {
      throw new Error('Import already in progress');
    }

    // Mark as importing immediately to prevent duplicate calls
    importingRef.current.add(importKey);

    try {
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

      // Add to state and localStorage
      setGuestImports((prevImports) => {
        const updatedImports = [...prevImports, newImport];
        localStorage.setItem(GUEST_IMPORTS_KEY, JSON.stringify(updatedImports));
        return updatedImports;
      });

      setUsageCount(prev => {
        const newCount = prev + 1;
        localStorage.setItem(GUEST_USAGE_COUNT_KEY, newCount.toString());
        return newCount;
      });

      return newImport;
    } finally {
      // Remove from importing set
      importingRef.current.delete(importKey);
    }
  };

  const syncGuestImportsToServer = async () => {
    if (!isAuthenticated || syncingRef.current) return;

    // Get current guest imports from localStorage to ensure we have the latest
    const savedImports = localStorage.getItem(GUEST_IMPORTS_KEY);
    if (!savedImports) return;

    let currentImports: GuestImport[];
    try {
      currentImports = JSON.parse(savedImports);
    } catch {
      return;
    }

    if (currentImports.length === 0) return;

    syncingRef.current = true;

    try {
      // Import the API function dynamically to avoid circular dependencies
      const { importMeetingCapsule } = await import('../services/api/meetingCapsule');

      const unsyncedImports = currentImports.filter(
        imp => !imp.isSynced && !syncedRef.current.has(imp.id)
      );

      if (unsyncedImports.length === 0) {
        syncingRef.current = false;
        return;
      }

      // Sync each unsynced import sequentially to avoid race conditions
      for (const guestImport of unsyncedImports) {
        try {
          // Mark as syncing to prevent duplicates
          syncedRef.current.add(guestImport.id);

          const response = await importMeetingCapsule({
            title: guestImport.title,
            content: guestImport.content,
            metadata: {
              guestImportedAt: guestImport.createdAt,
            },
          });

          if (response.success) {
            // Mark as synced
            const updatedImports = currentImports.map(imp =>
              imp.id === guestImport.id ? { ...imp, isSynced: true } : imp
            );
            currentImports = updatedImports;
            setGuestImports(updatedImports);
            localStorage.setItem(GUEST_IMPORTS_KEY, JSON.stringify(updatedImports));
          } else {
            // Failed to sync, remove from synced set to retry later
            syncedRef.current.delete(guestImport.id);
          }
        } catch (error) {
          console.error(`Failed to sync guest import ${guestImport.id}:`, error);
          // Failed to sync, remove from synced set to retry later
          syncedRef.current.delete(guestImport.id);
        }
      }
    } catch (error) {
      console.error('Failed to sync guest imports:', error);
    } finally {
      syncingRef.current = false;
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
