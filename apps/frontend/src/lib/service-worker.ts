'use client';

import { useState, useEffect, useCallback } from 'react';

// Service Worker Manager
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;
  private callbacks: Set<() => void> = new Set();

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.updateAvailable = true;
              this.notifyCallbacks();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
      window.location.reload();
    }
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  onUpdate(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback());
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  hasUpdateAvailable(): boolean {
    return this.updateAvailable;
  }
}

// Global service worker manager instance
export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for service worker functionality
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if service workers are supported
    setIsSupported('serviceWorker' in navigator);

    // Monitor online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setIsOnline(navigator.onLine);

    // Register service worker
    if ('serviceWorker' in navigator) {
      serviceWorkerManager.register().then((reg) => {
        setRegistration(reg);
      });

      // Listen for updates
      const unsubscribe = serviceWorkerManager.onUpdate(() => {
        setUpdateAvailable(true);
      });

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        unsubscribe();
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateServiceWorker = useCallback(async () => {
    await serviceWorkerManager.update();
    setUpdateAvailable(false);
  }, []);

  const clearCache = useCallback(async () => {
    await serviceWorkerManager.clearCache();
  }, []);

  return {
    isOnline,
    isSupported,
    registration,
    updateAvailable,
    updateServiceWorker,
    clearCache
  };
}

export default serviceWorkerManager;