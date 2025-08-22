import JSZip from 'jszip';

interface IconSize {
  name: string;
  size: number;
  purpose?: string;
}

interface SplashSize {
  name: string;
  width: number;
  height: number;
  purpose?: string;
}

const iconSizes: IconSize[] = [
  // Essential icons
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },

  // Additional MVP icons
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

// Basic icon sizes for non-manifest mode (includes common sizes)
const basicIconSizes: IconSize[] = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'icon-48x48.png', size: 48 },
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-256x256.png', size: 256 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
];

const splashSizes: SplashSize[] = [
  // iPhone X, XS, 11 Pro
  { name: 'splash-1125x2436.png', width: 1125, height: 2436 },
  // iPhone XR, 11
  { name: 'splash-828x1792.png', width: 828, height: 1792 },
  // iPhone XS Max, 11 Pro Max
  { name: 'splash-1242x2688.png', width: 1242, height: 2688 },
  // iPhone 12 mini, 13 mini
  { name: 'splash-1080x2340.png', width: 1080, height: 2340 },
  // iPhone 12, 12 Pro, 13, 13 Pro, 14
  { name: 'splash-1170x2532.png', width: 1170, height: 2532 },
  // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
  { name: 'splash-1284x2778.png', width: 1284, height: 2778 },
  // iPhone 14 Pro
  { name: 'splash-1179x2556.png', width: 1179, height: 2556 },
  // iPhone 14 Pro Max
  { name: 'splash-1290x2796.png', width: 1290, height: 2796 },
  // iPad
  { name: 'splash-1536x2048.png', width: 1536, height: 2048 },
  // iPad Pro 11"
  { name: 'splash-1668x2388.png', width: 1668, height: 2388 },
  // iPad Pro 12.9"
  { name: 'splash-2048x2732.png', width: 2048, height: 2732 },
];

