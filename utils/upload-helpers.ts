/**
 * Extract uploaded images from line item properties
 */
export function extractUploadedImages(properties?: Array<{ name: string; value: string }> | null): string[] {
  const uploadedPhotos: string[] = [];
  
  if (!properties) return uploadedPhotos;
  
  properties.forEach(prop => {
    let value = prop.value?.trim();
    if (!value) return;
    
    // Clean HTML tags and entities if present
    value = value
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    
    // Try to extract URL from the value
    // Sometimes URLs are embedded in text like "Upload: https://..."
    let extractedUrl: string | null = null;
    
    // Check if value is a direct URL
    if (value.startsWith('http://') || value.startsWith('https://')) {
      extractedUrl = value;
    } 
    // Check if URL is embedded in the value (match URLs with various patterns)
    else {
      // Try to find URL in various formats
      const patterns = [
        /https?:\/\/[^\s<>"']+/g,  // Standard URL
        /href="([^"]+)"/g,          // href attribute
        /url\(([^)]+)\)/g,          // CSS url()
        /src="([^"]+)"/g            // src attribute
      ];
      
      for (const pattern of patterns) {
        const matches = value.matchAll(pattern);
        for (const match of matches) {
          const url = match[1] || match[0];
          if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
            extractedUrl = url;
            break;
          }
        }
        if (extractedUrl) break;
      }
    }
    
    // Clean up the URL if found
    if (extractedUrl) {
      // Remove any trailing quotes, brackets, etc.
      extractedUrl = extractedUrl
        .replace(/['">\]}\)]+$/, '')
        .replace(/^['"<\[{\(]+/, '')
        .trim();
    }
    
    // Add URL if it's an image URL (be more permissive)
    if (extractedUrl && extractedUrl.startsWith('http')) {
      // Check if it's likely an image based on URL patterns
      const isLikelyImage = 
        extractedUrl.includes('uploadkit') ||
        extractedUrl.includes('upload') ||
        extractedUrl.includes('cdn.shopify.com') ||
        extractedUrl.includes('cloudinary') ||
        extractedUrl.includes('imgur') ||
        extractedUrl.includes('/uploads/') ||
        extractedUrl.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|JPG|PNG|JPEG)(\?|$)/i) ||
        (prop.name.toLowerCase().includes('upload') || 
         prop.name.toLowerCase().includes('image') ||
         prop.name.toLowerCase().includes('photo') ||
         prop.name.toLowerCase().includes('customization'));
      
      if (isLikelyImage && !uploadedPhotos.includes(extractedUrl)) {
        uploadedPhotos.push(extractedUrl);
      }
    }
    
    // Also check for properties with names indicating uploads
    if (prop.name.toLowerCase().includes('upload') || 
        prop.name.toLowerCase().includes('image') ||
        prop.name.toLowerCase().includes('photo') ||
        prop.name.toLowerCase().includes('bild') ||
        prop.name.toLowerCase().includes('picture') ||
        prop.name.toLowerCase().includes('customization') ||
        prop.name.toLowerCase().includes('_customization_url')) {
      if (extractedUrl && !uploadedPhotos.includes(extractedUrl)) {
        uploadedPhotos.push(extractedUrl);
      }
    }
  });
  
  return uploadedPhotos;
}

/**
 * Check if a line item has custom uploads
 */
export function hasCustomUpload(properties?: Array<{ name: string; value: string }> | null): boolean {
  return extractUploadedImages(properties).length > 0;
}

/**
 * Get the first uploaded image URL
 */
export function getFirstUploadedImage(properties?: Array<{ name: string; value: string }> | null): string | null {
  const uploads = extractUploadedImages(properties);
  return uploads.length > 0 ? uploads[0] : null;
}

/**
 * Get custom property value by name (case-insensitive)
 */
export function getCustomProperty(
  properties: Array<{ name: string; value: string }> | undefined | null,
  names: string[]
): string {
  if (!properties) return '';
  
  const prop = properties.find(p => 
    names.some(name => p.name.toLowerCase().includes(name.toLowerCase()))
  );
  
  return prop?.value || '';
}
