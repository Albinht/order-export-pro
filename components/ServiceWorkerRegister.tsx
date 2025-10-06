'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => {
            console.log('Service Worker registered:', reg);
            
            // Check for updates every hour
            setInterval(() => {
              reg.update();
            }, 60 * 60 * 1000);
          })
          .catch(err => console.log('Service Worker registration failed:', err));
      });
    }
  }, []);

  return null;
}
