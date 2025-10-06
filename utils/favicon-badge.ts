/**
 * Updates the favicon with a notification badge
 * @param count Number to display in the badge (0 to remove badge)
 */
export function updateFaviconBadge(count: number) {
  // Get or create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 32;
  canvas.height = 32;

  // Draw the base favicon
  const img = new Image();
  img.src = '/favicon.svg';
  
  img.onload = () => {
    // Draw base icon
    ctx.drawImage(img, 0, 0, 32, 32);
    
    if (count > 0) {
      // Draw notification badge
      const badgeRadius = 8;
      const badgeX = 24;
      const badgeY = 8;
      
      // Badge background (green for uploads)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(badgeX, badgeY, badgeRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Badge border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Badge text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Display count or 9+ for large numbers
      const displayText = count > 9 ? '9+' : count.toString();
      ctx.fillText(displayText, badgeX, badgeY);
    }
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
                 document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    
    if (!document.querySelector("link[rel*='icon']")) {
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  };
}

/**
 * Creates an animated favicon for active uploads
 */
export function animateFaviconForUploads(hasUploads: boolean) {
  if (!hasUploads) {
    // Reset to default favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = '/favicon.svg';
    }
    return;
  }

  // Create pulsing effect
  let opacity = 0.5;
  let increasing = true;
  
  const animate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 32;
    canvas.height = 32;

    // Draw base with opacity
    ctx.globalAlpha = 0.3 + opacity * 0.7;
    
    // Background circle
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fill();
    
    // Camera icon
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('📸', 16, 16);
    
    // Update favicon
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || 
                 document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = canvas.toDataURL();
    
    if (!document.querySelector("link[rel*='icon']")) {
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    
    // Update opacity for animation
    if (increasing) {
      opacity += 0.05;
      if (opacity >= 1) {
        opacity = 1;
        increasing = false;
      }
    } else {
      opacity -= 0.05;
      if (opacity <= 0.3) {
        opacity = 0.3;
        increasing = true;
      }
    }
  };
  
  // Run animation every 100ms
  const intervalId = setInterval(animate, 100);
  
  // Store interval ID for cleanup
  (window as any).__faviconAnimationInterval = intervalId;
  
  // Initial draw
  animate();
}

/**
 * Stop favicon animation
 */
export function stopFaviconAnimation() {
  const intervalId = (window as any).__faviconAnimationInterval;
  if (intervalId) {
    clearInterval(intervalId);
    delete (window as any).__faviconAnimationInterval;
  }
  
  // Reset to default favicon
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (link) {
    link.href = '/favicon.svg';
  }
}