export async function generateIcon(
  svgElement: SVGElement,
  backgroundColor: string,
  iconColor: string,
  size: number,
  borderRadius: number = 0.2, // 20% by default
  paddingRatio: number = 0.2, // 20% padding by default
  isLucideIcon: boolean = true, // true for Lucide icons, false for uploaded SVGs
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

    if (isLucideIcon) {
      // Lucide icons are stroke-based, so we need to handle them specially
      // Set stroke color and ensure no fill for proper rendering
      clonedSvg.setAttribute('stroke', iconColor);
      clonedSvg.setAttribute('fill', 'none');
      clonedSvg.setAttribute('stroke-width', '2');
      clonedSvg.setAttribute('stroke-linecap', 'round');
      clonedSvg.setAttribute('stroke-linejoin', 'round');

      // Apply the same to all child elements
      const elements = clonedSvg.querySelectorAll('*');
      elements.forEach(el => {
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
    } else {
      // For uploaded SVGs, apply color transformation using DOM manipulation for reliability

      // Process all elements that should have fill colors
      const elementsToColor = clonedSvg.querySelectorAll(
        'path, circle, ellipse, rect, polygon, polyline',
      );
      elementsToColor.forEach(element => {
        const fill = element.getAttribute('fill');
        const stroke = element.getAttribute('stroke');

        // If element has fill and it's not 'none', replace with iconColor
        if (fill && fill !== 'none') {
          element.setAttribute('fill', iconColor);
        }
        // If element has stroke and it's not 'none', replace with iconColor
        if (stroke && stroke !== 'none') {
          element.setAttribute('stroke', iconColor);
        }
        // If element has no fill or stroke, add fill with iconColor
        if (!fill && !stroke) {
          element.setAttribute('fill', iconColor);
        }
      });

      // Debug: log the transformed SVG
      console.log(
        'Transformed SVG for canvas:',
        new XMLSerializer().serializeToString(clonedSvg),
      );
    }

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

      // Calculate icon size and position with custom padding
      const padding = size * paddingRatio;
      const iconSize = size - padding * 2;
      const x = padding;
      const y = padding;

      // Draw the icon
      ctx.drawImage(img, x, y, iconSize, iconSize);

      canvas.toBlob(blob => {
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

export async function generateSplashScreen(
  svgElement: SVGElement,
  backgroundColor: string,
  iconColor: string,
  width: number,
  height: number,
  borderRadius: number = 0.2,
  paddingRatio: number = 0.2,
  isLucideIcon: boolean = true, // true for Lucide icons, false for uploaded SVGs
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }

    canvas.width = width;
    canvas.height = height;

    // Clone the SVG element
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    clonedSvg.setAttribute('width', '24');
    clonedSvg.setAttribute('height', '24');

    if (isLucideIcon) {
      // Lucide icons are stroke-based, so we need to handle them specially
      clonedSvg.setAttribute('stroke', iconColor);
      clonedSvg.setAttribute('fill', 'none');
      clonedSvg.setAttribute('stroke-width', '2');
      clonedSvg.setAttribute('stroke-linecap', 'round');
      clonedSvg.setAttribute('stroke-linejoin', 'round');

      // Apply the same to all child elements
      const elements = clonedSvg.querySelectorAll('*');
      elements.forEach(el => {
        if (el instanceof SVGElement) {
          el.setAttribute('stroke', iconColor);
          el.setAttribute('fill', 'none');
          if (!el.hasAttribute('stroke-width')) {
            el.setAttribute('stroke-width', '2');
          }
        }
      });
    } else {
      // For uploaded SVGs, apply color transformation using DOM manipulation for reliability

      // Process all elements that should have fill colors
      const elementsToColor = clonedSvg.querySelectorAll(
        'path, circle, ellipse, rect, polygon, polyline',
      );
      elementsToColor.forEach(element => {
        const fill = element.getAttribute('fill');
        const stroke = element.getAttribute('stroke');

        // If element has fill and it's not 'none', replace with iconColor
        if (fill && fill !== 'none') {
          element.setAttribute('fill', iconColor);
        }
        // If element has stroke and it's not 'none', replace with iconColor
        if (stroke && stroke !== 'none') {
          element.setAttribute('stroke', iconColor);
        }
        // If element has no fill or stroke, add fill with iconColor
        if (!fill && !stroke) {
          element.setAttribute('fill', iconColor);
        }
      });

      // Debug: log the transformed SVG
      console.log(
        'Transformed SVG for canvas:',
        new XMLSerializer().serializeToString(clonedSvg),
      );
    }

    // Create SVG data URL
    const svgString = new XMLSerializer().serializeToString(clonedSvg);
    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

    const img = new Image();
    img.onload = () => {
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Detect iPhone devices by dimensions (iPhone screens are typically taller than wide)
      const isIPhone = height > width && height > 1700; // iPhone screens are typically > 1700px tall
      const iconSizeMultiplier = isIPhone ? 1.5 : 1.0;

      // Calculate icon size and position (centered, responsive to screen size)
      const minDimension = Math.min(width, height);
      const iconContainerSize = minDimension * 0.3 * iconSizeMultiplier; // Icon container is 30% of smallest dimension, 1.5x for iPhone
      const iconSize = iconContainerSize * (1 - paddingRatio * 2);
      const containerX = (width - iconContainerSize) / 2;
      const containerY = (height - iconContainerSize) / 2;

      // Draw rounded rectangle for icon background (optional, can be same as background)
      const radius = iconContainerSize * borderRadius;
      ctx.fillStyle = backgroundColor;
      ctx.beginPath();
      ctx.moveTo(containerX + radius, containerY);
      ctx.lineTo(containerX + iconContainerSize - radius, containerY);
      ctx.quadraticCurveTo(
        containerX + iconContainerSize,
        containerY,
        containerX + iconContainerSize,
        containerY + radius,
      );
      ctx.lineTo(
        containerX + iconContainerSize,
        containerY + iconContainerSize - radius,
      );
      ctx.quadraticCurveTo(
        containerX + iconContainerSize,
        containerY + iconContainerSize,
        containerX + iconContainerSize - radius,
        containerY + iconContainerSize,
      );
      ctx.lineTo(containerX + radius, containerY + iconContainerSize);
      ctx.quadraticCurveTo(
        containerX,
        containerY + iconContainerSize,
        containerX,
        containerY + iconContainerSize - radius,
      );
      ctx.lineTo(containerX, containerY + radius);
      ctx.quadraticCurveTo(
        containerX,
        containerY,
        containerX + radius,
        containerY,
      );
      ctx.closePath();
      ctx.fill();

      // Calculate icon position (centered in the container)
      const iconX = containerX + (iconContainerSize - iconSize) / 2;
      const iconY = containerY + (iconContainerSize - iconSize) / 2;

      // Draw the icon
      ctx.drawImage(img, iconX, iconY, iconSize, iconSize);

      canvas.toBlob(blob => {
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

export async function generateIco(
  pngBlobs: { size: number; blob: Blob }[],
): Promise<Blob> {
  // For now, we'll use the 32x32 PNG as favicon
  // A proper ICO generator would combine multiple sizes
  const favicon = pngBlobs.find(p => p.size === 32);
  if (favicon) {
    return favicon.blob;
  }
  return pngBlobs[0].blob;
}

export function generateManifest(
  backgroundColor: string,
  themeColor: string,
  appName: string = 'MVP Icon Generator',
  appShortName: string = 'MVP Icon Generator',
): string {
  const manifest = {
    name: appName,
    short_name: appShortName,
    icons: [
      ...iconSizes
        .filter(
          size =>
            !size.name.includes('favicon') && !size.name.includes('apple'),
        )
        .map(({ name, size, purpose }) => ({
          src: `/${name}`,
          sizes: `${size}x${size}`,
          type: 'image/png',
          ...(purpose && { purpose }),
        })),
    ],
    theme_color: themeColor,
    background_color: backgroundColor,
    display: 'standalone',
    start_url: '/',
    scope: '/',
  };

  return JSON.stringify(manifest, null, 2);
}

export function generateHtmlMeta(
  themeColor: string,
  includeManifest: boolean = false,
  appName: string = 'Your App Name',
): string {
  if (!includeManifest) {
    return `<!-- Primary Meta Tags -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- Theme Color -->
<meta name="theme-color" content="${themeColor}">`;
  }

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
<meta name="theme-color" content="${themeColor}">

<!-- iOS Safari PWA Configuration -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${appName}">

<!-- iOS Safari Splash Screens -->
<!-- iPhone X, XS, 11 Pro -->
<link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone XR, 11 -->
<link rel="apple-touch-startup-image" href="/splash-828x1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)">

<!-- iPhone XS Max, 11 Pro Max -->
<link rel="apple-touch-startup-image" href="/splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone 12 mini, 13 mini -->
<link rel="apple-touch-startup-image" href="/splash-1080x2340.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone 12, 12 Pro, 13, 13 Pro, 14 -->
<link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone 12 Pro Max, 13 Pro Max, 14 Plus -->
<link rel="apple-touch-startup-image" href="/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone 14 Pro -->
<link rel="apple-touch-startup-image" href="/splash-1179x2556.png" media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPhone 14 Pro Max -->
<link rel="apple-touch-startup-image" href="/splash-1290x2796.png" media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)">

<!-- iPad -->
<link rel="apple-touch-startup-image" href="/splash-1536x2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)">

<!-- iPad Pro 11" -->
<link rel="apple-touch-startup-image" href="/splash-1668x2388.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)">

<!-- iPad Pro 12.9" -->
<link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)">`;
}

export async function generateAllIcons(
  svgElement: SVGElement,
  backgroundColor: string,
  iconColor: string,
  borderRadius: number = 0.2,
  paddingRatio: number = 0.2,
  appName: string = 'MVP Icon Generator',
  appShortName: string = 'MVP Icon Generator',
  includeManifest: boolean = false,
  isLucideIcon: boolean = true, // true for Lucide icons, false for uploaded SVGs
): Promise<JSZip> {
  const zip = new JSZip();
  const pngBlobs: { size: number; blob: Blob }[] = [];

  // Choose icon sizes based on manifest mode
  const sizesToGenerate = includeManifest ? iconSizes : basicIconSizes;

  // Generate PNG icons
  for (const { name, size } of sizesToGenerate) {
    const blob = await generateIcon(
      svgElement,
      backgroundColor,
      iconColor,
      size,
      borderRadius,
      paddingRatio,
      isLucideIcon,
    );
    pngBlobs.push({ size, blob });
    zip.file(name, blob);
  }

  // Generate splash screens only if manifest is enabled
  if (includeManifest) {
    for (const { name, width, height } of splashSizes) {
      const blob = await generateSplashScreen(
        svgElement,
        backgroundColor,
        iconColor,
        width,
        height,
        borderRadius,
        paddingRatio,
        isLucideIcon,
      );
      zip.file(name, blob);
    }
  }

  // Generate favicon.ico
  const icoBlob = await generateIco(pngBlobs);
  zip.file('favicon.ico', icoBlob);

  // Generate manifest.json only if requested
  if (includeManifest) {
    const manifest = generateManifest(
      backgroundColor,
      backgroundColor,
      appName,
      appShortName,
    );
    zip.file('manifest.json', manifest);
  }

  // Generate HTML meta tags
  const htmlMeta = generateHtmlMeta(backgroundColor, includeManifest, appName);
  zip.file('html-meta-tags.txt', htmlMeta);

  // Generate README
  const readme = includeManifest
    ? `# MVP Icons

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
- MVP Icons: 48x48 to 1024x1024
- Maskable Icons: 192x192, 512x512
- iOS Safari Splash Screens: iPhone X to iPhone 14 Pro Max, iPad variants

Generated with MVP Icon Generator`
    : `# Basic Icons

This package contains essential icons for your website.

## Installation

1. Copy all image files to your public directory
2. Copy the contents of html-meta-tags.txt to your HTML <head>

## Icon Sizes Included

- Favicons: 16x16, 32x32, favicon.ico
- Icons: 48x48 to 512x512

Generated with MVP Icon Generator`;

  zip.file('README.txt', readme);

  return zip;
}
