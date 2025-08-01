import JSZip from 'jszip';

interface IconSize {
  name: string;
  size: number;
  purpose?: string;
}

const iconSizes: IconSize[] = [
  // Essential icons
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
  
  // Additional PWA icons
  { name: 'icon-48x48.png', size: 48 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-256x256.png', size: 256 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'icon-1024x1024.png', size: 1024 },
  
  // Maskable icons
  { name: 'maskable-icon-192x192.png', size: 192, purpose: 'maskable' },
  { name: 'maskable-icon-512x512.png', size: 512, purpose: 'maskable' },
];

export async function generateIcon(
  svgElement: SVGElement,
  backgroundColor: string,
  iconColor: string,
  size: number,
  borderRadius: number = 0.2 // 20% by default
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    canvas.width = size;
    canvas.height = size;
    
    // Clone the SVG element
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('width', '24');
    clonedSvg.setAttribute('height', '24');
    
    // Lucide icons are stroke-based, so we need to handle them specially
    // Set stroke color and ensure no fill for proper rendering
    clonedSvg.setAttribute('stroke', iconColor);
    clonedSvg.setAttribute('fill', 'none');
    clonedSvg.setAttribute('stroke-width', '2');
    clonedSvg.setAttribute('stroke-linecap', 'round');
    clonedSvg.setAttribute('stroke-linejoin', 'round');
    
    // Apply the same to all child elements
    const elements = clonedSvg.querySelectorAll('*');
    elements.forEach((el) => {
      if (el instanceof SVGElement) {
        // For Lucide icons, we want stroke color and no fill
        el.setAttribute('stroke', iconColor);
        el.setAttribute('fill', 'none');
        
        // Preserve any existing stroke-width
        if (!el.hasAttribute('stroke-width')) {
          el.setAttribute('stroke-width', '2');
        }
      }
    });
    
    // Create SVG data URL
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
    
    const img = new Image();
    img.onload = () => {
      // Draw rounded rectangle background
      const radius = size * borderRadius;
      ctx.fillStyle = backgroundColor;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
      
      // Calculate icon size and position (with 20% padding for better visual balance)
      const padding = size * 0.2;
      const iconSize = size - (padding * 2);
      const x = padding;
      const y = padding;
      
      // Draw the icon
      ctx.drawImage(img, x, y, iconSize, iconSize);
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load SVG'));
    };
    
    img.src = svgDataUrl;
  });
}

export async function generateIco(pngBlobs: { size: number; blob: Blob }[]): Promise<Blob> {
  // For now, we'll use the 32x32 PNG as favicon
  // A proper ICO generator would combine multiple sizes
  const favicon = pngBlobs.find(p => p.size === 32);
  if (favicon) {
    return favicon.blob;
  }
  return pngBlobs[0].blob;
}

export function generateManifest(backgroundColor: string, themeColor: string): string {
  const manifest = {
    name: "App Name",
    short_name: "App",
    icons: [
      ...iconSizes
        .filter(size => !size.name.includes('favicon') && !size.name.includes('apple'))
        .map(({ name, size, purpose }) => ({
          src: `/${name}`,
          sizes: `${size}x${size}`,
          type: "image/png",
          ...(purpose && { purpose })
        }))
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: "standalone",
    start_url: "/",
    scope: "/"
  };
  
  return JSON.stringify(manifest, null, 2);
}

export function generateHtmlMeta(themeColor: string): string {
  return `<!-- Primary Meta Tags -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- Android Chrome Icons -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">

<!-- Web App Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- Theme Color -->
<meta name="theme-color" content="${themeColor}">`;
}

export async function generateAllIcons(
  svgElement: SVGElement,
  backgroundColor: string,
  iconColor: string
): Promise<JSZip> {
  const zip = new JSZip();
  const pngBlobs: { size: number; blob: Blob }[] = [];
  
  // Generate all PNG icons
  for (const { name, size } of iconSizes) {
    const blob = await generateIcon(svgElement, backgroundColor, iconColor, size);
    pngBlobs.push({ size, blob });
    zip.file(name, blob);
  }
  
  // Generate favicon.ico
  const icoBlob = await generateIco(pngBlobs);
  zip.file('favicon.ico', icoBlob);
  
  // Generate manifest.json
  const manifest = generateManifest(backgroundColor, backgroundColor);
  zip.file('manifest.json', manifest);
  
  // Generate HTML meta tags
  const htmlMeta = generateHtmlMeta(backgroundColor);
  zip.file('html-meta-tags.txt', htmlMeta);
  
  // Generate README
  const readme = `# PWA Icons

This package contains all the icons needed for your Progressive Web Application.

## Installation

1. Copy all image files to your public directory
2. Copy the contents of html-meta-tags.txt to your HTML <head>
3. Copy manifest.json to your public directory
4. Update manifest.json with your app's information

## Icon Sizes Included

- Favicons: 16x16, 32x32, favicon.ico
- Apple Touch Icon: 180x180
- Android Chrome: 192x192, 512x512
- PWA Icons: 48x48 to 1024x1024
- Maskable Icons: 192x192, 512x512

Generated with PWA Icon Generator`;
  
  zip.file('README.txt', readme);
  
  return zip;
}